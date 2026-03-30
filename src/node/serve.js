// @ts-ignore - ws package namespace collision with DOM WebSocket type
import { WebSocketServer } from 'ws';
import fs from 'fs';
import http from 'http';
import CFG from './CFG.js';
import indexHtml from '../ui/index.html.js';
import esbuild from 'esbuild';
import FolderSync, { checkDir } from './FolderSync.js';
import ImsSync from './ImsSync.js';
import { getPath } from './getPath.js';

/** CFG safe for browser — strip sensitive fields */
let browserCFG = { ...CFG };
delete browserCFG.apiKey;

const wss = new WebSocketServer({ port: CFG.wsPort });

wss.on('connection', (ws) => {

  /** @type {Partial<Record<WsCmdType, (selection: string[] | Object<string, Partial<CloudImageDescriptor>> | WsMsgData) => Promise<void>>>} */
  const cmdMap = {
    FETCH: async (selection) => {
      if (!Array.isArray(selection)) {
        return;
      }
      await FolderSync.fetch(selection);
      ws.send(JSON.stringify({
        cmd: 'UPDATE',
        data: null,
      }));
      ws.send(JSON.stringify({
        cmd: 'TEXT',
        data: 'Remote images are downloaded.',
      }));
    },
    REMOVE: async (selection) => {
      if (!Array.isArray(selection)) {
        return;
      }
      await FolderSync.remove(selection);
      ws.send(JSON.stringify({
        cmd: 'UPDATE', 
        data: null,
      }));
      ws.send(JSON.stringify({
        cmd: 'TEXT',
        data: 'Selection is removed.',
      }));
    },
    EDIT: async (/** @type Object<string, Partial<CloudImageDescriptor>> */ update) => {
      let data = JSON.parse(fs.readFileSync(CFG.syncDataPath).toString());
      Object.keys(update).forEach((key) => {
        Object.assign(data[key], update[key]);
      });
      fs.writeFileSync(CFG.syncDataPath, JSON.stringify(data, null, 2));
      ws.send(JSON.stringify({
        cmd: 'TEXT', 
        data: 'Data updated.',
      }));
    },
    SAVE_IMS: async (/** @type {WsMsgData} */ msgData) => {
      ImsSync.save(msgData.hash, msgData.srcData);
      ws.send(JSON.stringify({
        cmd: 'TEXT',
        data: `IMS descriptor saved to ${msgData.hash}.json`,
      }));
    },
    DELETE_IMS: async (hash) => {
      ImsSync.delete(hash);
      ws.send(JSON.stringify({
        cmd: 'TEXT',
        data: 'IMS descriptor deleted.',
      }));
    },
    PUB_DATA_IMG: async (/** @type {WsMsgData} */ msgData) => {
      await FolderSync.saveImage(msgData.localPath, msgData.imgData);
      ws.send(JSON.stringify({
        cmd: 'UPDATE',
        data: null,
      }));
      ws.send(JSON.stringify({
        cmd: 'TEXT',
        data: 'Source data image is uploaded!',
      }));
    },
  };

  ws.on('message', (message) => {
    try {
      /** @type {WsMsg} */
      let wsm = JSON.parse(message);
      cmdMap[wsm.cmd]?.(wsm.data);
    } catch (err) {
      console.error('🔴 Invalid WS message:', err.message);
    }
  });

});

console.log(`✅ WS server started on port ${CFG.wsPort}`);

if (!fs.existsSync(CFG.syncDataPath)) {
  checkDir(CFG.syncDataPath);
  fs.writeFileSync(CFG.syncDataPath, '{}');
}

const httpServer = http.createServer((req, res) => {
  if (!req.url) {
    res.statusCode = 400;
    res.end('Bad request');
    return;
  }

  if (req.method === 'GET' && req.url.endsWith('CFG.js')) {
    res.setHeader('Content-Type', 'text/javascript');
    res.end(`export const CFG = ${JSON.stringify(browserCFG)};export default CFG;`);
  } else if (req.method === 'GET' && req.url === '/') {
    try {
      let entryUrl = getPath('./src/ui/components/cit-app-shell/cit-ui.js');
      let js = esbuild.buildSync({
        entryPoints: [entryUrl],
        bundle: true,
        format: 'esm',
        minify: false,
        sourcemap: false,
        external: ['@symbiotejs/symbiote', 'immersive-media-spots/wgt/viewer', '*/node/CFG.js', 'crypto'],
        write: false,
      }).outputFiles[0].text;
      res.setHeader('Content-Type', 'text/html');
      res.end(indexHtml.replace('{{SCRIPT}}', `<script type="module">${js}</script>`));
    } catch (err) {
      console.error('🔴 Build error:', err.message);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/html');
      res.end(`<!DOCTYPE html><html><body style="background:#111;color:#f66;font-family:monospace;padding:40px"><h1>⚠️ Build Error</h1><pre>${err.message}</pre></body></html>`);
    }
  } else if (req.method === 'GET' && req.url.endsWith('ims-data.json')) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ImsSync.getList()));
  } else if (req.method === 'GET' && req.url.endsWith('.json')) {
    res.setHeader('Content-Type', 'application/json');
    res.end(fs.readFileSync(CFG.syncDataPath, 'utf8'));
  } else {
    res.setHeader('Content-Type', 'text/plain');
    res.end('🔴 ERROR');
  }
});

httpServer.listen(CFG.httpPort, () => {
  console.log(`✅ HTTP server started on port ${CFG.httpPort}`);
  console.log('✅ Folder synchronization started. Watching for changes in ', CFG.imgSrcFolder);
  console.log(`✅ Cloud Images Toolkit dashboard is available at http://localhost:${CFG.httpPort}`);
});

FolderSync.start();
ImsSync.start(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // 1 is WebSocket.OPEN
      client.send(JSON.stringify({
        cmd: 'UPDATE_IMS',
        data: null,
      }));
    }
  });
});
function shutdown() {
  console.log('\n🟡 Shutting down CIT...');
  wss.close();
  httpServer.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
