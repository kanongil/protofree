'use strict';

const Descriptor = require('./desc');


module.exports = function (tracer) {

    let active = 0;

    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Object.prototype, '__proto__', {
        configurable: true,
        enumerable: false,
        get() {

            try {
                if (active++ === 0) {
                    (tracer || console.trace)('__proto__ getter was called');
                }
            }
            finally {
                --active;
            }

            return Descriptor.get.call(this);
        },
        set(value) {

            try {
                if (active++ === 0) {
                    (tracer || console.trace)('__proto__ setter was called');
                }
            }
            finally {
                --active;
            }

            return Descriptor.set.call(this, value);
        }
    });

};
