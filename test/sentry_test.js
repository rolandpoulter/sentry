var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    assert = require('assert');


var sentry = require('../sentry');


describe('sentry.watch', function () {
	this.timeout(5000);

	describe('given a relative file string', function () {

		it('throws an error if it cant find the file', function (done) {
			sentry.watch('garbage', function (error) {
				assert.equal(error.message, 'Sentry2.watch file: "garbage" does not exist!');
				done();
			});
		});

		it('runs a function when the file is changed and passes the filename to the callback', function (done) {
			var target = __dirname + '/fixtures/string/foo.js';

			fs.writeFileSync(target, 'Blank');

			sentry.watch(target, function (error, filename) {
				assert(!error);
				assert.equal(target, filename);
				done();
			});

			fs.writeFileSync(target, 'Hello World');
		});

		it('runs a task when the file is changed', function (done) {
			var target = __dirname + '/fixtures/string/bar.js';

			fs.writeFileSync(target, 'Blank');

			// TODO: use a real command
			sentry.watch(target, 'fake_cmd', function (error, filename, stdout, stderr) {
				assert(error);
				done();
			});

			fs.writeFileSync(target, 'Hello World');
		});
	});

	// TODO: finish rewriting the tests
});

//  describe 'given a single wild card', ->
//
//    it 'runs a function when a file is changed', ->
//      done = false; waitsFor -> done
//      fs.writeFileSync __rootdir + '/spec/fixtures/wildcard/foo.js', 'Blank'
//      sentry.watch __rootdir + '/spec/fixtures/wildcard/*', ->
//        expect(true).toBeTruthy()
//        done = true
//      _.defer -> fs.writeFileSync __rootdir + '/spec/fixtures/wildcard/foo.js', 'Hello World'
//
//    it 'runs a task when a file is changed', ->
//      done = false; waitsFor (-> done), null, 10000
//      fs.writeFileSync __rootdir + '/spec/fixtures/wildcard/bar.js', 'Blank'
//      sentry.watch __rootdir + '/spec/fixtures/wildcard/*', 'cake stub', (err, stdout, stderr) ->
//        expect(stdout.indexOf 'stub').toNotEqual -1
//        done = true
//      _.defer -> fs.writeFileSync __rootdir + '/spec/fixtures/wildcard/bar.js', 'Hello World'
//
//    it 'it passes the filename to the callback', ->
//      done = false; waitsFor -> done
//      fs.writeFileSync __rootdir + '/spec/fixtures/wildcard/foo.js', 'Blank'
//      sentry.watch __rootdir + '/spec/fixtures/wildcard/*', (filename) ->
//        expect(filename.match(/foo|baz|qux|bar/)).toBeTruthy()
//        done = true
//      _.defer -> fs.writeFileSync __rootdir + '/spec/fixtures/wildcard/foo.js', 'Hello World'
//
//    it 'it only watches the file with given extension', ->
//      done = false; waitsFor -> done
//      filesWritten = 0
//      sentryWatchedFiles = 0
//      fs.writeFileSync __rootdir + '/spec/fixtures/wildcard/qux.js', 'Blank'
//      fs.writeFileSync __rootdir + '/spec/fixtures/wildcard/baz.json', 'Blank'
//      sentry.watch __rootdir + '/spec/fixtures/wildcard/*.json', (filename) ->
//        filesWritten++
//        sentryWatchedFiles++
//        if filesWritten is 2
//          expect(sentryWatchedFiles).toEqual 1
//          done = true
//      fs.watchFile __rootdir + '/spec/fixtures/wildcard/qux.js', (curr, prev) ->
//        filesWritten++
//        if filesWritten is 2
//          expect(sentryWatchedFiles).toEqual 1
//          done = true
//      _.defer -> fs.writeFileSync __rootdir + '/spec/fixtures/wildcard/qux.js', 'Hello World'
//      _.defer -> fs.writeFileSync __rootdir + '/spec/fixtures/wildcard/baz.json', 'Hello World'
//
//  describe 'given a recursive wild card', ->
//
//    it 'runs a function when a deeply nested file is changed', ->
//      done = false; waitsFor -> done
//      fs.writeFileSync __rootdir + '/spec/fixtures/deepwildcard/deep/foo.js', 'Blank'
//      sentry.watch __rootdir + '/spec/fixtures/deepwildcard/**/*.js', ->
//        expect(true).toBeTruthy()
//        done = true
//      _.defer -> fs.writeFileSync __rootdir + '/spec/fixtures/deepwildcard/deep/foo.js', 'Hello World'
//
//    it 'runs a function when a not so deeply nested file is changed', ->
//      done = false; waitsFor (-> done), null, 10000
//      fs.writeFileSync __rootdir + '/spec/fixtures/deepwildcard/bar.js', 'Blank'
//      sentry.watch __rootdir + '/spec/fixtures/deepwildcard/**/*.js', 'cake stub', (err, stdout, stderr) ->
//        expect(stdout.indexOf 'stub').toNotEqual -1
//        done = true
//      _.defer -> fs.writeFileSync __rootdir + '/spec/fixtures/deepwildcard/bar.js', 'Hello World'
//
//    it 'it passes the filename to the callback', ->
//      done = false; waitsFor -> done
//      fs.writeFileSync __rootdir + '/spec/fixtures/deepwildcard/deep/foo.js', 'Blank'
//      sentry.watch __rootdir + '/spec/fixtures/deepwildcard/**/*', (filename) ->
//        expect(filename.match(/foo|baz|qux/)).toBeTruthy()
//        done = true
//      _.defer -> fs.writeFileSync __rootdir + '/spec/fixtures/deepwildcard/deep/foo.js', 'Hello World'
//
//    it 'it only watches the file with given extension', ->
//      done = false; waitsFor -> done
//      filesWritten = 0
//      sentryWatchedFiles = 0
//      fs.writeFileSync __rootdir + '/spec/fixtures/deepwildcard/deep/qux.js', 'Blank'
//      fs.writeFileSync __rootdir + '/spec/fixtures/deepwildcard/deep/baz.json', 'Blank'
//      sentry.watch __rootdir + '/spec/fixtures/deepwildcard/**/*.json', (filename) ->
//        filesWritten++
//        sentryWatchedFiles++
//        if filesWritten is 2
//          expect(sentryWatchedFiles).toEqual 1
//          done = true
//      fs.watchFile __rootdir + '/spec/fixtures/deepwildcard/deep/qux.js', (curr, prev) ->
//        filesWritten++
//        if filesWritten is 2
//          expect(sentryWatchedFiles).toEqual 1
//          done = true
//      _.defer -> fs.writeFileSync __rootdir + '/spec/fixtures/deepwildcard/deep/qux.js', 'Hello World'
//      _.defer -> fs.writeFileSync __rootdir + '/spec/fixtures/deepwildcard/deep/baz.json', 'Hello World'
//
//
//describe 'sentry.watchRegExp', ->
//
//  it 'runs a function when a deeply nested file that matches the regex changes', ->
//    done = false; waitsFor -> done
//    fs.writeFileSync __rootdir + '/spec/fixtures/regex/deep/foo.txt', 'Blank'
//    sentry.watchRegExp './fixtures/regex/', /txt$/, ->
//      expect(true).toBeTruthy()
//      done = true
//    _.defer -> fs.writeFileSync __rootdir + '/spec/fixtures/regex/deep/foo.txt', 'Hello World'
//
//describe 'sentry.findWildcards', ->
//
//  it 'given a /* type wildcard finds files one directory deep', ->
//    equal = _.isEqual sentry.findWildcards(__rootdir + '/spec/fixtures/wildcard/*'), [
//      '/Users/Craig/sentry/spec/fixtures/wildcard/bar.js',
//      '/Users/Craig/sentry/spec/fixtures/wildcard/baz.json',
//      '/Users/Craig/sentry/spec/fixtures/wildcard/foo.js',
//      '/Users/Craig/sentry/spec/fixtures/wildcard/qux.js'
//    ]
//    expect(equal).toBeTruthy()
//
//  it 'given a /**/* type wildcard finds files recursive', ->
//    equal = _.isEqual sentry.findWildcards(__rootdir + '/spec/fixtures/deepwildcard/**/*'), [
//      '/Users/Craig/sentry/spec/fixtures/deepwildcard/bar.js',
//      '/Users/Craig/sentry/spec/fixtures/deepwildcard/deep/baz.json',
//      '/Users/Craig/sentry/spec/fixtures/deepwildcard/deep/foo.js',
//      '/Users/Craig/sentry/spec/fixtures/deepwildcard/deep/qux.js'
//    ]
//    expect(equal).toBeTruthy()
//
//  it 'given a /**/*.json type wildcard finds files with only that extension', ->
//    equal = _.isEqual sentry.findWildcards(__rootdir + '/spec/fixtures/deepwildcard/**/*.json'), [
//      '/Users/Craig/sentry/spec/fixtures/deepwildcard/deep/baz.json'
//    ]
//    expect(equal).toBeTruthy()