# Node CLI Loader

Plugin to create animated loaders in the terminal programmatically.

## Install

```
npm install node-cli-loader
```

## Usage

### Create a new loader: 

```
Loader.create('Start loading', {
	spinname: 'dots',
	doneMessage: 'Loading finished!'
})
```

**Options:**

|name|DESCRIPTION|VALUE TYPE|EXAMPLE|DEFAULT|
|---|---|---|---|---|
|`spinname`|Name of the spinner to be displayed|`string`| `dots`, `sand`| `dots`|
|`doneMessage`|Message to change the loader when finishes|`string`| 'Loading finish!' | |

[See all the spinners.](src/spinners.json)

### Stop the loaders and mark them as failures:

```
Loader.interrupt()
```

### Stops all loaders in course:

```
Loader.stopAll()
```

--- 

Based on packages:
- https://github.com/chalk/ansi-regex
- https://github.com/chalk/ansi-styles
- https://github.com/chalk/slice-ansi
- https://github.com/chalk/strip-ansi
- https://github.com/chalk/wrap-ansi
- https://github.com/grncdr/js-lookup
- https://github.com/mathiasbynens/emoji-regex
- https://github.com/sindresorhus/ansi-escapes
- https://github.com/sindresorhus/cli-cursor
- https://github.com/sindresorhus/cli-spinners
- https://github.com/sindresorhus/get-east-asian-width
- https://github.com/sindresorhus/is-fullwidth-code-point
- https://github.com/sindresorhus/log-update
- https://github.com/sindresorhus/mimic-function
- https://github.com/sindresorhus/onetime
- https://github.com/sindresorhus/restore-cursor
- https://github.com/sindresorhus/string-width