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


/**
 * Kink coefficient
 * Resolution is multiplied when kinks are detected
 */
const KINK_COEFF = 2.0;


/**
 * Maximum number of retries before failing
 */
const MAX_RETRIES = 10;



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
   * Retry on kink
   */
  let resolution = options.resolution;
  let isolines = null;
  let retries = 0;

  while (!isolines) {
    if (retries > MAX_RETRIES) {
      log.fail('Could not eliminate kinks in isoline polygons');
    }

    /**
     * Compute distances
     */
    const pgrid = await cdist(osrm, origin, Turf.pointGrid(box, resolution, 'miles'));


    /**
     * Generate isolines and convert them to polygons
     */
    try {
      isolines = isoln(pgrid, stops, options);
    } catch (x) {
      if (!x.known) { throw x; }
      resolution *= 2;
      log.warn(`increased resolution to ${resolution} due to polygon kinks`);
    }

    retries++;
  }


  /**
   * Fit isolines onto hex grid
   */
  const hexfit = hexf(isolines, options);


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
      if (!data) {
        log.warn(`No data found for d=${i.properties.distance}`);
      }
      _.assign(i.properties, data);
    })
    .value();


  log.success('Complete');


  return Turf.featureCollection(post);
}
module.exports = isodist;
