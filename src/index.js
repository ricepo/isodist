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




const bbox         = require('./bbox');
const cdist        = require('./cdist');
const hexf         = require('./hexf');
const isoln       = require('./isoln');
const log          = require('./util/log');


const osrm = new OSRM('osrm/in.osrm');
Bluebird.promisifyAll(osrm);
Bluebird.promisifyAll(FS);


const origin = {
  type: 'Point',
  coordinates: [ -86.893386, 40.417202 ]
};

const thresholds = [ 1, 5, 9 ];


(async function() {
  process.stdout.write('Loading...');



  /**
   * Determine the bounding box and generate point grid
   */
  const box = bbox(origin, _.max(thresholds));


  /**
   * Compute distances
   */
  const pgrid = await cdist(osrm, origin, Turf.pointGrid(box, 0.1, 'miles'));


  /**
   * Generate isolines and convert them to polygons
   */
  const isolines = isoln(pgrid, thresholds);
  const hexfit = hexf(isolines);


  log('Writing result to file...');
  await FS.writeFileAsync('result.json', JSON.stringify(hexfit, null, 2), 'utf8');

  log('Success!');


}()).catch(err => console.error(err.stack));
