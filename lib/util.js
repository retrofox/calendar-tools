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
