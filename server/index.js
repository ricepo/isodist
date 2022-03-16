#!/usr/bin/env node
/**
 * server/index.js
 *
 * @author  Hao Chen <a@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
/* eslint strict: 0, no-process-exit: 0 */
'use strict';
const _            = require('lodash');
const Path         = require('path');
const IsoDist      = require('..');
const Express      = require('express');
const BodyParser   = require('body-parser');
const Cors         = require('cors');

const app          = Express();

app.use(Cors());
app.use(BodyParser.json());
// app.use(BodyParser.urlencoded({ extended: true }));

app.post('/', (req, res) => {
  const time1 = new Date().getTime();
  run(req.body)
    .then((data) => {
      res.json(_.get(data, 'features[0].geometry'));
      const time2 = new Date().getTime();
      console.log('task done====>', (time2 - time1) / 1000, JSON.stringify(req.body));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Something broke!');
    });
});

app.listen(process.env.PORT || 3456, () => {
  console.log('Isodist server listening on port 3456!');
});

/* Must greater than the idle timeout of AWS ELB to prevent 502 bad gateway */
app.keepAliveTimeout = 10 * 60 * 1000;
app.headersTimeout = 11 * 60 * 1000;

// Parse the parameter and call isodist
function run(options) {

  options.data = _.keyBy(options.steps, 'distance');
  options.steps = _.map(options.steps, 'distance');

  /**
   * The resolution and hexSize should >= [0.03, 0.15]
   */
  _.defaults(options, {
    resolution: 0.04,
    hexSize: 0.2
  });


  return IsoDist(options.origin, options.steps, options);

}
