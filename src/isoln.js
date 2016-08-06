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
  const isolines = Turf.isolines(pgrid, 'z', 25, stops);


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
  if (options.deburr) {

    wrapped = wrapped
      .groupBy('properties.z')
      .map(
        i => (i.length === 1
          ? i[0]
          : _.maxBy(i, Turf.area))
      );

  }


  /**
   * Extract value
   */
  return Turf.featureCollection(wrapped.value());
}
module.exports = isoln;
