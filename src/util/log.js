/**
 * log.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
const Log          = require('single-line-log');
const Chalk        = require('chalk');

const write        = Log(process.stderr);
const chalk        = new Chalk.constructor({ enabled: true });



function log(data) {
  write(`${chalk.bold.cyan(' .. ')} ${data}`);
}
module.exports = log;


log.success = function(data) {
  write(`${chalk.bold.green(' OK ')} ${data}`);
  console.error('');
};


log.warn = function(data) {
  write(`${chalk.bold.yellow('WARN')} ${data}`);
  console.error('');
};


log.fail = function(data) {
  write(`${chalk.bold.red('FAIL')} ${data}`);
  console.error('');
  const err = new Error(data);
  err.known = true;
  throw err;
};
