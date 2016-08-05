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
const Ora          = require('ora');
const Turf         = require('turf');
const MapBox       = require('mapbox');
const Bluebird     = require('bluebird');
const GeoPoint     = require('geopoint');
const Dissolve     = require('turf-dissolve');

const Merge        = require('turf-merge');
const Line2poly    = require('turf-line-to-polygon');


const mbox = new MapBox(
  'pk.eyJ1Ijoid3l2ZXJuem9yYSIsImEiOiJjaXJoMWVjeWQwMTZoZ2RreDFlYjV5aTJ2In0.CzAKGTcFvqk_08InM1fSnw'
);

/**
 * Determine the bounding box of the point-grid
 */


function l(v) {
  console.log(JSON.stringify(v, null, 1));
}

function p(v) {
  return { latitude: v.coordinates[1], longitude: v.coordinates[0] };
}


const origin = {
  type: 'Point',
  coordinates: [ -77.594544, 43.138428 ]
};

const thresholds = [ 3, 7 ];

const gp = new GeoPoint(origin.coordinates[1], origin.coordinates[0]);
const bb = gp.boundingCoordinates(_.max(thresholds));

const box = Turf.bbox(
  Turf.featureCollection(
    bb.map(
      i => Turf.point([ i._degLon, i._degLat ])
    )
  )
);



(async function() {
  const spinner = Ora('Starting up...');
  spinner.start();



  /**
   * Generate the point grid
   */
  const pgrid = Turf.pointGrid(box, 0.5, 'miles');



  /**
   * Compute distances
   */
  const chunks = _.chunk(pgrid.features, 60);

  const tf = pgrid.features.length;
  let   cf = 0;

  const tc = chunks.length;
  let   cc = 0;


  for (const chunk of chunks) {

    const promises = chunk.map(async feature => {
      const pt = feature.geometry;
      const dt = (await mbox.getDirections([ p(origin), p(pt) ])).routes[0].distance * 0.000621371;
      spinner.text = `Fetched ${cf++} (${cc} chunks) of ${tf} (${tc} chunks)...`;
      feature.properties.z = dt;
      feature.properties.a = 'a';

      return feature;
    });

    await Bluebird.all(promises);
    // await Bluebird.delay(1000);
    cc++;

  }

  const features = pgrid;


  const isolines = Turf.isolines(features, 'z', 25, thresholds);

  isolines.features = isolines.features.map(i => hexfit(Line2poly(i)));

  spinner.text = 'Fitting to hex grid...';




  spinner.stop();

  FS.writeFileSync('result.json', JSON.stringify(isolines, null, 2), 'utf8');

}());


function hexfit(feature) {

  const hex = _
    .chain(Turf.hexGrid(box, 0.5, 'miles').features)
    .filter(i => Turf.intersect(i, feature))
    .value();
  return Dissolve(Merge(Turf.featureCollection(hex)), 'a');

}
