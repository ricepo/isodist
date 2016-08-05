#!/usr/bin/env node

/**
 * index.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
/* eslint no-loop-func: 1 */
const _            = require('lodash');
const OSRM         = require('osrm');
const Turf         = require('turf');
const Bluebird     = require('bluebird');


const bbox         = require('./bbox');
const cdist        = require('./cdist');
const hexf         = require('./hexf');
const isoln        = require('./isoln');
const log          = require('./util/log');


const osrm = new OSRM('osrm/in.osrm');
Bluebird.promisifyAll(osrm);



async function isodist(origin, stops, options) {
  process.stdout.write('Loading...');


  /**
   * Determine the bounding box and generate point grid
   */
  const box = bbox(origin, _.max(stops));


  /**
   * Compute distances
   */
  const pgrid = await cdist(osrm, origin, Turf.pointGrid(box, options.resolution, 'miles'));


  /**
   * Generate isolines and convert them to polygons
   */
  const isolines = isoln(pgrid, stops, { deburr: options.deburr });
  const hexfit = hexf(isolines, { cellSize: options.hexsize });
  log('Success!');


  return hexfit;
}
module.exports = isodist;
