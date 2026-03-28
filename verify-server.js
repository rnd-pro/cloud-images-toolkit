import fs from 'fs';
import { exec } from 'child_process';
const child = exec('node ./src/node/serve.js');
setTimeout(() => {
  let data = JSON.parse(fs.readFileSync('./cit/img-sync-data.json', 'utf8'));
  console.log("Keys found:", Object.keys(data).length);
  child.kill();
}, 2000);
