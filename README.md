# Sentry

Sentry is a simple node tool to watch for file changes (using a path, wildcards, or regexes) and execute a function or shell command. It's like a [watchr](https://github.com/mynyml/watchr) or [guard](https://github.com/guard/guard) for node.

## Installation

    $ npm install sentry2

## Example

````javascript
var sentry = require('sentry2');

// Watch changes in file.js
sentry.watch('file.js', function (error, filename) {
  console.log("A change has been made in " + filename);
});

// Watch changes on any file ending in .coffee one directory deep
sentry.watch('fld/*.coffee', callback);

// Watch changes recursively on any files 
sentry.watch('fld/**/*', callback);

// Watch files recursively that match a regex
sentry.watchRegExp('fld/', /regex/, callback);

// If you pass a string instead of a function it'll execute that child process
sentry.watch('file.coffee', 'coffee -c');
````

## API

Sentry comes with two methods `watch` and `watchRegExp`.

### sentry.watch(filePath, [task], callback)

When running a child process you may optionally pass a callback with the arguments `(error, filename, stdout, stderr)`

````javascript
sentry.watch('file.js', 'coffee -c', function (error, filename, stdout, stderr) {/*...*/});
````

Or just pass a callback and Sentry will pass the filename to the callback

````javascript
sentry.watch('file.js', function (error, filename) {/*...*/});
````

Feel free to use wildcards with extensions

````javascript

// Find all files one directory deep
sentry.watch('/folder/*', callback);

// Find all files one directory deep ending in .coffee
sentry.watch('/folder/*.coffee', callback);

// Find all files recursively
sentry.watch('/folder/**/*', callback);

// Find all files recursively ending in .txt
sentry.watch('/folder/**/*.txt', callback);
````

### sentry.watchRegExp(root, regex, [task], callback)

Just like sentry.watch but instead you must pass a root directory and regular expression to match files against.

````javascript

// Find all files in this folder that end in .coffee
sentry.watchRegExp('', /\.coffee$/, callback);

// Find all files in the adjacent 'test' folder that begin with `test_` and end in `.coffee`
sentry.watchRegExp('../tests/', /^test_,.coffee$/, callback);
````

## To run tests

    npm test
