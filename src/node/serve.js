// @ts-ignore (namespace collision with "ws" package?)
import { WebSocketServer } from 'ws';
import fs from 'fs';
import http from 'http';
import CFG from './CFG.js';
import indexHtml from '../dashboard/index.html.js';
import esbuild from 'esbuild';
import FolderSync from './FolderSync.js';
const wss = new WebSocketServer({ port: CFG.wsPort });

wss.on('connection', (ws) => {

  /** @type {Partial<Record<WsCmdType, (selection: string[] | Object<string, Partial<CloudImageDescriptor>>) => Promise<void>>>} */
  const cmdMap = {
    FETCH: async (selection) => {
      if (!Array.isArray(selection)) {
        return;
      }
      await FolderSync.fetch(selection);
      ws.send(JSON.stringify({cmd: 'UPDATE', data: null,}));
    },
    REMOVE: async (selection) => {
      if (!Array.isArray(selection)) {
        return;
      }
      await FolderSync.remove(selection);
      ws.send(JSON.stringify({cmd: 'UPDATE', data: null,}));
    },
    EDIT: async (/** @type Object<string, Partial<CloudImageDescriptor>> */ update) => {
      let data = JSON.parse(fs.readFileSync(CFG.syncDataPath).toString());
      Object.keys(update).forEach((key) => {
        Object.assign(data[key], update[key]);
      });
      fs.writeFileSync(CFG.syncDataPath, JSON.stringify(data, null, 2));
      ws.send(JSON.stringify({cmd: 'TEXT', data: 'Data updated.',}));
    },
  };

  ws.on('message', (message) => {
    /** @type {WsMsg} */
    let wsm = JSON.parse(message);
    cmdMap[wsm.cmd]?.(wsm.data);
  });

  // /** @type {WsMsg} */
  // let wsm = {cmd: 'HELLO', data: '🟢 Cloud Images Toolkit is online'};
  // ws.send(JSON.stringify(wsm));

  // ws.on('close', () => {
  //   console.log('🔴 WS connection closed');
  // });

});

console.log(`✅ WS server started on port ${CFG.wsPort}`);

const httpServer = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url.endsWith('CFG.js')) {
    res.setHeader('Content-Type', 'text/javascript');
    res.end(`export const CFG = ${JSON.stringify(CFG)};export default CFG;`);
  } else if (req.method === 'GET' && req.url === '/') {
    let js = esbuild.buildSync({
      entryPoints: ['./src/dashboard/cit-ui.js'],
      bundle: true,
      format: 'esm',
      minify: false,
      sourcemap: false,
      external: ['@symbiotejs/symbiote', '../node/CFG.js'],
      write: false,
    }).outputFiles[0].text;
    res.setHeader('Content-Type', 'text/html');
    res.end(indexHtml.replace('{{SCRIPT}}', `<script type="module">${js}</script>`));
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
