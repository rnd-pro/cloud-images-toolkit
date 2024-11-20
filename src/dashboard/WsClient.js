import { CFG } from '../node/CFG.js';

export class WsClient {

  static connect() {
    this.ws = new WebSocket(`ws://localhost:${CFG.wsPort}`);
    this.ws.onmessage = ({data}) => {
      /** @type {WsMsg} */
      let wsm = JSON.parse(data);
      if (wsm.cmd === 'UPDATE') {
        this.updateCallbacks.forEach?.(cb => cb());
      } else if (wsm.cmd === 'TEXT') {
        this.textCallbacks.forEach?.(cb => cb(wsm.data));
      }
      // console.log(wsm);
    };
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => {
        this.ws.send('"HELLO FROM CIT-UI"');
        resolve();
      };
      this.ws.onclose = () => {
        console.log('🔴 WS connection closed');
        this.ws = null;
        reject();
      };
    });
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