'use strict';

function assert(left, right) {
    if ( right == undefined ) {
        if ( !left ) {
            throw new Error('Assert Error.');
        }
    } else {
        if ( left != right ) {
            throw new Error('Assert Error.');
        }
    }
}

// Just Like Python Range function.
function range (start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;
    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);
    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }
    return range;
}

function Duration() {
    this.stime = new Date();
}

Duration.prototype.elapsed = function (){
    return new Date().getTime() - this.stime;
};

// export default {assert, range};
module.exports = {'assert': assert, 'range': range, 'Duration': Duration};
