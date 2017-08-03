'use strict';

const Web3    = require('web3');

String.prototype.toBase36 = function (){
    let n = Web3.prototype.toBigNumber(this);
    return n.toString(36).toUpperCase();
};
