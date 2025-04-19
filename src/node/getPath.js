import path from 'path';

export default function getPath(p) {
  return path.resolve(process.cwd(), p);
}

export { getPath };