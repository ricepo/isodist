#!/usr/bin/env node

/**
 * index.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
/* eslint no-loop-func: 1 */
const _            = require('lodash');
const FS           = require('fs');
const OSRM         = require('osrm');
const Turf         = require('turf');
const Bluebird     = require('bluebird');

const Line2poly    = require('turf-line-to-polygon');


const bbox         = require('./bbox');
const cdist        = require('./cdist');
const hexf         = require('./hexf');


const osrm = new OSRM('osrm/in.osrm');
Bluebird.promisifyAll(osrm);
Bluebird.promisifyAll(FS);


const origin = {
  type: 'Point',
  coordinates: [ -86.893386, 40.417202 ]
};

const thresholds = [ 1, 5, 9 ];


function log(data) {
  process.stdout.write(_.padEnd(`\r${data}`, process.stdout.columns));
}


(async function() {
  process.stdout.write('Loading...');



  /**
   * Determine the bounding box and generate point grid
   */
  const box = bbox(origin, _.max(thresholds));


  /**
   * Compute distances
   */
  const pgrid = await cdist(osrm, origin, Turf.pointGrid(box, 0.2, 'miles'));


  /**
   * Generate isolines and convert them to polygons
   */
  log('Computing isolines, this may take a while...');
  const isolines = Turf.isolines(pgrid, 'z', 25, thresholds);

  log('Fitting to hex grid...');
  isolines.features = isolines
    .features
    .map(Line2poly)
    .map(i => hexf(i, origin));


  log('Writing result to file...');
  await FS.writeFileAsync('result.json', JSON.stringify(isolines, null, 2), 'utf8');

  log('Success!');


}());
