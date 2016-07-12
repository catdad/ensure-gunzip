/* jshint node: true, mocha: true */

var zlib = require('zlib');
var expect = require('chai').expect;
var through = require('through2');
var ns = require('node-stream');

var m = require('../');

describe('[index]', function() {
    var DATA = 'pineapples';
    var ERR = new Error(DATA);

    it('passes the content as-is when not gzipped', function(done) {
        var input = through();
        var output = m(input);

        ns.wait(output, function(err, data) {
            if (err) {
                return done(err);
            }

            expect(data.toString()).to.equal(DATA);
            done();
        });

        input.end(DATA);
    });
    it('unzips the content when gzipped', function(done) {
        var input = through();
        var output = m(input.pipe(zlib.createGzip()));

        ns.wait(output, function(err, data) {
            if (err) {
                return done(err);
            }

            expect(data.toString()).to.equal(DATA);
            done();
        });

        input.end(DATA);
    });

    it('passes errors on the input stream to the output when gzipped', function(done) {
        var input = through();
        var zipped = input.pipe(zlib.createGzip());
        var out = m(zipped);

        ns.wait(out, function(err, data) {
            expect(err).to.equal(ERR);
            expect(data).to.equal(undefined);

            done();
        });

        zipped.emit('error', ERR);
    });
    it('passes errors on the input stream to the output when not gzipped', function(done) {
        var input = through();
        var out = m(input);

        ns.wait(out, function(err, data) {
            expect(err).to.equal(ERR);
            expect(data).to.equal(undefined);

            done();
        });

        input.emit('error', ERR);
    });
});
