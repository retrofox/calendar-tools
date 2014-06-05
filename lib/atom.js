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
