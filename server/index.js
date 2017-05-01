#!/usr/bin/env node
/**
 * server/index.js
 *
 * @author  Hao Chen <a@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
/* eslint strict: 0, no-process-exit: 0 */
'use strict';
var _            = require('lodash');
var Path         = require('path');
var IsoDist      = require('..');
var Express      = require('express');
var BodyParser   = require('body-parser');
var Cors         = require('cors');
var app          = Express();

app.use(Cors())
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

app.post('/', function(req, res) {
  run(req.body)
    .then(function(data) {
      res.json(_.get(data, 'features[0].geometry'));
    })
    .catch(function(err) {
      res.status(500).send('Something broke!');
    })
});

app.listen(3456, function () {
  console.log('Isodist server listening on port 3000!')
});


// Parse the parameter and call isodist
function run(options) {

  options.data = _.keyBy(options.steps, 'distance');
  options.steps = _.map(options.steps, 'distance');

  _.defaults(options, {
    resolution: 0.1,
    hexSize: 0.5,
  });

  options.map = Path.resolve(__dirname, `../osrm/${options.map}.osrm`);

  return IsoDist(options.origin, options.steps, options);

}
