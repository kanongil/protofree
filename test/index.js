'use strict';

const Assert = require('assert');

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');

const Descriptor = require('../lib/desc');
const ProtoFree = require('..');


const lab = exports.lab = Lab.script();
const { describe, it, afterEach } = lab;
const { expect } = Code;


describe('protofree', () => {

    afterEach(ProtoFree.restore);

    describe('restore()', () => {

        it('restores the __proto__ descriptor', () => {

            expect(Object.getOwnPropertyDescriptor(Object.prototype, '__proto__')).to.equal(Descriptor);

            // eslint-disable-next-line no-extend-native
            Object.defineProperty(Object.prototype, '__proto__', { configurable: true, value: 123 });

            expect(Object.prototype.__proto__).to.equal(123);

            ProtoFree.restore();

            expect(Object.getOwnPropertyDescriptor(Object.prototype, '__proto__')).to.equal(Descriptor);
        });
    });

    describe('apply()', () => {

        it('removes the __proto__ descriptor', () => {

            const obj = {};

            expect('__proto__' in Object.prototype).to.be.true();
            expect('__proto__' in obj).to.be.true();

            ProtoFree.apply();

            expect('__proto__' in Object.prototype).to.be.false();
            expect('__proto__' in obj).to.be.false();
        });

        it('assignment to __proto__ on object works', () => {

            const objA = {};
            objA.__proto__ = Array.prototype;

            expect(objA.__proto__).to.equal(Array.prototype);
            expect(objA).to.be.instanceOf(Array);

            ProtoFree.apply();

            const objB = {};
            objB.__proto__ = Array.prototype;

            expect(objB.__proto__).to.equal(Array.prototype);
            expect(objB).to.not.be.instanceOf(Array);
        });

        it('preserves __proto__ use in object initializers', () => {

            ProtoFree.apply();

            const obj = { __proto__: Array.prototype };

            expect(obj).to.be.instanceOf(Array);
        });

        it('throws when both "partial" and "deprecate" is specified', () => {

            expect(() => {

                ProtoFree.apply({ partial: true, deprecate: true });
            }).to.throw(Assert.AssertionError);

            expect('__proto__' in Object.prototype).to.be.true();
        });

        describe('with "partial"', () => {

            it('preserves __proto__ setter', () => {

                const obj = {};

                ProtoFree.apply({ partial: true });

                obj.__proto__ = Array.prototype;

                expect('__proto__' in obj).to.be.true();
                expect(obj).to.be.instanceOf(Array);
            });

            it('returns undefined when retrieving __proto__ on object', () => {

                const obj = {};

                ProtoFree.apply({ partial: true });

                expect(obj).to.be.instanceOf(Object);
                expect('__proto__' in obj).to.be.true();
                expect(obj.__proto__).to.be.undefined();

                obj.__proto__ = Array.prototype;

                expect(obj).to.be.instanceOf(Array);
                expect(obj.__proto__).to.be.undefined();
            });

            it('overrides earlier call to apply()', () => {

                ProtoFree.apply();
                ProtoFree.apply({ partial: true });

                const obj = {};
                obj.__proto__ = Array.prototype;

                expect('__proto__' in obj).to.be.true();
                expect(obj.__proto__).to.be.undefined();
                expect(obj).to.be.instanceOf(Array);
            });
        });

        describe('with "deprecate"', () => {

            it('preserves __proto__ getter and setter functionality', () => {

                const obj = {};

                ProtoFree.apply({ deprecate: true, tracer: () => {} });

                expect('__proto__' in obj).to.be.true();
                expect(obj).to.be.instanceOf(Object);
                expect(obj.__proto__).to.shallow.equal(Object.prototype);

                obj.__proto__ = Array.prototype;

                expect(obj).to.be.instanceOf(Array);
                expect(obj.__proto__).to.shallow.equal(Array.prototype);
            });

            it('logs __proto__ getter and setter usager to tracer', () => {

                const traces = [];
                ProtoFree.apply({ deprecate: true, tracer: traces.push.bind(traces) });

                const obj = {};
                obj.__proto__;
                obj.__proto__ = Array.prototype;
                obj.__proto__;

                expect(traces).to.equal([
                    '__proto__ getter was called',
                    '__proto__ setter was called',
                    '__proto__ getter was called'
                ]);
            });

            it('logs using console.trace() by default', () => {

                ProtoFree.apply({ deprecate: true });

                const origTrace = console.trace;
                const traces = [];

                console.trace = traces.push.bind(traces);
                try {
                    const obj = {};
                    obj.__proto__;
                    obj.__proto__ = Array.prototype;
                    obj.__proto__;

                    expect(traces).to.equal([
                        '__proto__ getter was called',
                        '__proto__ setter was called',
                        '__proto__ getter was called'
                    ]);
                }
                finally {
                    console.trace = origTrace;
                }
            });

            it('does not call tracer while tracing', () => {

                let calls = 0;
                const obj = {};

                const tracer = () => {

                    calls++;

                    if (calls === 1) {
                        obj.__proto__ = {};
                    }
                    else {
                        obj.__proto__;
                    }
                };

                ProtoFree.apply({ deprecate: true, tracer });

                obj.__proto__;
                expect(calls).to.equal(1);
                obj.__proto__ = Array.prototype;
                expect(calls).to.equal(2);
            });

            it('throws tracer error', () => {

                const obj = {};
                const tracer = () => {

                    throw new Error('fail');
                };

                ProtoFree.apply({ deprecate: true, tracer });

                expect(() => {

                    obj.__proto__;
                }).to.throw('fail');

                expect(() => {

                    obj.__proto__ = Array.prototype;
                }).to.throw('fail');
            });

            it('overrides earlier call to apply()', () => {

                const traces = [];
                ProtoFree.apply();
                ProtoFree.apply({ deprecate: true, tracer: traces.push.bind(traces) });

                const obj = {};
                obj.__proto__ = Array.prototype;

                expect(traces).to.equal(['__proto__ setter was called']);
            });
        });
    });
});
