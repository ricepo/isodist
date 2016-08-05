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


function hexf(feature, origin, options) {
  const z = feature.properties.z;


  /**
   * Default options
   */
  options = _.defaults(options, {
    cellSize: 0.5
  });


  /**
   * Generate the appropriate bounding box and hex-grid
   */
  const box = bbox(origin, z * 1.2);
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
module.exports = hexf;
