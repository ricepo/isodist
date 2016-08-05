/**
 * hexf.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
const _            = require('lodash');
const Turf         = require('turf');
const bbox         = require('./bbox');
const log          = require('./util/log');
const round        = require('./util/round');


function hexf(collection, options) {

  /**
   * Default options
   */
  options = _.defaults(options, {
    cellSize: 0.5
  });


  /**
   * Fit each feature onto hex grid
   */
  const features = collection.features
    .map(i => _single(i, options));


  /**
   * Wrap into feature collection and return
   */
  return Turf.featureCollection(features);
}
module.exports = hexf;



function _single(feature, options) {
  const z = feature.properties.z;


  /**
   * Generate the appropriate bounding box and hex-grid
   */
  const box = Turf.bbox(Turf.featureCollection([feature]));
  const grid = Turf.hexGrid(box, options.cellSize, 'miles');
  const total = grid.features.length;


  /**
   * Map-reduce into a single fitted polygon
   */
  const polygon = _
    .chain(grid.features)
    .filter((cell, i) => {
      log(`Fitting z=${z}: ${(i / total * 100).toFixed(2)}%`);
      return Turf.intersect(cell, feature);
    })
    .map(round)
    .reduce((mem, cell, i) => {
      log(`Merging z=${z}: ${(i / total * 100).toFixed(2)}%`);
      return Turf.union(mem, cell);
    })
    .value();


  return polygon;
}
