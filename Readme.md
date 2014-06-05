# Calendar-tools

  * Recurring events generation
  * Convertion functions for RFC2445 specification.
  * Designed to works on Node.JS and browsers.

## Recurring events generation

### Event structure

``` javascript
  var newEvent = {
      title: 'My next birthday'
    , start: new Date(2012, 6, 18, 16)
    , end: new Date(2012, 6, 18, 23, 30)
    , allDay: false
    , frequency: 'year'
    , recurrence: {
          'end-by': {
              after: 4
            , type: 'never'
          }
        , every: 1
        , exceptions: ['07/18/2012']
      }
   }
```

### Server-Side support
-----------------------

``` javascript
// add seed module
var Seed = require('./lib/seed');

var today = new Date();

// defines an event object
var myBirthDays = {
    title: 'Event Instances'
  , start: new Date(1977, 6, 18, 15, 30, 48)
  , end: new Date(1977, 6, 22, 15, 30, 48)
  , allDay: false
  , frequency: 'year'
  , recurrence: {
        'end-by': {
            type: 'never'
          , on: today
        }
      , every: 1
      , exceptions: []
    }
}

// creates a new seed Object passing event object and options
var Seed = new Seed(myBirthDays, {
    start: new Date(2000, 0, 1)
  , end: today
});

// generates ans retrieves all instances by period
var instances = Seed.getInstances();

for (var i = 0; i < instances.length; i++) {
  var Instance = instances[i];
  console.log(Instance.start + ': ' + Instance.getNumber() + ' years');
};
```

### building client-side library

you can use 'make build' rule to building client-side library. The generated
file will be saved in dist/calendar-tools.js

## License 

(The MIT License)

Copyright (c) 2011 Damian Suarez &lt;damian@learnboost.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
