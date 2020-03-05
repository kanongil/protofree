# protofree

![Node.js CI](https://github.com/kanongil/protofree/workflows/Node.js%20CI/badge.svg)

**protofree** is a module designed to increase the security of node.js through eliminating usage
of the `__proto__` object property.

### Background

In node.js, all regular objects contain a `obj.__proto__` property, which can be used to query the
prototype of an object, as well as assigning it another prototype. This "magic" property has been
the cause of numerous security issues through the years,
both by accidentially modifying the global `Object.prototype`, and by assigning a new prototype to
an existing object, and changing its behavior.

Given these issues, and that it is an API where any usage can be replaced with other safer APIs,
there is no good reason to continue allowing this surprising behavior.

### Install

```sh
npm install protofree
```

### Usage

**protofree** is intended to be injected into `node` through the `--require` option.

Three variants are available to use with `--require`:

* `protofree/apply` – Completely removes the special `obj.__proto__` handling from node.
* `protofree/partial` – Change `obj.__proto__` to always return `undefined`.
* `protofree/deprecate` – Preserves `obj.__proto__` handling, but logs each use with
  `console.trace()`.

In general, the `protofree/apply` variant should be used. However, it can cause issues when using
modules that continue to rely on the `__proto__` property for modifying the prototype. In that case,
the `protofree/partial` variant can be used. While it doesn't protect against accidental re-assignment, it does protect against the more serious global `Object.prototype` poisoning.

The `protofree/deprecate` is not  for normal usage, but rather for development and testing.
It can help expose existing usage of `obj.__proto__` in your code or dependencies.

Note that these can also be injected into node through the `NODE_OPTIONS` env variable, eg.
`NODE_OPTIONS="-r protofree/apply"`. If desired, the relevant variant can also be required normally,
or the API can be used to activate it manually through the `protofree` module.

#### Example

```sh
node -r protofree/apply index.js
```

#### Eslint no-proto rule

To avoid using `__proto__` in your own code, the eslint
[`no-proto`](https://eslint.org/docs/rules/no-proto) rule can be enabled.

## API

An API is exposed through requiring the main module:

```js
const ProtoFree = require('protofree');
```

### `ProtoFree.apply([options])`

Enable an override of the `__proto__` property. Without any options, the property is deleted, and will no longer have any special meaning.

- `options` - optional settings:
    - `partial` - Only changes the getter to always return `undefined`.
    - `deprecate` - Preserves `__proto__` handling, but logs each use with `options.tracer` or
      `console.trace`.
    - `tracer` - Method that is called whenever the `__proto__` property is accessed. Only works
      with the `deprecate` option.

### `ProtoFree.restore()`

Restores `Object.prototype.__proto__` to the default behavior.
