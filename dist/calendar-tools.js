(function () { function require(p){ var path = require.resolve(p) , mod = require.modules[path]; if (!mod) throw new Error('failed to require "' + p + '"'); if (!mod.exports) { mod.exports = {}; mod.call(mod.exports, mod, mod.exports, require.relative(path)); } return mod.exports;}require.modules = {};require.resolve = function(path){ var orig = path , reg = path + '.js' , index = path + '/index.js'; return require.modules[reg] && reg || require.modules[index] && index || orig;};require.register = function(path, fn){ require.modules[path] = fn;};require.relative = function(parent) { return function(p){ if ('.' != p.charAt(0)) return require(p); var path = parent.split('/') , segs = p.split('/'); path.pop(); for (var i = 0; i < segs.length; i++) { var seg = segs[i]; if ('..' == seg) path.pop(); else if ('.' != seg) path.push(seg); } return require(path.join('/')); };};require.register("atom.js", function(module, exports, require){
/*!
 * atom
 * Copyright(c) 2011 Damian Suarez <rdsuarez@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependecies
 */

  var Util = require('./util')
    , RFC2445 = require('./rfc2445');

/**
 * Alias
 */

  var _str = Util.string;

/**
 * genEvent() function
 * Getter that returns an event in XML format.
 * Usefull for the Google Calendar API.
 *
 * @param {Object} ev: Object Event
 *
 * return {String} event atom string
 */

module.exports.genEvent = function (ev, opts) {

  // default options
  opts = opts || {};
  var options = {
          start: ev.start
        , end: ev.end
        , timezone: 'GMT'
        , originalEvent: null
      };

  for (var k in options)
    options[k] = opts[k] || options[k];

  // timezone location
  tz = options.timezone;

  var orgEv = options,originalEvent;

  return [
      '<entry xmlns="http://www.w3.org/2005/Atom" '
    ,        'xmlns:gd="http://schemas.google.com/g/2005" '
    ,        'xmlns:gCal="http://schemas.google.com/gCal/2005" '
    ,        'gd:fields="gd:recurrence,gd:when">'
    ,   "<title>" + _str.content(ev.title) + "</title>"

    ,   ev.frequency
          ? "<gd:recurrence>"
              + _str.content(RFC2445.genRecurrenceString(ev, opts)) 
              + "</gd:recurrence>"
          : "<gd:when startTime=\""
              + _str.attr(_str.date(options.start, ev.allDay)) + "\" "
              + "endTime=\""
              + _str.attr(_str.date(options.end, ev.allDay, true)) + "\" />"

    ,   orgEv
          ? "<gd:originalEvent href=\"" + orgEv.href + "\" id=\"" + orgEv.id + "\">"
              + "<gd:when startTime=\"" + org.Ev.startTime + "\"/>"
              + "</gd:originalEvent>"
          : ""

    ,   "<gd:where valueString=\"" + _str.attr(tz) + "\"></gd:where>"
    ,   ev.isNew 
          ? "<published>" + _str.date(new Date) + "</published>"
          : "<updated>" + _str.date(new Date) + "</updated>"
    , "</entry>"
  ].join('');
};

});require.register("calendar-tools.js", function(module, exports, require){

/*!
* calendar-tools
* Copyright(c) 2011 Damian Suarez <damian@learnboost.com>
* MIT Licensed
*/

exports = module.exports;

/**
 * Library version.
 */

exports.version = '0.3.7';

/**
 * Expose recurrence
 */

exports.recurrence = require('./recurrence');

/**
 * Expose seed
 */

exports.seed = require('./seed');

/**
 * Expose atom
 */

exports.atom = require('./atom');

/**
 * Expose rfc2445
 */

exports.rfc2445 = require('./rfc2445');

/**
 * Expose util
 */

exports.util = require('./util');

});require.register("rfc2445.js", function(module, exports, require){
/*!
* calen
* Copyright(c) 2011 Damian Suarez <rdsuarez@gmail.com>
* MIT Licensed
*/

/**
 * Module dependecies
 */

var Util = require('./util');

/**
 * Alias
 */

var _str = Util.string
  , _date = Util.date;

/**
 * freqquency names map
 */

var freqNamesMap = {
        YEARLY: 'year'
      , MONTHLY: 'month'
      , WEEKLY: 'week'
      , DAILY: 'day'
    };

/**
 * days map from RFC2445 protocol to recurrence structure
 */

var daysMapRFC2445toRec = {
      SU: 'su'
    , MO: 'm'
    , TU: 't'
    , WE: 'w'
    , TH: 'th'
    , FR: 'f'
    , SA: 'sa'
  };

/**
 * days map from recurrence structure to RFC2445 protocol
 */

var daysMapRecToRFC2445 = {
      su: 'SU'
    , m: 'MO'
    , t: 'TU'
    , w: 'WE'
    , th: 'TH'
    , f: 'FR'
    , sa: 'SA'
  };

/**
 * days names
 */

var dayNames = ['su', 'm', 't', 'w', 'th', 'f', 'sa'];

/**
 * RFC2445 usefull functions
 */

var RFC2445 = module.exports = {};

/**
 * generate functions *
 */

/**
 * genRecurrenceString
 * generates a RFC2445 recurrence string passing an Event Object
 *
 * @param {Object} ev: Event Object
 *
 * return {String} RFC2445 recurrence string
 */

RFC2445.genRecurrenceString = function (ev, opts) {
  if (!ev.frequency) return '';

  opts = opts  || {};

  var options = {
          start: ev.start
        , end: ev.end
        , timezone: 'GMT'
      };

  for (var k in options)
    options[k] = opts[k] || options[k];

  var tz = options.timezone;

  // period: DTSTART, DTEND
  var rules = [
          'DTSTART' + (ev.allDay
                          ? ';' + _str.value(options.start)
                          : ';' + _str.dateTZID(options.start, tz))
        , 'DTEND' + (ev.allDay
                          ? ';' + _str.value(options.end, false, ev.allDay)
                          : ';' + _str.dateTZID(options.end, tz))
      ];

  // RRULE - frequency value
  var rrule = ''
    , steps = ['freq', 'repeat', 'end-by', 'interval']
    , endBy = ''
    , interval = '';

  // end-by type

  // COUNT
  if (ev.recurrence['end-by'].type == 'after')
    endBy = ';COUNT=' + ev.recurrence['end-by'].after;
  // ON
  if (ev.recurrence['end-by'].type == 'on')
    endBy = ';UNTIL=' + _str.value(ev.recurrence['end-by'].on, true, true);

  // INTERVAL
  if (ev.recurrence.every != 1)
    interval = ';INTERVAL=' + ev.recurrence.every;

  for (var st = 0; st < steps.length; st++) {
    if (st == 0 || st == 2) {
      switch (ev.frequency) {
        case 'year':
          rrule += st == 0
                    ? 'RRULE:FREQ=YEARLY'
                    : '';
        break;

        case 'month':
          rrule += st == 0
                    ? 'RRULE:FREQ=MONTHLY'
                    : (st == 2
                        ? (ev.recurrence['repeat-on'].mode == 'day-of-month'
                            ? ';BYMONTHDAY=' + ev.start.getDate()
                            : ';BYDAY=' + (_date.getWeekOfDay(ev.start) + 1)
                              + daysMapRecToRFC2445[dayNames[options.start.getDay()]])
                        : '');
        break;

        case 'week':
          var days = '';
          for (var l in ev.recurrence['repeat-on'])
            days += daysMapRecToRFC2445[l] + ','

          days = days.substring(0, days.length - 1);

          rrule += st == 0
                    ? 'RRULE:FREQ=WEEKLY;BYDAY=' + days
                    : '';
        break;

        case 'day':
          rrule += st == 0
                    ? 'RRULE:FREQ=DAILY'
                    : '';
        break;
      };
    }

    // add end-by
    else if (st == 1)
      rrule += endBy;

    // add end-by
    else if (st == 3)
      rrule += interval;

  };

  rules.push(rrule);

  return rules.join("\r\n");
}

/**
 * getting functions
 */

/**
 * getRecurrenceObj() method.
 * return a recurrence object of LearnBoost event passing RFC2445 string
 *
 * @param {string} str: RFC2445 recurrence string
 * return {Object} recurrence LearnBoost object
 */

RFC2445.getRecurrenceObj = function (str) {
  // debug: RFC2445 \x1B[0;33m%s\x1B[0m string to recurrence object, str
  var recRule = str.match(/RRULE(.+)/)
    , recObj = {
          every: 1
        , 'end-by': {}
        , exceptions: []
        , 'repeat-on': {}
      }
    , _freq = '';

  recRule = recRule.length ? recRule[0] : null;

  if (!recRule) return null;

  // debug: recurrence rule \x1B[0;33m%s\x1B[0m, recRule
  var recPrpsRule = recRule.split(';');

  for (var k = 0; k < recPrpsRule.length; k++) {
    var prp = recPrpsRule[k].split('=');
    // debug: recurrence property [%s]: \x1B[0;33m%s: %j\x1B[0m, k, prp[0], prp[1]

    // recurrence type
    if (prp[0] == 'RRULE:FREQ') {
      _freq = prp[1];
    }

    // INTERVAL/repeat
    if (prp[0] == 'INTERVAL') {
      recObj.every = prp[1];
    }

    // end-by properties
    // AFTER mode
    else if (prp[0] == 'COUNT') {
      recObj['end-by'].type = 'after';
      recObj['end-by'].after = prp[1];
    }

    // UNTIL/on mode
    else if (prp[0] == 'UNTIL') {
      recObj['end-by'].type = 'on';
      var data = _date.parseFromWeirdISOFormat(prp[1]);
      recObj['end-by'].on = new Date(data);
      
    }

    // BYDAY/repeat-on. Used for:
    // - weekly mode
    // - monthly mode - day on week
    else if (prp[0] == 'BYDAY') {

      if (_freq == 'WEEKLY') {
        var days = prp[1].split(',');
        for (var l = 0; l < days.length; l++) {
          var key = daysMapRFC2445toRec[days[l]];
          recObj['repeat-on'][key] = 'on';
        };
      }
      else if (_freq == 'MONTHLY') {
        // for monthly trecurrence type simply defines mode
        recObj['repeat-on'].mode = 'day-of-week';
        
      }
    }

    // BYMONTHDAY/repeat-on. Used for:
    // - monthly mode
    else if (prp[0] == 'BYMONTHDAY')
      recObj['repeat-on'].mode = 'day-of-month';

  };

  // setting default options
  // end-by type
  recObj['end-by'].type = recObj['end-by'].type || 'never';

  return recObj;
};

/**
 * getFrequency
 * retrieve frequency property from google RFC2445 recurrence string
 *
 * @param {string} str
 * @param {Object} frequency names map
 *    {
 *        YEARLY: 'year'
 *      , MONTH:  'month'
 *      , WEEKLY: 'week'
 *      , DAILY': 'day'
 *    }
 */

RFC2445.getFrequency = function (str, namesMap) {
  // debug: get frequency property from RFC2445 \x1B[0;33m%s\x1B[0m, str
  // frequency names map
  namesMap = namesMap || freqNamesMap;
 
  var frequency = str.match(/FREQ=([A-Z]+)/);

  if (frequency)
    return namesMap[frequency[1]];
  return null;
};

/**
 * retrieve all-day property from RFC2445 recurrence string
 */

RFC2445.getAllday = function (str) {
  // debug: get all-day property from RFC2445 \x1B[0;33m%s\x1B[0m, str
  // deduces 'all-day' property through the DTSTART format property
  var dtstart = str.match(/(^DTSTART;([^ ]+))(:\w+)(T)/);

  return dtstart ? false : true;
};

});require.register("util.js", function(module, exports, require){
/*!
* util usefull functions
* Copyright(c) 2011 Damian Suarez <rdsuarez@gmail.com>
* MIT Licensed
*/

/**
 * time constants
 */

var _minute = 1000 * 60
  , _hour = _minute*60
  , _day = _hour*24
  , _week = _day * 7;

/**
 * days map
 * used in weekly mode process.
 */

var daysMap = { su: 0, m: 1, t: 2, w: 3, th: 4, f: 5, sa: 6 };

/**
 * date usefull functions *
 */

var _date = module.exports.date = {};

/**
 * exports constants
 */

_date['const'] = {
    minute: _minute
  , hour: _hour
  , day: _day
  , week: _week
  , daysMap: daysMap
}

/**
 * clearTime()
 *
 * @param {Date} date: date to clear time
 * @para, {Boolean} clone: if is true clones new date
 *
 * return {Date} date
 */

var clearTime = _date.clearTime = function (date, clone) {
  var _date = date;

  if (clone)
    _date = new Date(date);

  else if (typeof date == 'number')
    _date = new Date(Number(date));

  _date.setMilliseconds (0);
  _date.setSeconds (0);
  _date.setMinutes (0);
  _date.setHours (0);

  return _date;
}

/**
 * Returns if a certain year is a leap year
 */

_date.isLeapYear = function (year){
  return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
};

/**
 * Returns days in a month by year
 */

_date.getDaysInMonth = function (){
  var args = arguments
    , year = args[0] instanceof Date ? args[0].getFullYear() : args[0]
    , month = args[0] instanceof Date ? args[0].getMonth() : args[1];

  return [31, (_date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 
          30, 31, 31, 30, 31, 30, 31][month];
};

/**
 * Apply timezone diff correction
 */

_date.applyTZCorrection = function (date, dateToCompare, sign) {
  sign = sign || 1;
  var tzdiff = _date.getTZDiff(date, dateToCompare);

  if (tzdiff)
    date.setMinutes(date.getMinutes() + tzdiff * sign);

  return date;
}

/**
 * getTZDiff()
 * returns the timezone difference between given dates
 */

_date.getTZDiff = function (end, start) {
  return end.getTimezoneOffset() - start.getTimezoneOffset()
}

/**
 * diff in milliseconds
 * support Dylight saving time nightmare correction.
 */

_date.getDiff = function (end, start) {
  var dim = _date.getTZDiff(end, start) * _minute
    , diff = +end - +start - dim;
  return diff;
}

/**
 * diff in days
 * support Dylight saving time nightmare correction.
 */

_date.getDiffInDays = function (end, start, mtd) {
  var diff = _date.getDiff(end, start);
  mtd = mtd || 'ceil';
  return Math[mtd](diff / _day);
}


/**
 * getDiffInMonths()
 */

_date.getDiffInMonths = function (end, start, noRound) {
  var tempStart = new Date(start)
    , tempEnd = new Date(end);

  tempStart.setFullYear(2000);
  tempEnd.setFullYear(2000);

  tempStart.setMonth(0);
  tempEnd.setMonth(0);

  var less = tempEnd < tempStart && noRound ? 1 : 0;
  return (end.getFullYear() - start.getFullYear()) * 12
       + (end.getMonth() - start.getMonth() - less);
}

/**
 * getDiffInMonths()
 */

_date.getDiffInYears = function (end, start, noRound) {
  return _date.getDiffInMonths(end, start, noRound) / 12 | 0;
}

/**
 * getFormattedDate()
 *
 * @paramn {Date} date
 * @param {Boolean} cp: complete format date with zeros
 *
 * return {String} date: eg 07/18/1977
 */

var getFormattedDate = _date.getFormattedDate = function (date, cp) {
  var d = date.getDate()
    , m = date.getMonth() + 1
  var arrDate = [
          cp && m < 10 ? '0' + m : m
        , cp && d < 10 ? '0' + d : d
        , date.getFullYear()
      ]

  return arrDate.join('/');
}

/**
 * getFormattedTime()
 * return hh:mm tt string
 */

var getFormattedTime = _date.getFormattedTime = function (date) {
  var h = date.getHours()
    , m = date.getMinutes()
    , s = date.getSeconds()
    , ampm =  h < 12 ? 'AM' : 'PM';

  h = !h ? 12 : (h > 12 ? (h - 12) : h);

  return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ' ' + ampm;
}

/**
 * Returns week number for the date into current view
 * @param {Date Object} date
 * @return {Number}
 */

var getWeekOfDay = _date.getWeekOfDay = function (date) {
  return Math.floor((date.getDate() - 1 ) / 7);
}

/**
 * setByWeekAndDay()
 *
 * set date passing week and day number.
 * @param {Date} date: date to modify
 * @param {String|Number} week: week number (row)
 * @param {String|Number} day: day number (col)
 *
 * return {Date}
 *
 * eg: Oct 2011
 *
 *     S   M   T   W  Th   F  Sa
 *     0   1   2   3   4   5   6 
 *  ------------------------------
 *  | 25  26  27  28  29  30   1 |
 *  |  2   3   4   5   6   7   8 |
 *  |  9  10  11  12  13  14  15 |
 *  | 16  17  18  19  20  21  22 |
 *  | 23  24  25  26  27  28  29 |
 *  | 30  31   1   2   3   4   5 |
 *  ------------------------------
 *
 * week number is always into date month
 *
 * var d = new Date (2011, 9, 1);
 * setByWeekAndDay (d, 0, 6) -> Sat, 01 Oct 2011
 * setByWeekAndDay (d, 0, 1) -> Mon, 04 Oct 2011
 * setByWeekAndDay (d, 2, 4) -> Thu, 20 Oct 2011
 *
 */

var setByWeekAndDay = _date.setByWeekAndDay = function (date, week, day) {
  var d = new Date(date);
  d.setDate(1);

  var diff = d.getDay() - day
    , n = (week + 1) * 7 - diff + 1;

  n = diff <= 0 ? n - 7 : n;

  d.setDate(n);
  if (_date.getDiffInMonths(d, date))
    n -= 7;

  date.setDate(n);

  return date;
}


/**
 * fixDate
 * copied from fullCalendar
 */

function fixDate(d, check) {
  // force d to be on check's YMD, for daylight savings purposes
  if (+d) { // prevent infinite looping on invalid dates
    while (d.getDate() != check.getDate()) {
      d.setTime(+d + (d < check ? 1 : -1) * HOUR_MS);
    }
  }
}

/**
 * parseISO8601 - copied form fullCalendar
 */

var parseISO8601 = _date.parseISO8601 = function (s, ignoreTimezone) {
 if (typeof s != 'string')
    return s;

  // ignoreTimezone defaults to false
  // derived from http://delete.me.uk/2005/03/iso8601.html
  // TODO: for a know glitch/feature, read tests/issue_206_parseDate_dst.html
  var m = s.match(/^([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);
  if (!m)
    return null;

  var date = new Date(m[1], 0, 1);

  if (ignoreTimezone || !m[14]) {
    var check = new Date(m[1], 0, 1, 9, 0);
    if (m[3]) {
      date.setMonth(m[3] - 1);
      check.setMonth(m[3] - 1);
    }
    if (m[5]) {
      date.setDate(m[5]);
      check.setDate(m[5]);
    }
    fixDate(date, check);
    if (m[7]) {
      date.setHours(m[7]);
    }
    if (m[8]) {
      date.setMinutes(m[8]);
    }
    if (m[10]) {
      date.setSeconds(m[10]);
    }
    if (m[12]) {
      date.setMilliseconds(Number("0." + m[12]) * 1000);
    }
    fixDate(date, check);
  }
  else {
    date.setUTCFullYear(
        m[1]
      , m[3] ? m[3] - 1 : 0
      , m[5] || 1
    );
    date.setUTCHours(
        m[7] || 0
      , m[8] || 0
      , m[10] || 0
      , m[12] ? Number("0." + m[12]) * 1000 : 0
    );

    var offset = Number(m[16]) * 60 + (m[18] ? Number(m[18]) : 0);
    offset *= m[15] == '-' ? 1 : -1;
    date = new Date(+date + (offset * 60 * 1000));
  }

  return date;
}

/**
 * parse from weird ISO format
 */

_date.parseFromWeirdISOFormat = function (d, tz) {
  var parts = d.match(/(\d\d\d\d)(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)/);

  if (!parts) {
    var simple = d.match(/(\d\d\d\d)(\d\d)(\d\d)/);
    if (!simple) return;

    return new Date(simple[1], simple[2] -1, simple[3]);
  }

  var date = new Date();

  date.setMilliseconds(0);
  date.setSeconds(parts[6]);
  date.setMinutes(parts[5]);
  date.setHours(parts[4]);

  date.setDate(parts[3]);
  date.setMonth(parts[2] - 1);
  date.setFullYear(parts[1]);

  return date;
};

/**
 * parse date from TZID format
 */

_date.parseFromTZID = function (v) {
  var parts = v.match(/TZID=([^:]+):(\d+)T(\d+)/);
  if (!parts) return;

  var date = _date.parseFromWeirdISOFormat(parts[2] + 'T' + parts[3], parts[1]);

  // debug: TZID parsed with date %s, date
  return date;
};

/**
 * String usefull functions
 */

var _string = module.exports.string = {};

/**
 * Escape a string with html entities
 *
 * @param {String} string to escape
 * @api public
 */


_string.escape = function (str){
  return str
    .replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
};

_string.attr = function (str) {
  return str ? str.replace(/"/g, '\\"') : '';
};

_string.content = function (str) {
  return str ? _string.escape(str) : '';
};

/**
 * date method
 * @param {Date} v: date object
 * @param {Boolean} a: all-day
 * @param {Boolean} oc: date offset correction
 *
 * oc(offset correction) is used when the object event is patched to google
 * event. We need apply one day to make compatibily between fullCalendar and
 * google.
 *
 */

_string.date = function (v, a, oc) {
  // clone date
  var _v = new Date(v);
  if (a && oc)
    _v.setDate(_v.getDate() + 1);

  var date = JSON.stringify(_v).replace(/"/g, '');
  return a ? date.substring(0, 10) : date;
};

_string.dateTZID = function (v, tz) {
  var str = (JSON.stringify(v).replace(/[-, :,\.]/g, '')).substring(1, 16);
  return 'TZID=' + (tz ? (tz + ':' + str) : str);
};

_string.UTCTime = function (v, utc) {
  var str = (JSON.stringify(v).replace(/[-, :,\.]/g, '')).substring(1, 16);
  str += utc ? 'Z' : '';

  return str;
};


/**
 * value() method
 * return value date adding (or not) txt label
 *
 * @param {Date} _d
 * @param {Boolean} noAddLabel
 * @param {Boolean} allDay correction
 */

_string.value = function (_d, noAddLabel, allDay) {
  var d = new Date(_d);
  if(allDay) d.setDate(d.getDate() + 1);

  var strDate = JSON.stringify(d).split('T')[0].replace(/[", -]/g, '');
  return !noAddLabel ? 'VALUE=DATE:' + strDate : strDate;
};


/**
 * Array usefull functions
 */

var _array = module.exports.array = {};

/**
 * indexOf(). supports for IE
 *
 * @param {Array} array
 * @param item
 */

_array.indexOf = function (array, item) {
  if (!Array.prototype.indexOf) {
    /*
     * copied from Mozilla Develop Center
     * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexO://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
     */

    if (array === void 0 || array === null)
      throw new TypeError();

    var t = Object(array)
      , len = t.length >>> 0;

    if (len === 0)
      return -1;

    var n = 0;
    if (arguments.length > 1) {
      n = Number(arguments[2]);
      if (n !== n)
        n = 0;
      else if (n !== 0 && n !== Infinity && n !== -Infinity)
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }
    if (n >= len)
      return -1;

    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
    for (; k < len; k++)
      if (k in t && t[k] === item)
        return k;

    return -1;
  }
  else
    return array.indexOf(item);
}

});require.register("instance.js", function(module, exports, require){
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

});require.register("seed.js", function(module, exports, require){
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

});require.register("recurrence.js", function(module, exports, require){
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

});caTools = require('calendar-tools.js');
})();