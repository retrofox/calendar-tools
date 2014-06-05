/*!
* seed
* Copyright(c) 2011 Damian Suarez <rdsuarez@gmail.com>
* MIT Licensed
*/

/**
 * add util module
 */

var util = require('./util')
  , Instance = require('./instance');

/**
 * alias
 */

var _date = util.date
  , _array = util.array
  , _c = _date['const']
  , clearTime = _date.clearTime;

/**
 * exports Seed Class
 */

var modSeed = module.exports = function (ev, parent, options) {
  return new Seed(ev, parent, options);
}

/**
 * Seed class
 *
 * @param {Event Object}
 * @param {Recurrence Object} (optional)
 * @param {Object} options:
 *  - addNoRec
 *  - offsetCorrection
 */

function Seed (ev) {
  if (!ev)
    throw new Error ('Seed: need necessary an event to generate instances');

  var args = arguments;
  
  // Seed is called for Recurrence?
  var calledByRec = args[1] && args[1].events;

  if (!calledByRec)
    this.parent = {
        options: {}
    }
  else
    this.parent = args[1];

  // options
  var options = calledByRec ? args[2] : args[1];
  this.options = {
          addNoRec: false
        , offsetCorrection: 0
      };

  // mix options
  for (var k in options)
    this.options[k] = options[k];

  // set event like a object property
  this.ev = ev;

  // normalize seed
  this.normalize();

  if (this.options.start)
    this.setPeriod();
}

// alias Instance prototype
var pttSeed = Seed.prototype;

/**
 * setPeriod()
 * set period limiting the series generation
 *
 * @param {Date} start: period start date 
 * @Param {Date} end: period end date
 */

pttSeed.setPeriod = function (start, end) {
  start = start || this.options.start || this.parent.period.start || new Date();
  end = end || this.options.end || this.parent.period.end;

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
 * getPeriod()
 */

pttSeed.getPeriod = function () {
  return this.period;
}

/**
 * normalize()
 * normalize some event properties
 */

pttSeed.normalize = function () {
  // date tz correction. tz in minutes
  function tzCorrection(date, tz) {
    if(!date) return date;
    date.setMinutes(date.getMinutes() - tz);
    return date;
  }

  // converts string to date object if is neccesary
  if (typeof this.ev.start == 'string')
    this.ev.start = new Date(this.ev.start);

  if (typeof this.ev.end == 'string')
    this.ev.end = new Date(this.ev.end);

  if (typeof this.ev.stop == 'string')
    this.ev.stop = new Date(this.ev.stop);

  // timezone system correction
  // - apply offsetCorrection + systemTZCorrection
  var offset = this.options.offsetCorrection + (
                  this.options.systemTZCorrection
                    ? this.ev.start.getTimezoneOffset()
                    : 0
                  );

  // timezone/offset correction
  tzCorrection(this.ev.start, offset);
  tzCorrection(this.ev.end, offset);
  tzCorrection(this.ev.stop, offset);

  // weekly mode
  if (this.ev.frequency == 'week') {
    // build jumping vector
    this.setJumpingVector();

    // avoid falling into the void. start/end date offset correction
    if (!this.jumpingVector[this.ev.start.getDay()]) {
      var jmp = this.jumpingVector
        , jl = jmp.length;

      for (var i = 0; i < jl; i++) {
        var d = this.ev.start.getDay() + i;
        d = d >= jl ? d - jl : d;
        if(jmp[d] !== null)
          break;
      };

      this.ev.start.setDate(this.ev.start.getDate() + i);
      this.ev.end.setDate(this.ev.end.getDate() + i);
    }
  }

  // recurrence default value
  var rec = this.ev.recurrence || {}
    , defVals = { every: 1
                , 'end-by': {
                      type: 'never'
                    , after: 5
                    , on: null
                  }
                , 'repeat-on': {}
                , exceptions: []
              };

  // mix options with defaults
  for (var k in defVals)
    if(!rec[k])
      rec[k] = defVals[k];

  // enf-by on date
  if (rec['end-by'].on == 'string')
    rec['end-by'].on = new Date(rec['end-by'].on);

  return this.ev;
}

/**
 * getElapsedInstances()
 * return elapsed instances of the recurring event in function of date period
 * limit
 *
 * @param {Date} limitDate
 * @param {Boolean} addPartialInstance
 *
 * return {Number} elapsed instances
 */

pttSeed.getElapsedInstances = function (limitDate, addPartialInstance) {
  // alias
  var ev = this.ev
    , limitDate = limitDate || this.period.start
    , elapsedInstances = 0
    , self = this;

  // add partial instance
  if (addPartialInstance) {

    // computing endLimitDate
    var endLimitDate = new Date(ev.end);

    // increment one day if is allday event
    if (ev.allDay)
      endLimitDate.setDate(endLimitDate.getDate() + 1);

    var evDuration = _date.getDiff(endLimitDate, ev.start) - 1;

    limitDate = new Date(+limitDate + evDuration);

    var tzdiff = _date.getTZDiff(limitDate, this.ev.start);
    if(tzdiff)
      limitDate.setMinutes(limitDate.getMinutes() - tzdiff);
  }

  function getDaysByPeriod (ref, daysByPeriod, start) {
    var initDate = start || self.ev.start
      , endDate = self._getDateNextInstance(ref)
      , diffInDays = _date.getDiffInDays(endDate, initDate, 'floor');

    if (self.ev.allDay)
      clearTime(initDate);

    return Math.ceil(diffInDays / daysByPeriod);
  }

  switch (ev.frequency) {
    case 'day':
      elapsedInstances = getDaysByPeriod(limitDate, ev.recurrence.every);
    break;

    case 'week':
      this._walkWeek(this.ev.start, this.ev.start, function (date) {
        elapsedInstances += getDaysByPeriod(limitDate
                              , ev.recurrence.every * 7, date);
      });
    break;

    case 'month':
      var start = this.ev.start
        , end = self._getDateNextInstance(limitDate)
        , diffInMonths = _date.getDiffInMonths(end, start);

      elapsedInstances = Math.ceil(diffInMonths / ev.recurrence.every);

      if (ev.recurrence['repeat-on'].mode == 'day-of-week') {
        var endC = new Date(+end + _date.getDiff(this.ev.end, this.ev.start))
        if (ev.allDay)
          endC.setDate(endC.getDate() + 1);

        if (+limitDate >= +endC)
          elapsedInstances++;
      }
    break;

    case 'year':
      var start = this.ev.start
        , end = self._getDateNextInstance(limitDate)
        , diffInYears = _date.getDiffInYears(end, start);

      elapsedInstances = Math.ceil(diffInYears / ev.recurrence.every);
    break;
  }

  return elapsedInstances;
}

/**
 * Generating instances process
 * generates (and returns) all instances of recurring seed event passing
 * (optionally) start/end period date.
 *
 * @param {Date} (optional) start: period start date
 * @param {Date} (optional) end: period end date
 *
 * @return {Array} Instances objects Arrays
 */

pttSeed.genInstances = function (start, end) {
  // redefine period 
  if (start || end)
    this.setPeriod(start, end);

  var instances = [];

  // alias
  var ev = this.ev
    , start = this.period.start
    , end = this.period.end;

  // add no-recurrence events
  if (!ev.frequency) {
    if (this.options.addNoRec) {
      if ( ev.start >= start && ev.start < end
          || ev.end < end && ev.end >= start
          || ev.start <= start && ev.end >= end
         ) {
        return [new Instance(this, this.ev.start)];
      }
      else return[];
    }
    else
      return [];
  }

  var cursorDate = this._getDateNextInstance(start)
    , jumper = +cursorDate
    , n = this.getElapsedInstances(start)
    , prevInstance = null
    , countdown = this._getCountdown()
    , prevInstance = null;

  while (countdown > 0) {
    // exception instances control
    var excKey = _date.getFormattedDate(cursorDate, false);
    if (_array.indexOf(ev.recurrence.exceptions, excKey) < 0) {
      var Inst = new Instance(this, cursorDate);

      Inst.n = n;
      Inst._prevInst = prevInstance;

      instances.push(Inst);

      n++;
      prevInstance = Inst;
    }

    cursorDate = this._getDateNextJump(cursorDate);
    countdown--;
  }

  return instances;
}

/**
 * get all instances for the given start/end period dates
 */

pttSeed.getInstances = function (start, end) {
  return this.genInstances(start, end);
}

/**
 * _walkWeek
 * covers a complete period of one week executing callback fn
 *
 * @param {Date} start
 * @param {Date} mark
 * @param {Function} fn: callback
 */

pttSeed._walkWeek = function (start, mark, fn) {
  var cursorDay = start.getDay()
    , addDays = 0
    , jumping = this.jumpingVector;

  mark = new Date(mark);

  var prevMark = null
    , nextMark = new Date(mark);

  // walk all days of a week block
  for (var j = 0; j < jumping.length; j++) {
    if (jumping[cursorDay]) {

      // break bucle
      if (cursorDay == start.getDay() && j) {
        j = jumping.length;
        continue;
      }

      nextMark.setDate(mark.getDate() + jumping[cursorDay]);
      fn(mark, prevMark, nextMark);

      // computing next step
      prevMark = new Date(mark);
      mark.setDate(mark.getDate() + jumping[cursorDay]);
      addDays += jumping[cursorDay];
      cursorDay = (cursorDay + jumping[cursorDay]) % jumping.length;

    }
    else
      throw new Error('seems cursor day vacuum has fallen');

  };

}

pttSeed._getCountdown = function () {
  // alias
  var start = this.period.start
    , end = this.period.end
    , ev = this.ev;

  var elapsedInstances = this.getElapsedInstances()
    , maxInstances = this.getElapsedInstances(end, true)
    , endByInstances = maxInstances;

  // computing total instances through start / enda dates limits
  switch (ev.recurrence['end-by'].type) {
    case 'after':
      endByInstances = ev.recurrence['end-by'].after;
    break;

    case 'on':
      var on = new Date(ev.recurrence['end-by'].on);
      on.setDate(on.getDate() + 1);
      endByInstances = this.getElapsedInstances(on, true);
    break;
  }

  var total = Math.min(maxInstances, endByInstances);
  return Math.max(total - elapsedInstances, 0);
}

/**
 * setJumpingVector()
 * return Array with the jump day by day for 'weekly' mode
 *
 * @param {Object Event}
 * return {Array} jumping vector
 */

pttSeed.setJumpingVector = function () {
  var ev = this.ev;

  var cd = null
    , pd = null
    , fd = null
    , jumpingVector = [null, null, null, null, null, null, null]
    , repOn = ev.recurrence['repeat-on']
    , count = 0;

  for (var k in repOn)
    count++;

  if (!repOn || !count) {
    jumpingVector[ev.start.getDay()] = 7 * ev.recurrence.every;
    return this.jumpingVector = jumpingVector;
  }

  // build repeat on Array
  // contains all days sorting by day number
  var repOnArr = [];
  for (var kd in repOn)
    repOnArr.push (kd);

  repOnArr.sort (function (e0, e1) {
    return _c.daysMap[e0] > _c.daysMap[e1] ? 1 : -1;
  });

  // building jumping vector - determined jump for each day number
  // [S, M, T, W, T, F, S]
  for (var kdi = 0; kdi < repOnArr.length; kdi++) {
    var kd = repOnArr[kdi];
    cd = _c.daysMap[kd];

    if (pd === null)
      fd = cd;
    else
      jumpingVector[pd] = cd - pd;

    pd = cd;
  };

  // last jump day every correction
  jumpingVector[cd] = 7 * ev.recurrence.every - pd + fd;

  return this.jumpingVector = jumpingVector;
}

/**
 * _getJumpingVector
 */

pttSeed._getJumpingVector = function () {
  return this.jumpingVector;
}

/**
 * _getDateInstance()
 */

pttSeed._getDateInstance = function (_limit, dir) {
  var ev = this.ev;

  var limit = new Date(_limit || this.period.start);
  dir = dir || 'prev';

  var prev = dir == 'prev'
    , mark = new Date(prev ? +ev.start : +ev.end);

  // allDay - limit date correction
  if (this.ev.allDay) {
    clearTime(mark);
    if (!prev) {
      mark.setDate(mark.getDate() + 1);
    }
  }

  if(mark > limit)
    return new Date(ev.start);

  var newDate = new Date(ev.start);

  function getPeriods() {
    // diff is diff in days between initial startdate of the seed event (mark)
    // and enddate of the current instance (limit)
    var diff = _date.getDiffInDays(limit, mark, 'floor')
      , pDays = ev.recurrence.every;

    if (ev.frequency == 'week')
      pDays *= 7;

    return Math.floor(diff / pDays);
  }

  switch (ev.frequency) {
    case 'day':
      var days = newDate.getDate()
              + (getPeriods() + (prev ? 0 : 1)) * ev.recurrence.every;

      newDate.setDate(days);
    break;

    case 'week':
      var offset = getPeriods() * (ev.recurrence.every * 7);
      var wlimit = new Date(+limit - (_date.getDiff(mark, ev.start)));

      _date.applyTZCorrection(wlimit, limit, -1);

      this._walkWeek(ev.start, +ev.start, function (date, prevDate, nextDate) {
        date = new Date(date);
        date.setDate(date.getDate() + offset);

        nextDate = new Date(nextDate);
        nextDate.setDate(nextDate.getDate() + offset);

        if(wlimit >= date)
          newDate = new Date(prev ? date : nextDate);
      });
    break;

    case 'month':
      var diffInMonths = _date.getDiffInMonths(limit, mark, true)
        , periods = Math.max(0, (diffInMonths / ev.recurrence.every | 0));

      if (ev.recurrence['repeat-on'].mode == 'day-of-month') {
        // periods dir correction
        periods+= prev ? 0 : 1;

        var monthNumber = newDate.getMonth() + ev.recurrence.every * periods;

        // existance day in next month control
        var tmpDate = new Date(newDate);
        tmpDate.setDate(1);
        tmpDate.setMonth(monthNumber);

        if(_date.getDaysInMonth(tmpDate) >= newDate.getDate())
          newDate.setMonth(monthNumber);
        else
          newDate.setMonth(monthNumber + ev.recurrence.every);
      }
      else {
        var diffInMonths = _date.getDiffInMonths(limit, mark)
          , periods = Math.max(0, (diffInMonths / ev.recurrence.every | 0));

        // mode: day-of-week
        var nW = _date.getWeekOfDay(this.ev.start)
          , nD = this.ev.start.getDay();

        mark = new Date(ev.start);
        mark.setMonth(mark.getMonth() + ev.recurrence.every * periods);

        _date.setByWeekAndDay(mark, nW, nD);

        // move to end of mark if is 'next' direction
        if (!prev)
          mark = new Date(+mark + _date.getDiff(ev.end, ev.start) - 1);

        // periods offset correction
        periods += (limit <= mark ? -1 : 0) + (prev ? 0 : 1);

        newDate.setMonth(newDate.getMonth() + ev.recurrence.every * periods);
        _date.setByWeekAndDay(newDate, nW, nD);
      }
    break;

    case 'year':
      var diffInYears = _date.getDiffInYears(limit, mark, true);

      if (dir == 'next')
        diffInYears+= ev.recurrence.every;

      var period = diffInYears /ev.recurrence.every | 0;
      newDate.setFullYear(newDate.getFullYear() + period * ev.recurrence.every);
    break;
  }

  return newDate;
}

/**
 * _getDatePrevInstance()
 * return a date of previous instance.
 *
 * @param {Date} ref: reference to computing
 *
 * return {Date}
 */

pttSeed._getDatePrevInstance = function (ref) {
  return this._getDateInstance(ref);
}

/**
 * _getDateNextInstance()
 */

pttSeed._getDateNextInstance = function (ref) {
  var next = this._getDateInstance(ref, 'next');
  return next;
}

/**
 * _getDateNextJump()
 */

pttSeed._getDateNextJump = function (_ref) {

  var diff = _date.getDiff(this.ev.end, this.ev.start)
    , ref = new Date(+_ref + diff)

  _date.applyTZCorrection(ref, _ref);

  if (this.ev.allDay) {
    clearTime(ref);
    ref.setDate(ref.getDate() + 1);
  }

  return this._getDateInstance(ref, 'next');
}
