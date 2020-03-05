'use strict';

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');

const ProtoFree = require('..');


const lab = exports.lab = Lab.script();
const { describe, it, afterEach, beforeEach } = lab;
const { expect } = Code;


describe('activations', () => {

    const reset = ['../apply', '../partial', '../deprecate'].map(require.resolve);
    ProtoFree.restore();

    beforeEach(() => {

        // Bust require cache

        for (const module of reset) {
            delete require.cache[module];
        }
    });

    afterEach(ProtoFree.restore);

    describe('/apply', () => {

        it('deletes Object.prototype.__proto__ on require()', () => {

            require('../apply');
            expect('__proto__' in Object.prototype).to.be.false();
        });
    });

    describe('/partial', () => {

        it('works as apply({ partial: true })', () => {

            require('../partial');

            const obj = {};

            expect(obj).to.be.instanceOf(Object);
            expect('__proto__' in obj).to.be.true();
            expect(obj.__proto__).to.be.undefined();

            obj.__proto__ = Array.prototype;

            expect(obj).to.be.instanceOf(Array);
            expect(obj.__proto__).to.be.undefined();
        });

        it('overrides /apply require', () => {

            require('../apply');
            require('../partial');

            const obj = {};
            obj.__proto__ = Array.prototype;

            expect('__proto__' in obj).to.be.true();
            expect(obj.__proto__).to.be.undefined();
            expect(obj).to.be.instanceOf(Array);
        });
    });

    describe('/deprecate', () => {

        const origTrace = console.trace;
        let traces;

        beforeEach(() => {

            traces = [];
            console.trace = traces.push.bind(traces);
        });

        afterEach(() => {

            console.trace = origTrace;
        });

        it('works as apply({ deprecate: true })', () => {

            const obj = {};

            require('../deprecate');

            obj.__proto__;
            obj.__proto__ = Array.prototype;
            obj.__proto__;

            expect(traces).to.equal([
                '__proto__ getter was called',
                '__proto__ setter was called',
                '__proto__ getter was called'
            ]);
        });

        it('overrides /apply require', () => {

            require('../apply');
            require('../deprecate');

            const obj = {};
            obj.__proto__ = Array.prototype;

            expect(traces).to.equal(['__proto__ setter was called']);
        });
    });
});
