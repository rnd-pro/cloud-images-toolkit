import { CFG } from '../node/CFG.js';

export class WsClient {

  static connect() {
    this.ws = new WebSocket(`ws://localhost:${CFG.wsPort}`);
    let connectionTimeout = window.setTimeout(() => {
      console.log('WS connection timeout');
      this.ws.close();
    }, 5000);

    this.ws.onmessage = ({data}) => {
      try {
        let wsm = JSON.parse(data);
        if (wsm.cmd === 'UPDATE') {
          this.updateCallbacks?.forEach(cb => cb());
        } else if (wsm.cmd === 'TEXT') {
          this.textCallbacks?.forEach(cb => cb(wsm.data));
        }
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    return new Promise((resolve, reject) => {
      this.ws.onopen = () => {
        window.clearTimeout(connectionTimeout);
        this.statusCallbacks?.forEach(cb => cb('connected'));
        this.ws.send('"HELLO FROM CIT-UI"');
        resolve();
      };
      this.ws.onclose = () => {
        window.clearTimeout(connectionTimeout);
        console.log('🔴 WS connection closed');
        this.statusCallbacks?.forEach(cb => cb('disconnected'));
        this.ws = null;
        reject(new Error('WS connection closed'));
        
        // Auto-reconnect with 2s delay
        setTimeout(() => {
          if (!this.ws) {
            this.statusCallbacks?.forEach(cb => cb('connecting'));
            this.connect().catch(() => {});
          }
        }, 2000);
      };
      this.ws.onerror = (err) => {
        console.error('WS Error', err);
        // Let onclose handle the reconnect
      };
    });
  }

  /**
   * @param {(status: 'connected' | 'disconnected' | 'connecting') => void} cb 
   */
  static onStatus(cb) {
    if (!this.statusCallbacks) {
      this.statusCallbacks = [];
    }
    this.statusCallbacks.push(cb);
  }

  /** @param {WsMsg} msg */
  static async send(msg) {
    if (!this.ws) {
      await this.connect();
    }
    this.ws.send(JSON.stringify(msg));
  }

  static onUpdate(cb) {
    if (!this.updateCallbacks) {
      this.updateCallbacks = [];
    }
    this.updateCallbacks.push(cb);
  }

  static onText(cb) {
    if (!this.textCallbacks) {
      this.textCallbacks = [];
    }
    this.textCallbacks.push(cb);
  }

  static close() {
    this.ws.close();
    this.updateCallbacks = null;
    this.textCallbacks = null;
  }
}

export default WsClient;