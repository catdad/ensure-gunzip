/* jshint node: true */

var zlib = require('zlib');
var through = require('through2');
var isGzipped = require('is-gzip-stream');

function copy(from, to) {
    from.on('error', function() {
        var args = [].slice.call(arguments);
        to.emit.apply(to, ['error'].concat(args));
    });
    
    return from.pipe(to);
}

module.exports = function ensureGunzip(stream) {
    var final = through();
    
    var known = isGzipped(stream, function(err, isGzipped) {
        if (err) {
            return final.emit('error', err);
        }
        
        if (isGzipped) {
            copy(copy(known, zlib.createGunzip()), final);
        } else {
            copy(known, final);
        }
    });
    
    return final;
};
