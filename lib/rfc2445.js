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
