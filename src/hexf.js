/**
 * hexf.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
const _            = require('lodash');
const Turf         = require('turf');
const log          = require('./util/log');
const round        = require('./util/round');


function hexf(collection, options) {


  /**
   * Skip if cellsize is 0
   */
  if (options.hexSize <= 0) {
    return collection;
  }


  /**
   * Fit each feature onto hex grid
   */
  const features = _
    .chain(collection.features)
    .map(i => _single(i, options))
    .compact()
    .value();


  /**
   * Wrap into feature collection and return
   */
  return Turf.featureCollection(features);
}
module.exports = hexf;



function _single(feature, options) {
  const d = feature.properties.distance;


  /**
   * Generate the appropriate bounding box and hex-grid
   */
  const box = Turf.bbox(Turf.featureCollection([feature]));
  const grid = Turf.hexGrid(box, options.hexSize, 'miles');
  const total = grid.features.length;


  /**
   * Map-reduce into a single fitted polygon
   */
  const polygon = _
    .chain(grid.features)
    .filter((cell, i) => {
      log(`Fitting d=${d}: ${(i / total * 100).toFixed(2)}%`);
      return Turf.intersect(cell, feature);
    })
    .map(round)
    .reduce((mem, cell, i) => {
      log(`Merging d=${d}: ${(i / total * 100).toFixed(2)}%`);
      return Turf.union(mem, cell);
    })
    .assign({ properties: feature.properties })
    .value();

  log.success(`Processing d=${d}`);
  return polygon;
}
