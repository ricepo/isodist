/**
 * trace.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
const _            = require('lodash');
const round        = require('./util/round');
const Turf         = require('@turf/turf');



function trace(pgrid, d, opts) {


  /**
   * Filter out points not within step range
   */
  console.log(`Filtering d=${d}...`);
  const filtered = Turf.featureCollection(
    pgrid
      .features
      .filter(i => i.properties.distance <= d)
  );


  const time1 = new Date().getTime();
  /**
   * Compute concave hull
   */
  console.log(`Tracing d=${d}...`);
  const delta = opts.hexSize > 0
    ? opts.hexSize
    : 0.5;
  const hull = Turf.concave(filtered, { maxEdge: delta, units: 'miles' });
  hull.properties.distance = d;


  /**
   * Skip hex-fitting if hex-size is 0
   */
  if (opts.hexSize <= 0) {
    console.log(`Processing d=${d}`);
    return hull;
  }


  /**
   * Generate the appropriate bounding box and hex-grid
   */
  const box = Turf.bbox(Turf.featureCollection([hull]));
  const grid = Turf.hexGrid(box, opts.hexSize, { units: 'miles' });
  const total = grid.features.length;


  /**
   * Map-reduce into a single fitted polygon
   */
  const polygon = _
    .chain(grid.features)
    .filter((cell, i) => {

      /* First judge if hex grid is intersect with hull */
      if (!Turf.booleanIntersects(cell, hull)) { return false; }

      /* If intersect, judge if intersect points rate greater than 0.5 */
      const flattenCoords = _.flatten(cell.geometry.coordinates);
      const inPoly = _.chain(flattenCoords).map((coord) =>
      Turf.booleanPointInPolygon(Turf.point(coord), hull))
      .filter((item) => item)
      .value();

      console.log(`Fitting d=${d}: ${(i / total * 100).toFixed(2)}%`);

      /* Only intersect hex grid and intersect rate over 50% will pass */
      return (inPoly.length / flattenCoords.length) >= 0.5;

      // return Turf.booleanIntersects(cell, hull);
    })
    .map(round)
    .reduce((mem, cell, i) => {
      console.log(`Merging d=${d}: ${(i / total * 100).toFixed(2)}%`);
      return Turf.union(mem, cell);
    })
    .assign({ properties: hull.properties })
    .value();

  const time2 = new Date().getTime();

  console.log(`Processing d=${d}, ${(time2 - time1) / 1000}`);
  return polygon;
}
module.exports = trace;
