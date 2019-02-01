'use strict';
const assert = require('assert');
const _ = require('lodash');

function PocketRegistry() {
	this.register = {};

	this.set = function (key, value) {
		assert(!this.has(key), `Registry already has a '${key}'.`);
		assert(value !== undefined, `'${key}' cannot be set to undefined.`);
		_.set(this.register, key, value);
		return;
	};

	this.get = function (key, defaultValue) {
		if (defaultValue === undefined) {
			assert(this.has(key), `Registry key '${key}' not found, default not provided!`);
		}
		return _.get(this.register, key, defaultValue);
	};

	this.has = function (key) {
		return _.has(this.register, key);
	};

	this.remove = function (key) {
		_.unset(this.register, key);
	};
};

// Create a read-only 'keys' property, using top-level objects only.
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