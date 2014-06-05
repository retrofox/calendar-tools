/*!
* recurrence
* Copyright(c) 2011 Damian Suarez <rdsuarez@gmail.com>
* MIT Licensed
*/

/**
 * modeule dependencies
 */
var Seed = require('./seed');

/**
 * exports recurrence Class
 */

var modRecurrence = module.exports = function (evs, options) {
  return new Recurrence(evs, options);
}

/**
 * Initialize a new 'Recurrence' object with the given 'ev'
 *
 * @param {Object|Array} evs: object event or an array events collection
 * @param {Object}  options: {
 *      period: {
 *          start: {Date} - period start date
 *        , end: {Date} - period end date
 *      }
 *    , addNoRec: {Boolean} - add no-recurrence events
 *    , systemTZCorrection: {Boolean} - apply system timezone correction
 *    , offsetCorrection: {Number} - apply offset correction (minutes)
 *  }

 * return {Array} instances series
 */

function Recurrence (evs, options) {
  // add default options
  var start = new Date()
  this.options = {
          start: start
        , end: new Date(+start + 1000*60*6024)
        , addNoRec: true
        , systemTZCorrection: false
        , offsetCorrection: 0
      };

  // mix options
  for (var k in options)
    this.options[k] = options[k];

  // store events
  evs = evs instanceof Array ? evs : [evs];
  this.events = evs;

  // set period
  this.setPeriod();

  // planting seeds
  this.seeds = [];
  this.plantingSeeds();
}

// proto alias
var _pttRec = Recurrence.prototype;

/**
 * setPeriod() method.
 */

_pttRec.setPeriod = function (start, end) {
  start = start || this.options.start || new Date();
  end = end || this.options.end;

  // set period
  if (!end) {
    end = new Date(+start);
    end.setDate(start.getDate() + 1);
  }

  var p = this.period = {
          start: typeof start == 'string' ? new Date(start) : start
        , end: typeof end == 'string' ? new Date(end) : end
      };

  return p;
}

/**
 * planting seeds. That is register all events crating 'seed' objects
 */

_pttRec.plantingSeeds = function () {
  for (var s = 0; s < this.events.length; s++)
    this.seeds.push(new Seed(this.events[s], this, this.options));
}

/**
 * return seeed events
 */

_pttRec.getSeeds = function () {
  return this.seeds;
}

/**
 * getInstances()
 *
 * return {Array} all instances of all seed events
 */

_pttRec.getInstances = function (start, end) {
  var allInstances = [];

  for (var i = 0; i < this.seeds.length; i++) {
    var seed = this.seeds[i];
    allInstances = allInstances.concat(seed.getInstances(start, end));
  };

  return allInstances;
}
