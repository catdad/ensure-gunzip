/* jshint node: true */

var zlib = require('zlib');
var through = require('through2');
var isGzipped = require('is-gzip-stream');

module.exports = function ensureGunzip(stream) {
    var final = through();

    // we will let is-gzip-stream handle the validation here,
    // since it would be redundant
    var known = isGzipped(stream, function(err, isGzipped) {
        if (err) {
            return final.emit('error', err);
        }

        if (isGzipped) {
            known.pipe(zlib.createGunzip()).pipe(final);
        } else {
            known.pipe(final);
        }
    });

    // in case the original `stream` was not a stream,
    // we should check to make sure this is possible first
    if (known.on) {
        known.on('error', function() {
            var args = [].slice.call(arguments);
            final.emit.apply(final, ['error'].concat(args));
        });
    }

    return final;
};
