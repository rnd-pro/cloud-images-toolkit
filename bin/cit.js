#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const scriptPath = resolve(__dirname, '../src/node/serve.js');

let child;

function startServer() {
  child = spawn('node', [scriptPath], { stdio: 'inherit' });

  child.on('error', (err) => {
    console.error('Failed to start CIT:', err);
    process.exit(1);
  });

  child.on('exit', (code) => {
    if (code === 2) {
      console.log('🔄 Restarting CIT server...');
      startServer();
    } else if (code !== 0 && code !== null) {
      process.exit(code);
    } else {
      process.exit(0);
    }
  });
}

startServer();

process.on('SIGINT', () => {
  if (child) child.kill('SIGINT');
  process.exit(0);
}); 