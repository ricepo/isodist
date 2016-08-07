/**
 * util/stdin.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
const Bluebird     = require('bluebird');


function stdin() {
  return new Bluebird(
    (resolve, reject) => {
      const stream = process.stdin;
      const chunks = [ ];

      stream.setEncoding('utf8');

      stream.on('data', d => chunks.push(d));

      stream.on('end', () => {
        if (chunks.length === 0) { resolve(null); }
        const input = chunks.join('');
        resolve(JSON.parse(input));
      });

      stream.on('error', e => reject(e));
    }
  );
}
module.exports = stdin;
