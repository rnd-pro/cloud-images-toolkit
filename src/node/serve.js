#!/usr/bin/env node

// @ts-ignore (namespace collision with "ws" package?)
import { WebSocketServer } from 'ws';
import fs from 'fs';
import http from 'http';
import CFG from './CFG.js';
import indexHtml from '../dashboard/index.html.js';
import esbuild from 'esbuild';
import FolderSync, { checkDir } from './FolderSync.js';
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
      if (!fs.existsSync(CFG.imsDataPath)) {
        checkDir(CFG.imsDataPath);
        fs.writeFileSync(CFG.imsDataPath, '{}');
      }
      let imsData = JSON.parse(fs.readFileSync(CFG.imsDataPath).toString());
      if (imsData[msgData.hash]) {
        ws.send(JSON.stringify({
          cmd: 'TEXT',
          data: 'IMS data for this configuration is already exists.',
        }));
      } else {
        imsData[msgData.hash] = msgData.srcData;
        fs.writeFileSync(CFG.imsDataPath, JSON.stringify(imsData, undefined, 2));
        ws.send(JSON.stringify({
          cmd: 'TEXT',
          data: 'IMS data is saved to local project file.',
        }));
      }
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
    /** @type {WsMsg} */
    let wsm = JSON.parse(message);
    cmdMap[wsm.cmd]?.(wsm.data);
  });

});

console.log(`✅ WS server started on port ${CFG.wsPort}`);

if (!fs.existsSync(CFG.syncDataPath)) {
  checkDir(CFG.syncDataPath);
  fs.writeFileSync(CFG.syncDataPath, '{}');
}

const httpServer = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url.endsWith('CFG.js')) {
    res.setHeader('Content-Type', 'text/javascript');
    res.end(`export const CFG = ${JSON.stringify(CFG)};export default CFG;`);
  } else if (req.method === 'GET' && req.url === '/') {
    let entry = import.meta.url.includes('node_modules') ? './node_modules/cloud-images-toolkit/src/dashboard/cit-ui.js' : './src/dashboard/cit-ui.js';
    let js = esbuild.buildSync({
      entryPoints: [entry],
      bundle: true,
      format: 'esm',
      minify: false,
      sourcemap: false,
      external: ['@symbiotejs/symbiote', 'crypto', '../node/CFG.js', 'interactive-media-spots/wgt/viewer'],
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
