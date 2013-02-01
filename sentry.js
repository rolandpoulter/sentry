var exec = require('child_process').exec,
    path = require('path'),
    file = require('file'),
    fs = require('fs');

// FIXME: callbacks get fire more than once per change

// Watch for changes on a file using a file path or wildcards
// If passed a task callback is passed (err, stdout, stderr)
// If task is ommitted then callback is passed (filename)
//
// @param {String} filename File path to watch, optionally pass /* or /**/* wildcards
// @param {String} [task] Optionally run a child process
// @param {Function} callback (error, filename, [stdout], [stderr])
// @param {Object} [options]
// @param {Object} [map]
exports.watch = function (filename, task, callback, options, map) {
	if (typeof task === 'function') {
		callback = task;
		task = null;
	}

	map = map || {};

	if (filename.indexOf('/*') !== -1) {
		// Get the files we want to catch with the wildcards, and watch them
		exports.findWildcards(filename, function (error, files) {
			if (error) {
				return callback(error, filename);
			}

			files.forEach(function (file) {
				watchFile(file, task, callback, options, map);
			});
		}, map)

	} else {
		// If the file is a string without wildcards, watch just that file
		watchFile(filename, task, callback, options, map);
	}

	return map;
};

// Watch for file changes recursively in a directory that match a regex
// If passed a task callback is passed (err, stdout, stderr)
// If task is ommitted then callback is passed (filename)
//
// @param {String} dir Root directory to search in
// @param {RegExp} regex
// @param {String} [task] Optionally run a child process
// @param {Function} callback (error, filename, [stdout], [stderr])
// @param {Object} [options]
// @param {Object} [map]
exports.watchRegExp = function (dir, regex, task, callback, options, map) {
	if (typeof task === 'function') {
		callback = task;
		task = null;
	}

	// Recursively find anything that matches the regex
	dir = path.resolve(path.dirname(module.parent.filename), dir);
	map = map || {};

	// Watch the matches files
	try {
		file.walk(dir, function (error, start, dirs, files) {
			if (error) {
				return callback(error, dir);
			}

			dirs.forEach(function (dir) {
				if (dir.indexOf(start) === -1) {
					dir = start + '/' + dir;
				}

				watchFile(file, task, function (dirname) {
					if (regex.test(dirname)) {
						callback(null, dirname);

						exports.watchRegExp(dir, regex, task, callback, options, map);
					}
				}, options, map)
			});

			files.forEach(function (file) {
				if (file.indexOf(start) === -1) {
					file = start + '/' + file;
				}

				watchFile(file, task, function (filename) {
					if (regex.test(filename)) {
						callback(null, filename);
					}
				}, options, map);
			})
		});

	} catch (error) {
		callback(error, dir);
	}

	return map;
};

// Watch a file for changes and execute a callback or child process.
//
// @param {String} filename
// @param {String} [task]
// @param {Function} callback (error, filename, [stdout], [stderr])
// @param {Object} [options]
// @param {Object} [map]
function watchFile (filename, task, callback, options, map) {
	fs.exists(filename, function (exists) {
		if (!exists) {
			return callback(new Error('Sentry2.watch file: "' + filename + '" does not exist!'), filename);
		}

		var listener;

		if (map && map[filename]) return;

		try {
			if (fs.watch) {
				fs.watch(filename, listener = function (event, _filename) {
					_filename = _filename || filename;

					if (event === 'rename') {
						if (map && map[_filename]) map[_filename]();

						watchFile(_filename, task, callback, options, map);
					}

					finish(_filename);
				});

			} else {
				fs.watchFile(filename, listener = function (curr, prev) {
					if (curr.size === prev.size && curr.mtime.getTime() === prev.mtime.getTime()) {
						return;
					}

					finish(filename);
				});
			}
		} catch (error) {
			callback(error, filename);
		}

		if (map) {
			map[filename] = function () {
				fs.unwatchFile(filename, listener);
			};
		}
	});

	function finish (filename) {
		if (typeof task === 'string') {
			exec(task, function (error, stdout, stderr) {
				if (callback) {
					callback(error, filename, stdout, stderr);
				} else {
					console.log(stdout);
					if (error) {
						console.log(error);
					}
				}
			});

		} else if (callback) {
			callback(null, filename);
		}
	}
}

// Given a filename such as /fld/**/* return all recursive files
// or given a filename such as /fld/* return all files one directory deep.
// Limit by extension via /fld/**/*.coffee
//
// @param {String} filename
// @param {Function} callback (error, files)
exports.findWildcards = function (filename, callback, map) {
	var split,
	    root,
	    ext;

	if (typeof filename !== 'string') {
		return callback(new Error('Sentry2.findWildcards was provided an invalid filename: ' + filename));
	}

	map = map || {};
	map.__map = map.__map || {};

	// If there is a wildcard in the /**/* form of a file then remove it and
	// splice in all files recursively in that directory
	if (filename.indexOf('**/*') !== -1) {
		split = filename.split('**/*');
		root = split[0];
		ext = split[1];

		walkDir();
		watchFile(root, null, walkDir, {persistent: false}, map.__map);

		function walkDir () {
			try {
				file.walk(root, function (error, start, dirs, files) {
					if (error) {
						return callback(error, root);
					}

					callback(null, filterList(start, dirs.concat(files)));
				});
			} catch (error) {
				callback(error, root);
			}
		}

	// If there is a wildcard in the /* form then remove it and splice in all the
	// files one directory deep
	} else if (filename.indexOf('/*')) {
		split = filename.split('/*');
		root = split[0];
		ext = split[1];

		scanDir();
		watchFile(root, null, scanDir, {persistent: false}, map.__map);

		function scanDir () {
			fs.readdir(root, function (error, files) {
				if (error) {
					return callback(error, root);

					callback(null, filterList(root, files));
				}
			});
		}

	} else {
		callback(null, []);
	}

	function filterList (start, list) {
		var filtered = [],
		    _map = {};

		if (start.charAt(start.length - 1) !== '/') {
			start += '/';
		}

		list.forEach(function (name) {
			if (new RegExp(ext + '$').test(name)) {
				if (name.indexOf(start) === -1) {
					name = start + name;
				}

				if (!_map[name]) {
					_map[name] = true;

					filtered.push(name);
				}
			}
		});

		return filtered;
	}
};
