'use strict';
const assert = require('assert');
const _ = require('lodash');

function PocketRegistry() {
	const register = {};

	this.set = function (key, value) {
		assert(!this.has(key), `Registry already has a '${key}'.`);
		assert(value !== undefined, `'${key}' cannot be set to undefined.`);
		_.set(register, key, value);
		return;
	};

	this.get = function (key, defaultValue) {
		if (defaultValue === undefined) {
			assert(this.has(key), `Registry key '${key}' not found, default not provided!`);
		}
		return _.get(register, key, defaultValue);
	};

	this.has = function (key) {
		return _.has(register, key);
	};

	this.remove = function (key) {
		_.unset(register, key);
	};

	// Create a read-only 'keys' property, using top-level objects only.
	Object.defineProperties(this, {
		keys: {
			get: function () {
				return Object.keys(register);
			}
		}
	});
};

// Don't export a new instance of the registry, we want
// to be able to have more than one within our application.
module.exports = PocketRegistry;