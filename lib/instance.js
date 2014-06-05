/*!
* Instance
* Copyright(c) 2011 Damian Suarez <rdsuarez@gmail.com>
* MIT Licensed
*/

/**
 * add util module
 */

var util = require('./util');

/**
 * alias
 */

var _date = util.date;

/**
 * exports Instance Class
 */

var modInstance = module.exports = function (Seed, options) {
  return new Instance(Seed, options);
}

/**
 * Instance class. Creates a instance of seed event
 */

function Instance (Seed, dateReference) {
  this._seed = Seed;
  this._create(dateReference);
}

// alias Instance prototype
var pptInst = Instance.prototype;

/**
 * creates an instance event
 */

pptInst._create = function (dateReference) {
  var clone = this.clone()
    , diff = _date.getDiff(this._seed.ev.end, this._seed.ev.start);

  // set cloned start date
  clone.start = new Date(
          dateReference.getFullYear()
        , dateReference.getMonth()
        , dateReference.getDate()
        , this._seed.ev.start.getHours()
        , this._seed.ev.start.getMinutes()
        , this._seed.ev.start.getSeconds()
        , this._seed.ev.start.getMilliseconds()
    );

  // set cloned end date
  clone.end = new Date(+clone.start + diff);
  _date.applyTZCorrection(clone.end, clone.start);

  // set cloned instances as Instance Object properties
  for (var k in clone)
    this[k] = clone[k];

  return clone;
}

/**
 * clone an seed event
 */

pptInst.clone = function () {
  var newInstance = JSON.parse(JSON.stringify(this._seed.ev));

  newInstance.start = new Date(newInstance.start);
  newInstance.end = new Date(newInstance.end);

  if (newInstance.stop)
    newInstance.stop = _date.parseISO8601(newInstance.stop);

  // on date generation
  if (newInstance.recurrence) {
    var endBy = newInstance.recurrence['end-by'];
    if (endBy && endBy.on)
      newInstance.recurrence['end-by'].on = new Date(endBy.on);
  }

  return newInstance;
};

/**
 * get the instance number
 */

pptInst.getNumber = function () {
  return this.n;
}


/**
 * get if is the last instance into series
 */

pptInst.isLast = function () {
  var c = this.getSeed()._getCountdown();
  return this.getNumber() === (c - 1);
}

/**
 * get the previous instance into series
 */

pptInst.getPrev = function () {
  return this._prevInst;
}

/**
 * get the seed event
 */

pptInst.getSeed = function () {
  return this._seed;
}
