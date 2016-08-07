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

async function isodist(origin, stops, options) {
  log('Loading OSRM...');


  /**
   * Create OSRM router instance
   */
  const osrm = new OSRM(`osrm/${options.map}.osrm`);
  Bluebird.promisifyAll(osrm);
  log.success('Loading OSRM');


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
  const hexfit = hexf(isolines, { cellSize: options.hexSize });


  /**
   * Post-processing
   *  - Sort by reverse distance
   *  - Attach additional data to the feature properties
   */
  log('Post-processing...');
  const post = _
    .chain(hexfit.features)
    .sortBy(i => -i.properties.distance)
    .forEach(i => {
      const data = options.data[i.properties.distance];
      if (!data && options.hadData) {
        console.error(`[WARN] No data found for d=${i.properties.distance}`);
      }
      _.assign(i.properties, data);
    })
    .value();


  log.success('Complete');


  return Turf.featureCollection(post);
}
module.exports = isodist;
