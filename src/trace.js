/**
 * trace.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
const _            = require('lodash');
const log          = require('./util/log');
const round        = require('./util/round');
const Turf         = require('turf');



function trace(pgrid, d, opts) {


  /**
   * Filter out points not within step range
   */
  log(`Filtering d=${d}...`);
  const filtered = Turf.featureCollection(
    pgrid
      .features
      .filter(i => i.properties.distance <= d)
  );


  /**
   * Compute concave hull
   */
  log(`Tracing d=${d}...`);
  const delta = opts.hexSize > 0
    ? opts.hexSize
    : 0.5;
  const hull = Turf.concave(filtered, delta, 'miles');
  hull.properties.distance = d;


  /**
   * Skip hex-fitting if hex-size is 0
   */
  if (opts.hexSize <= 0) {
    log.success(`Processing d=${d}`);
    return hull;
  }


  /**
   * Generate the appropriate bounding box and hex-grid
   */
  const box = Turf.bbox(Turf.featureCollection([hull]));
  const grid = Turf.hexGrid(box, opts.hexSize, 'miles');
  const total = grid.features.length;


  /**
   * Map-reduce into a single fitted polygon
   */
  const polygon = _
    .chain(grid.features)
    .filter((cell, i) => {
      log(`Fitting d=${d}: ${(i / total * 100).toFixed(2)}%`);
      return Turf.intersect(cell, hull);
    })
    .map(round)
    .reduce((mem, cell, i) => {
      log(`Merging d=${d}: ${(i / total * 100).toFixed(2)}%`);
      return Turf.union(mem, cell);
    })
    .assign({ properties: hull.properties })
    .value();


  log.success(`Processing d=${d}`);
  return polygon;
}
module.exports = trace;
