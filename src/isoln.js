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
   * Generate isolines and reduce them to fitted polygons
   */
  log('Computing isolines, this may take a while...');
  const isolines = Turf.isolines(pgrid, 'distance', 25, stops);
  log.success('Computing isolines');


  /**
   * Begin mapping
   */
  log('Optimizing isolines...');
  let wrapped = _
    .chain(isolines.features)
    .filter(i => i.geometry.coordinates.length >= 4)
    .map(LineToPoly)
    .forEach(i => {
      const kinks = Turf.kinks(i);
      if (kinks.features.length > 0) {
        if (options.hexSize > 0) {
          log.fail(`Kinks detected for d=${i.properties.distance}`);
        } else {
          log.warn(`Kinks detected for d=${i.properties.distance}`);
        }
      }
    });


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
  log.success('Optimizing isolines');
  return Turf.featureCollection(wrapped.value());
}
module.exports = isoln;
