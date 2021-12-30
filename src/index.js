#!/usr/bin/env node

/**
 * index.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
/* eslint no-loop-func: 1 */
const _            = require('lodash');
const Turf         = require('@turf/turf');
const bbox         = require('./bbox');
const cdist        = require('./cdist');
const trace        = require('./trace');


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

  /**
   * Determine the bounding box and generate point grid
   */
  const box = bbox(origin, _.max(stops));


  /**
   * Retry on kink
   */
  let isolines = null;
  let retries = 0;

  while (!isolines) {
    if (retries > MAX_RETRIES) {
      console.log('Could not eliminate kinks in isoline polygons');
    }

    /**
     * Compute distances
     */
    const pgrid = await cdist(options.map,
       origin, Turf.pointGrid(box, options.resolution, { units: 'miles' }));


    /**
     * Generate isolines and convert them to polygons
     */
    try {
      isolines = stops.map(i => trace(pgrid, i, options));
    } catch (x) {
      if (!x.known) { throw x; }
      options.resolution *= 2;
      console.log(`increased resolution to ${options.resolution} due to polygon kinks`);
    }

    retries++;
  }


  /**
   * Post-processing
   *  - Sort by reverse distance
   *  - Attach additional data to the feature properties
   */
  console.log('Post-processing...');
  const post = _
    .chain(isolines)
    .sortBy(i => -i.properties.distance)
    .forEach(i => {
      const data = options.data[i.properties.distance];
      if (!data) {
        console.log(`No data found for d=${i.properties.distance}`);
      }
      _.assign(i.properties, data);
    })
    .value();


  /**
   * Sanity-check the result
   */
  if (post.length !== stops.length) {
    console.log(`Expected ${stops.length} polygons but produced ${post.length}`);
  }

  console.log('Complete');


  return Turf.featureCollection(post);
}
module.exports = isodist;
