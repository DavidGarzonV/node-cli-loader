# CLI Loader

Plugin to create animated loaders in the terminal programmatically.

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
- https://github.com/sindresorhus/cli-spinners
- https://www.npmjs.com/package/log-update
