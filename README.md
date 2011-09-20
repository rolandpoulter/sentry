# Sentry

**sentry is currently in an early alpha development stage. Please feel free to take a look around the source code to get an idea of where the project is going.**

Sentry is a simple node tool to watch for file changes (using a path, wildcards, or a regex) and execute a function or shell command.

## Installation

    $ npm install sentry

## Example

````coffeescript
sentry = require 'sentry'

# Watch changes relative in file.js
sentry.watch 'file.js', (file) -> console.log 'A change has been made in #{file}'

# Watch changes one directory deep
sentry.watch 'fld/*.coffee', ->

# Watch changes recursively on any files 
sentry.watch 'fld/**/*', ->

# Watch files recursively that match a regex
sentry.watchRegExp /regex/, ->

# If you pass a string instead of a function it'll execute that shell command
sentry.watch 'file.coffee', 'coffee -c'
````

## API

Sentry comes with two methods `watch` and `watchRegExp`.

### sentry.watch(filePath, [task], callback)

Optionally you may pass a task which will send `(err, stdout, stderr)` as the arguments to the callback.

`sentry.watch 'file.js', 'coffee -c', (err, stdout, stderr) ->`

Or simply just a callback and Sentry will pass filename to the callback

`sentry.watch 'file.js', (filename) ->`

Feel free to use wildcards with extensions

````coffeescript

# Find all files one directory deep
sentry.watch '/folder/*', ->

# Find all files one directory deep ending in .coffee
sentry.watch '/folder/*.coffee', ->

# Find all files recursively
sentry.watch '/folder/**/*', ->

# Find all files recursively ending in .txt
sentry.watch '/folder/**/*.txt', ->
````

### sentry.watchRegExp(root, regex, [task], callback)

Just like sentry.watch but instead you must pass a root directory and regular expression to match files again.

````coffeescript

# Find all files in this folder that end in .coffee
sentry.watchRegExp '', /\.coffee$/, ->

# Find all files in the folder 'test' next to this file that begin with test and end in .coffee
sentry.watchRegExp '../tests/', /^test_,.coffee$/, ->
````

## To run tests

nap uses [Jasmine-node](https://github.com/mhevery/jasmine-node) for testing. Simply run the jasmine-node command with the coffeescript flag

    jasmine-node spec --coffee