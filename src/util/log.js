/**
 * log.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
const _            = require('lodash');


function log(data) {
  process.stdout.write(_.padEnd(`\r${data}`, process.stdout.columns));
}
module.exports = log;
