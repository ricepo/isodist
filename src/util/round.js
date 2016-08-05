/**
 * util/round.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
const C = Math.pow(10, 6);


/**
 * @desc   Rounds precision of all polgon points to 6 decimals
 * @param  {[type]} feature [description]
 * @return {[type]}         [description]
 */
function round(feature) {
  const coords = feature.geometry.coordinates[0];
  feature.geometry.coordinates[0] = coords
    .map(i => [
      (Math.round(i[0] * C) / C),
      (Math.round(i[1] * C) / C)
    ]);
  return feature;
}
module.exports = round;
