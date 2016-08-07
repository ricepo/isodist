/**
 * isoln.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
const _            = require('lodash');
const log          = require('./util/log');
const Turf         = require('turf');
const LineToPoly   = require('turf-line-to-polygon');

function isoln(pgrid, stops, options) {


  /**
   * Default options
   */
  options = _.defaults(options, {
    deburr: true
  });


  /**
   * Generate isolines and reduce them to fitted polygons
   */
  log('Computing isolines, this may take a while...');
  const resolution = Math.round(Math.sqrt(pgrid.features.length));
  const isolines = Turf.isolines(pgrid, 'distance', resolution, stops);


  /**
   * Begin mapping
   */
  let wrapped = _
    .chain(isolines.features)
    .filter(i => i.geometry.coordinates.length >= 4)
    .map(LineToPoly);


  /**
   * Add deburr step if needed
   */
  if (!options.noDeburr) {

    wrapped = wrapped
      .groupBy('properties.distance')
      .map(
        i => (i.length === 1
          ? i[0]
          : _.maxBy(i, Turf.area))
      );

  }


  /**
   * Extract value
   */
  log.success('Computing isolines');
  return Turf.featureCollection(wrapped.value());
}
module.exports = isoln;
