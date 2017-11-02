'use strict';
const assert = require('assert');

function PocketRegistry() {
	this.register = {};

	this.set = function (key, value) {
		assert(!this.has(key), `Registry already has a '${key}'.`);
		assert(value !== undefined, `'${key}' cannot be set to undefined.`);
		this.register[key] = value;
	};

	this.get = function (key) {
		assert(this.has(key), `Registry key '${key}' not found!`);
		return this.register[key];
	};

	this.has = function (key) {
		return this.register[key] !== undefined;
	};

	this.remove = function (key) {
		delete this.register[key];
	};
};

//Create a read-only 'keys' property
Object.defineProperties(PocketRegistry.prototype, {
	keys: {
		get: function () {
			return Object.keys(this.register);
		}
	}
});

// Don't export a new instance of the registry, we want
// to be able to have more than one within our application.
module.exports = PocketRegistry;
