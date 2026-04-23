import net from 'net';

/**
 * @returns {Promise<number>}
 */
export function getFreePort() {
  return new Promise((resolve, reject) => {
    let server = net.createServer();
    server.listen(0, () => {
      let port = /** @type {net.AddressInfo} */ (server.address()).port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

/**
 * @param {number} count
 * @returns {Promise<number[]>}
 */
export async function getFreePorts(count) {
  let ports = [];
  for (let i = 0; i < count; i++) {
    ports.push(await getFreePort());
  }
  return ports;
}
