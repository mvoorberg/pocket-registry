# pocket-registry
Simple JavaScript registry for Node.js

[![Coverage Status](https://coveralls.io/repos/github/4umfreak/pocket-registry/badge.svg?branch=master)](https://coveralls.io/github/4umfreak/pocket-registry?branch=master)
[![Build Status](https://travis-ci.org/4umfreak/pocket-registry.svg?branch=v1.0.1)](https://travis-ci.org/4umfreak/pocket-registry)


## Installation

```bash
$ npm install pocket-registry
```

## Usage

```javascript
const PocketRegistry = require("pocket-registry");
const reg = new PocketRegistry();
reg.set("foo", "bar");
console.log(reg.has("foo")); // prints: true
console.log(reg.get("foo")); // prints: bar
console.log(reg.keys); // prints: ["foo"]
reg.remove("foo");

reg.set("foo", { bar: { baz: 123 }});
console.log(reg.has("foo.bar")); // prints: true
console.log(reg.get("foo.bar.xyz", "donut")); // prints: donut
reg.remove("foo.garbage.truck"); // doesn't do anything, because foo.garbage doesn't exist.

```
### Extra Info
The registry requires calling 'new' to instantiate, allowing multiple registries to be created, each one having different objects registered.

Registry will throw an error if you try to set a key to undefined, or if you set the same key twice without removing it first.

Calling get() on a non-existant key will also throw an error.

See the tests for more examples of usage.
