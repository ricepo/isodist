/**
 * cdist.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
const _            = require('lodash');
const Bluebird     = require('bluebird');
const axios = require('axios');
const polyline = require('@mapbox/polyline');
const rp = require('request-promise');
const log          = require('./util/log');


/**
 * Generates distance from origin to each point
 *
 * @param  {Object} origin GeoJSON point representing the origin
 * @param  {Object} pgrid GeoJSON FeatureCollection of points
 * @param  {Object} options Additional options
 * @return {Object}       pgrid with distance metrics assigned
 */
async function cdist(mapName, origin, pgrid, options) {

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
   * get map name
   */
  const map = firstUpperCase(mapName);

  /**
   * Create the mapping function
   */
  async function _single(feature) {

    const coordinates = [
      [ origin.coordinates[1], origin.coordinates[0] ],
      [ feature.geometry.coordinates[1], feature.geometry.coordinates[0] ]
    ];



    const polylineStr = polyline.encode(coordinates);

    const option = {
      uri: `http://internal-osrm-nginx-1171905758.us-east-1.elb.amazonaws.com/route/v1/car/polyline(${polylineStr})`,
      headers: {
        map
      },
      json: true // Automatically parses the JSON string in the response
    };
    try {
      const result =  await rp(option);

      feature.properties.distance = result.routes.length > 0
        ? result.routes[0].distance * 0.000621371
        : Number.MAX_VALUE;
    } catch (error) {
      // console.log(error);
    }
  }


  /**
   * Process each chunk
   */
  for (let i = 0; i < chunks.length; i++) {
    await Promise.all(chunks[i].map(_single));

    log(`Computing distances: ${(i / chunks.length * 100).toFixed(2)}%`);
  }
  log.success('Computing distances');

  return pgrid;
}

function firstUpperCase(str) {

  if (str === 'France') {

    return 'IleDeFrance';
  }
  return str.toLowerCase().replace(/(\s|^)[a-z]/g, (L) => L.toUpperCase().trim());
}

module.exports = cdist;
