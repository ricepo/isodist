#!/usr/bin/env node

/**
 * index.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
/* eslint no-loop-func: 1 */
const _            = require('lodash');
const FS           = require('fs');
const OSRM         = require('osrm');
const Turf         = require('turf');
const Bluebird     = require('bluebird');
const GeoPoint     = require('geopoint');

const Merge        = require('turf-merge');
const Line2poly    = require('turf-line-to-polygon');


const osrm = new OSRM('osrm/indiana-latest.osrm');
Bluebird.promisifyAll(osrm);
Bluebird.promisifyAll(FS);


const origin = {
  type: 'Point',
  coordinates: [ -86.893386, 40.417202 ]
};

const thresholds = [ 1, 5, 9 ];


function log(data) {
  process.stdout.write(_.padEnd(`\r${data}`, process.stdout.columns));
}


(async function() {
  process.stdout.write('Loading...');



  /**
   * Determine the bounding box and generate point grid
   */
  const box = Turf.bbox(
    Turf.featureCollection(
      new GeoPoint(origin.coordinates[1], origin.coordinates[0])
        .boundingCoordinates(_.max(thresholds))
        .map(i => Turf.point([ i._degLon, i._degLat ]))
    )
  );



  /**
   * Generate the point grid
   */
  const pgrid = Turf.pointGrid(box, 0.05, 'miles');



  /**
   * Compute distances
   */
  const chunks = _.chunk(pgrid.features, 1000);

  const tc = chunks.length;
  let   cc = 0;

  for (const chunk of chunks) {
    const promises = chunk.map(computeDistance);

    await Bluebird.all(promises);
    log(`Computing distances: ${(cc++ / tc * 100).toFixed(2)}%`);
  }


  /**
   * Generate isolines and convert them to polygons
   */
  log('Computing isolines, this may take a while...');
  const isolines = Turf.isolines(pgrid, 'z', 25, thresholds);

  log('Fitting to hex grid...');
  isolines.features = isolines
    .features
    .map(Line2poly)
    .map(hexfit);



  log('Writing result to file...');
  await FS.writeFileAsync('result.json', JSON.stringify(isolines, null, 2), 'utf8');

  log('Success!');

  /**
   * Compute distance of a point from the origin
   */
  async function computeDistance(feature) {
    const pt = feature.geometry;

    const routes = await osrm.routeAsync({
      coordinates: [ origin.coordinates, pt.coordinates ]
    });

    feature.properties.z = routes.routes[0].distance * 0.000621371;
  }


  /**
   * Dissolve individual polygons
   */

  /**
   * Fit the polygon over a hex grid
   */
  function hexfit(feature) {
    const z = feature.properties.z;

    const grid = Turf.hexGrid(box, 0.5, 'miles').features;
    let c = 0;
    const hex = _
      .chain(grid)
      .filter(i => {
        log(`Fitting z=${z}: ${(c++ / grid.length * 100).toFixed(2)}%`);
        return Turf.intersect(i, feature);
      })
      .map(round)
      .value();

    log(`Fitting z=${z}: merging, this may take a while...`);
    return Merge(Turf.featureCollection(hex));
  }

  function round(feature) {
    const coords = feature.geometry.coordinates[0];
    feature.geometry.coordinates[0] = coords.map(i => [ r(i[0], 6), r(i[1], 6) ]);
    return feature;
  }

  function r(num, decimals) {
    const c = Math.pow(10, decimals);
    return Math.round(num * c) / c;
  }

}());
