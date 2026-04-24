// @ts-ignore - ws package namespace collision with DOM WebSocket type
import { WebSocketServer } from 'ws';
import fs from 'fs';
import http from 'http';
import { configs, ports } from './CFG.js';
import indexHtml from '../ui/index.html.js';
import esbuild from 'esbuild';
import FolderSync, { checkDir } from './FolderSync.js';
import ImsSync from './ImsSync.js';
import { getPath } from './getPath.js';

/** CFG safe for browser — strip sensitive fields, include collections metadata */
let browserConfigs = configs.map((cfg, i) => {
  let safe = { ...cfg };
  delete safe.apiKey;
  return safe;
});

let browserCFG = browserConfigs[0];

const wss = new WebSocketServer({ port: ports.ws });

wss.on('connection', (ws) => {

  /** @type {Partial<Record<WsCmdType, (data: any) => Promise<void>>>} */
  const cmdMap = {
    FETCH: async (data) => {
      let selection = data?.selection || data;
      let idx = data?.collectionIndex ?? 0;
      if (!Array.isArray(selection)) {
        return;
      }
      await FolderSync.fetch(selection, idx);
      ws.send(JSON.stringify({
        cmd: 'UPDATE',
        data: null,
      }));
      ws.send(JSON.stringify({
        cmd: 'TEXT',
        data: 'Remote images are downloaded.',
      }));
    },
    REMOVE: async (data) => {
      let selection = data?.selection || data;
      let idx = data?.collectionIndex ?? 0;
      if (!Array.isArray(selection)) {
        return;
      }
      await FolderSync.remove(selection, idx);
      ws.send(JSON.stringify({
        cmd: 'UPDATE', 
        data: null,
      }));
      ws.send(JSON.stringify({
        cmd: 'TEXT',
        data: 'Selection is removed.',
      }));
    },
    EDIT: async (data) => {
      let update = data?.update || data;
      let idx = data?.collectionIndex ?? 0;
      let cfg = configs[idx];
      let syncData = JSON.parse(fs.readFileSync(cfg.syncDataPath).toString());
      Object.keys(update).forEach((key) => {
        Object.assign(syncData[key], update[key]);
      });
      fs.writeFileSync(cfg.syncDataPath, JSON.stringify(syncData, null, 2));
      ws.send(JSON.stringify({
        cmd: 'TEXT', 
        data: 'Data updated.',
      }));
    },
    SAVE_IMS: async (/** @type {WsMsgData} */ msgData) => {
      let idx = msgData.collectionIndex ?? 0;
      ImsSync.save(msgData.hash, msgData.srcData, idx);
      ws.send(JSON.stringify({
        cmd: 'TEXT',
        data: `IMS descriptor saved to ${msgData.hash}.json`,
      }));
    },
    DELETE_IMS: async (data) => {
      let hash = typeof data === 'string' ? data : data?.hash;
      let idx = data?.collectionIndex ?? 0;
      ImsSync.delete(hash, idx);
      ws.send(JSON.stringify({
        cmd: 'TEXT',
        data: 'IMS descriptor deleted.',
      }));
    },
    PUB_DATA_IMG: async (/** @type {WsMsgData} */ msgData) => {
      await FolderSync.saveImage(msgData.localPath, msgData.imgData);
      ws.send(JSON.stringify({
        cmd: 'TEXT',
        data: 'File saved locally. Uploading to CDN...',
      }));
    },
    SAVE_CONFIG: async (/** @type {WsMsgData} */ msgData) => {
      let idx = msgData.collectionIndex ?? 0;
      let newCfg = msgData.config;
      let rawCfg = JSON.parse(fs.readFileSync('cit-config.json', 'utf8'));
      if (Array.isArray(rawCfg)) {
        rawCfg[idx] = newCfg;
      } else {
        // Fallback for single object configs
        rawCfg = newCfg;
      }
      fs.writeFileSync('cit-config.json', JSON.stringify(rawCfg, null, 2));
      ws.send(JSON.stringify({
        cmd: 'TEXT',
        data: 'Collection profile saved! Restarting CIT server...',
      }));
      setTimeout(() => {
        ws.send(JSON.stringify({
          cmd: 'RELOAD',
          data: null,
        }));
        setTimeout(() => process.exit(2), 200);
      }, 500);
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

console.log(`✅ WS server started on port ${ports.ws}`);

// Ensure sync data files exist for all collections
for (let cfg of configs) {
  if (!fs.existsSync(cfg.syncDataPath)) {
    checkDir(cfg.syncDataPath);
    fs.writeFileSync(cfg.syncDataPath, '{}');
  }
}

const httpServer = http.createServer((req, res) => {
  if (!req.url) {
    res.statusCode = 400;
    res.end('Bad request');
    return;
  }

  // Collections metadata
  if (req.method === 'GET' && req.url === '/collections.json') {
    let list = configs.map((cfg, i) => ({
      index: i,
      name: cfg.name,
      imgSrcFolder: cfg.imgSrcFolder,
    }));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(list));
    return;
  }

  // Sync data per collection: /sync-data/0.json, /sync-data/1.json, etc.
  let syncMatch = req.url.match(/^\/sync-data\/(\d+)\.json$/);
  if (req.method === 'GET' && syncMatch) {
    let idx = parseInt(syncMatch[1], 10);
    if (idx >= 0 && idx < configs.length) {
      res.setHeader('Content-Type', 'application/json');
      res.end(fs.readFileSync(configs[idx].syncDataPath, 'utf8'));
    } else {
      res.statusCode = 404;
      res.end('Collection not found');
    }
    return;
  }

  // IMS data per collection: /ims-data/0.json, /ims-data/1.json, etc.
  let imsMatch = req.url.match(/^\/ims-data\/(\d+)\.json$/);
  if (req.method === 'GET' && imsMatch) {
    let idx = parseInt(imsMatch[1], 10);
    if (idx >= 0 && idx < configs.length) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(ImsSync.getList(idx)));
    } else {
      res.statusCode = 404;
      res.end('Collection not found');
    }
    return;
  }

  if (req.method === 'GET' && req.url.endsWith('CFG.js')) {
    res.setHeader('Content-Type', 'text/javascript');
    res.end(`export const CFG = ${JSON.stringify(browserCFG)};export const configs = ${JSON.stringify(browserConfigs)};export default CFG;`);
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
    // Legacy: return first collection's IMS data
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ImsSync.getList(0)));
  } else if (req.method === 'GET' && req.url.endsWith('.json')) {
    // Legacy: return first collection's sync data
    res.setHeader('Content-Type', 'application/json');
    res.end(fs.readFileSync(configs[0].syncDataPath, 'utf8'));
  } else {
    res.setHeader('Content-Type', 'text/plain');
    res.end('🔴 ERROR');
  }
});

httpServer.listen(ports.http, () => {
  console.log(`✅ HTTP server started on port ${ports.http}`);
  for (let cfg of configs) {
    console.log(`✅ [${cfg.name}] Watching: ${cfg.imgSrcFolder}`);
  }
  console.log(`✅ Cloud Images Toolkit dashboard is available at http://localhost:${ports.http}`);
});

FolderSync.startAll(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        cmd: 'UPDATE',
        data: null,
      }));
      client.send(JSON.stringify({
        cmd: 'TEXT',
        data: 'Uploading finished successfully!',
      }));
    }
  });
});
ImsSync.startAll(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
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
