'use strict';

const Assert = require('assert');

const Apply = require('./apply');
const Deprecate = require('./deprecate');
const Descriptor = require('./desc');
const Partial = require('./partial');


exports.apply = function (options = {}) {

    Assert.ok(!(options.deprecate && options.partial), 'Option "deprecate" cannot be used with "partial"');

    if (options.deprecate) {
        return Deprecate(options.tracer);
    }

    if (options.partial) {
        return Partial();
    }

    return Apply();
};


exports.restore = function () {

    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Object.prototype, '__proto__', Descriptor);
};
