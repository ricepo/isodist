/**
 * cdist.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
const _            = require('lodash');
const Bluebird     = require('bluebird');

const log          = require('./util/log');


/**
 * Generates distance from origin to each point
 *
 * @param  {Object} osrm  OSRM router instance
 * @param  {Object} origin GeoJSON point representing the origin
 * @param  {Object} pgrid GeoJSON FeatureCollection of points
 * @param  {Object} options Additional options
 * @return {Object}       pgrid with distance metrics assigned
 */
async function cdist(osrm, origin, pgrid, options) {


  /**
   * Default option values
   */
  options = _.defaults(options, {
    chunkSize: 1000,
    delay: 0
  });


  /**
   * Separate into chunks
   */
  const chunks = _.chunk(pgrid.features, options.chunkSize);


  /**
   * Create the mapping function
   */
  async function _single(feature) {
    const result = await osrm.routeAsync({
      coordinates: [
        origin.coordinates,
        feature.geometry.coordinates
      ]
    });

    feature.properties.distance = result.routes.length > 0
      ? result.routes[0].distance * 0.000621371
      : Number.MAX_VALUE;
  }


  /**
   * Process each chunk
   */
  for (let i = 0; i < chunks.length; i++) {
    await Bluebird.all(chunks[i].map(_single));
    log(`Computing distances: ${(i / chunks.length * 100).toFixed(2)}%`);
  }


  return pgrid;
}
module.exports = cdist;
