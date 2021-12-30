/**
 * bbox.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
const Turf         = require('@turf/turf');
const GeoPoint     = require('geopoint');



/**
 * @desc   Generates the bounding rectangle given an origin point and radius in miles
 * @param  {Point}     center   GeoJSON point representing the center of the bounding box
 * @param  {Number}    radius   Radius of the bounding box, in miles
 * @return {Number[]}           Turf.js bounding box
 */
function bbox(center, radius) {
  console.log('Computing bounding box...');


  /**
   * Generate corner points of the bounding box
   */
  const points = new GeoPoint(...center.coordinates.slice().reverse())
    .boundingCoordinates(radius)
    .map(i => Turf.point([ i._degLon, i._degLat ]));


  /**
   * Wrap into a FeatureCollection
   */
  const fc = Turf.featureCollection(points);


  /**
   * Generate the actual bounding box
   */
  console.log('Computing bounding box');
  return Turf.bbox(fc);
}
module.exports = bbox;
