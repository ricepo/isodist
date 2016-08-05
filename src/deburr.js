/**
 * bbox.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
const _            = require('lodash');
const Turf         = require('turf');



function deburr(collection) {

  collection.features = _
    .chain(collection.features)
    .groupBy('properties.z')
    .map(i => {
      if (i.length === 1) { return i[0]; }
      return _.maxBy(i, Turf.area);
    })
    .value();

  return collection;
}
module.exports = deburr;
