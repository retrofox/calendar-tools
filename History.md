
0.3.8 / 2012-01-19 
==================

  * fix getDiff() time computing bug

0.3.7 / 2012-01-19 
==================

  * fix bug for monthy(day of week) - allday recurring event

0.3.6 / 2012-01-19 
==================

  * allday correction in getElapsedInstances() method

0.3.5 / 2012-01-18 
==================

  * allday correction in getElapsedInstances() method
  * adding gd:originalEvent support to atom lib

0.3.4 / 2012-01-04 
==================

  * restoring getRecurrenceObj build proccess
  * apply new repeat-on control for jumping vector

0.3.3 / 2012-01-04 
==================

  * weekly mode: set default start day when is undefined from ical
  * change rrule detection

0.3.2 / 2011-12-21 
==================

  * incremenet 'UNTIL' value one day
  * pass day week number for monthly BYDAY recurrence mode
  * incremenet an day to TEND for all-day event

0.3.1 / 2011-12-20 
==================

  * fixing name vars errors

0.3.0 / 2011-12-20 
==================

  * fix BYMONTHDAY value

0.2.9 / 2011-12-20 
==================

  * remove time dependecy
  * add utc parameter to UTCTime string method. Cleaning
  * refact passing options for genRecurrenceString() and genEvent() methods

0.2.8 / 2011-12-20 
==================

  * fix bugs cause methods names

0.2.7 / 2011-12-20 
==================

  * add UTCTime() build date format

0.2.6 / 2011-12-19 
==================

  * add parsing ISO functions

0.2.5 / 2011-12-19 
==================

  * add parseISO8601() and toISOString() util methods

0.2.4 / 2011-12-19 
==================

  * fix variable name error.
  * remove not used functions

0.2.3 / 2011-12-08 
==================

  * add options parameter to genRecurrenceString() add genEvent()

0.2.2 / 2011-12-06 
==================

  * expose atom and rfc2445 module

0.2.1 / 2011-11-29 
==================

  * replace native Array indexOf method by util.array.indexOf function

0.2.0 / 2011-11-29 
==================

  * not use reserver 'const' word

0.1.8 / 2011-11-21 
==================

  * Fix. walking on the week.
  * add new seed weekly test files
  * changing rule for build dist

0.1.7 / 2011-11-18 
==================

  * add client-side builded file
  * add test rule to build client-side library using browserbuild
  * removing form lib/ working both-sides

0.1.6 / 2011-11-11 
==================

  * finally renames Carilu by caTools
  * updates tests

0.1.5 / 2011-11-10
=================
=
  * fix version number
  * Expose 'util'.

0.1.4 / 2011-11-07 
==================

  * Fix package.json 'main' field.
  * Renamed index to lib/calendar-tools
  * Added expresso as a developer dependency.

0.1.3 / 2011-11-05 
==================

  * add default recurrence values
  * minor improvement in applyTXCorrection()
  * apply tz correction weekly mode
  * add dylight correction in getElapsedInstance()
  * git add gitDiff(), getTZDiff() and applyTZCorrection()
  * Dylight correction when a new instance is cloned

0.1.2 / 2011-11-03 
==================

  * replace diff in days computing by _date.getDiffInDays()
  * testing elpased monthly day of week
  * fix recurrence montly - day of week.
  * add getDiff() method.
  * add defined recurrence condition when an instance is cloned
  * normalize: add recurrence default property

0.1.1 / 2011-11-02 
==================

  * monthly - day of week. date control when date number not exists in the next month
  * getDaysInMonth accept Date parameter
  * Daylight saving time nightmare correction

0.1.1 / 2011-10-31 
==================

  * store previous instance

0.1.0 / 2011-10-31 
==================

  * add client-side fullcalendar example
  * weekly - avoid falling into the void
  * getInstances() accepts start, end period dates
  * remove collection
  * doc
  * add example, API doc, etc

0.0.9 / 2011-10-31 
==================

  * normalize() - remove all-day correction
  * weekly - avoid falling into the void
  * getInstances() accepts start, end period dates

0.0.8 / 2011-10-28 
==================

  * add getSeed() method
  * addNoRec condition

0.0.7 / 2011-10-28 
==================

  * add collection property
  * integrate Seed class with Instance
  * add instance.js class

0.0.6 / 2011-10-28 
==================

  * timezone: add systemTZCorrection and offsetCorrection

0.0.5 / 2011-10-28 
==================

  * no-recurrence events setting by options param
  * process no-recurrence events
  * Readming

0.0.4 / 2011-10-27 
==================

  * add isLeapYear() and getDateInMonth() date functions
  * remove lib/index.js
  * rename test file
  * add getFormattedTime() date function()
  * fixed worng ISO8601 call
  * removign old code. Add getCountdown()
  * add/testing getElapsedInstances()
  * clearTime() clone supported

0.0.3 / 2011-10-21 
==================

  * calen is officially killed
  * atom: doc
  * RFC2445 refact: add atom lib
  * RFC2445 refact: rename getRecurrenceXML by genRecurrenceString
  * RFC2445 refact: getAllDay()
  * RFC2445 refact: remove getAllday function
  * RFC2445 refact: getFrequency() tests passed
  * RFC2445 refat: add getFrequency() function
  * RFC2445 refat: remove functions from calen to rfc2445
  * refact: add rfc2445.js new lib file.
  * refact: moving usefull parsing date functions from calen to util
  * refact: moving usefull string function from calen to util
  * util: add daysMap to date constants
  * util: exports date constants
  * util: rename getEventDuration() by getDuration()

0.0.2 / 2011-10-21 
==================

  * atom: genEvent()
  * atom: rename to genEvent() method
  * RFC2445 refact 
  * recurrence: normalized lib
  * recurrence: nromalized all tests
  * util: rename getEventDuration() by getDuration()
  * recurrence: remove util methods
  * util: renames names method

0.0.1 / 2010-01-03
==================

  * Initial release
