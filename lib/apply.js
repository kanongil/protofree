'use strict';

require('./desc');     // Store existing descriptor


module.exports = function () {

    delete Object.prototype.__proto__;
};
