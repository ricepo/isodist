/**
 * cdist.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
const _            = require('lodash');
const polyline     = require('@mapbox/polyline');
const rp           = require('request-promise');
const log          = require('./util/log');
const querystring  = require('querystring');


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
    chunkSize: 100,
    delay: 0
  });


  /**
   * Separate into chunks
   */
  /* The matrix width is 1000 */
  const chunks = _.chunk(pgrid.features, 1000);
  /* Request chunked by 100 */
  const chunkArr = _.chunk(chunks, options.chunkSize);

  /**
   * get map name
   */
  const map = firstUpperCase(mapName);

  /**
   *
   * Update the distance between origin and each grid
   */
  async function _newSingle(features) {

    try {
      const coordinates = _.map(features, (feature) => [
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0] ]);

      if (_.isEmpty(coordinates)) { return; }

      coordinates.push([ origin.coordinates[1], origin.coordinates[0] ]);

      const sources = `${coordinates.length - 1}`;
      const pl = polyline.encode(coordinates);

      /* construct request parameters */
      const params = querystring.stringify({
        sources,
        annotations:    'duration,distance',
        fallback_speed: 1.0 // fix null duation of OSRM
      }, '&', '=');

      const host = process.env.OSRM_HOST;
      const url = `/table/v1/driving/polyline(${encodeURIComponent(pl)})?${params}`;

      const option = {
        uri: `${host}${url}`,
        headers: { map },
        json: true // Automatically parses the JSON string in the response
      };

      const result =  await rp(option);
      const distances = _.get(result, 'distances');
      if (_.isEmpty(distances)) { return; }

      _.forEach(features, (feature, index) => {
        feature.properties.distance = (_.get(distances, `0.${index}`) / 1600) || Number.MAX_VALUE;
      });

    } catch (error) {
      console.log('error====>', error);
    }
  }


  /**
   * Process each chunk
   */
  for (let i = 0; i < chunkArr.length; i++) {

    await Promise.all(chunkArr[i].map(_newSingle));

    log(`Computing distances: ${(i / chunkArr.length * 100).toFixed(2)}%`);
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
