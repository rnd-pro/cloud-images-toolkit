#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const scriptPath = resolve(__dirname, '../src/node/serve.js');

const child = spawn('node', [scriptPath], { stdio: 'inherit' });

child.on('error', (err) => {
  console.error('Failed to start CIT:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
  process.exit(0);
}); 