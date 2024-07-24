# Node CLI Loader

Plugin to create animated loaders in the terminal programmatically.

## Install

```sh {"id":"01J3JM7NK5PD6GEZ38YXBW7N5N"}
npm install node-cli-loader
```

## Usage

### Creates a new loader:

```js {"id":"01J3JM7NK5PD6GEZ38YZV82KX1"}
// Default loader (Loading...)
Loader.create()

// Custom loader (Start loading...)
Loader.create('Start loading', { 
  spinname: 'dots',
  doneMessage: 'Loading finished!'
})
```

**Arguments:**

|name|DESCRIPTION|VALUE TYPE|EXAMPLE|DEFAULT|
|---|---|---|---|---|
|`description`|Message to show when loading and rendering|`string`| `Requesting data`| `Loading`|
|`options`|Custom options for the loader|`object`| `LoaderOptions` | `{}` |

**Options (`LoaderOptions`):**

|name|DESCRIPTION|VALUE TYPE|EXAMPLE|DEFAULT|
|---|---|---|---|---|
|`spinname`|Name of the spinner to be displayed|`string`| `'dots'`, `'sand'`| `'dots'`|
|`doneMessage`|Message to change the loader when finishes|`string`| `'Loading finish!'` | |
|`timeout`|The time in milliseconds to wait before stopping the loader|`string`| `1000` | |

[See all the spinners.](src/spinners.json)

### Stop the loader and mark it as done.

```js {"id":"01J3JMASMR4KAQ6P4TFE1PK51N"}
const loader = Loader.create()
// Some logic here...
loader.finish()
```

### Stop the loaders and mark them as failures:

```sh {"id":"01J3JM7NK5PD6GEZ38Z1PQ11XK"}
Loader.interrupt()
```

### Stops all loaders in course:

```sh {"id":"01J3JM7NK5PD6GEZ38Z2RK7C6X"}
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