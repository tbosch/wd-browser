## Description

This allows to run webdriver.js tests in a browser without running a selenium server by using an iframe.

## Getting started

# Proof of concept

1. `npm install`: Installs the dependencies
1. `grunt`: Runs a test that does a google search using PhantomJs and karma

# Details

* `grunt buildWebdriver` downloads and builds `lib/webdriver.js` and `lib/atoms.js`.
* `lib/webdriver.js` is the webdriver.js build to be used in browsers (see https://code.google.com/p/selenium/wiki/WebDriverJs).
* `lib/atoms.js` are the basic building blocks of every webdriver driver implementation
  (see https://code.google.com/p/selenium/wiki/AutomationAtoms).
  This provides cross browser tools from selenium like triggering events (e.g. typing into text fields),
  selecting elements, ...
* `src/wd-browser.js` intercepts the backend calls from `webdriver.js` and implements them
  using `lib/atoms.js` (see https://code.google.com/p/selenium/wiki/JsonWireProtocol).

# Status

* We can create sessions, open urls, find elements, type text and click buttons.
  See test/e2e/firstSpec.js
* This is just the beginning :-)

## TODOs

Refactor wd-browser.js

* one file for every request.
* central session-id extraction from url and call to `bot.setWindow()`.
* LRU eviction policy for `findElement`.

Add libraries from protractor via browserify:

* minijasminenode
* protractor and async expects

Development:
* Change grunt-build-webdriver.js so that it also builds non minified version of atoms.js. This helps in development!
* Create unit tests for wd-browser.js for every request type
* Create a better e2e example that does not use a real google search,
  as this leads to problems with proxies...

## License
Licensed under the MIT license.

