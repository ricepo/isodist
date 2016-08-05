#!/usr/bin/env node
/**
 * bin/isodist.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
const FS           = require('fs');
const Yargs        = require('yargs');
const IsoDist      = require('..');


/**
 * Process CLI arguments
 */
const argv = Yargs

  .demand([ 'lat', 'lon', 'stops' ])

  .describe('stops', 'Distances where to compute isodistance polygons')

  .alias('o', 'output')
  .default('o', 'output.json')

  .alias('r', 'resolution')
  .default('r', 0.2)
  .describe('r', 'Sampling resolution of point grid')

  .alias('h', 'hexsize')
  .default('h', 0.5)
  .describe('h', 'Size of hex grid cells')

  .boolean('deburr')
  .describe('deburr', 'Remove isolated "islands" from isodistance result')

  .argv;


argv.stops = argv.stops.split(',').map(Number);


const origin = {
  type: 'Point',
  coordinates: [ argv.lon, argv.lat ]
};

IsoDist(origin, argv.stops, argv)
  .then(fc => {
    FS.writeFileSync(argv.output, JSON.stringify(fc, null, 2), 'utf8');
  })
  .catch(err => {
    console.error(err.stack);
  });
