'use strict';

const Descriptor = require('./desc');


module.exports = function () {

    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Object.prototype, '__proto__', {
        configurable: true,
        enumerable: false,
        get() {

            return undefined;
        },
        set: Descriptor.set
    });
};
