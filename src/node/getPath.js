import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory where the app is installed
const getAppDir = () => {
  // When running as a global command, __dirname will be in the node_modules directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Navigate up to the app's root directory
  // From src/node/getPath.js to the app root
  return path.resolve(__dirname, '../../');
};

export default function getPath(p) {
  // Use the app's installation directory as the base
  const appDir = getAppDir();
  return path.resolve(appDir, p);
}

export { getPath };