/* jshint node: true */

var zlib = require('zlib');
var through = require('through2');
var isGzipped = require('is-gzip-stream');

module.exports = function ensureGunzip(stream) {
    var final = through();

    var known = isGzipped(stream, function(err, isGzipped) {
        if (err) {
            console.log('emitting err from callback', err);
            return final.emit('error', err);
        }

        if (isGzipped) {
            known.pipe(zlib.createGunzip()).pipe(final);
        } else {
            known.pipe(final);
        }
    });

    known.on('error', function() {
        var args = [].slice.call(arguments);
        final.emit.apply(final, ['error'].concat(args));
    });

    return final;
};
