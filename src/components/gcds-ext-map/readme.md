# gcds-ext-map



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute      | Description | Type      | Default     |
| --------------- | -------------- | ----------- | --------- | ----------- |
| `_controlslist` | `controlslist` |             | `string`  | `undefined` |
| `controls`      | `controls`     |             | `boolean` | `false`     |
| `lat`           | `lat`          |             | `number`  | `0`         |
| `locale`        | `locale`       |             | `any`     | `undefined` |
| `lon`           | `lon`          |             | `number`  | `0`         |
| `projection`    | `projection`   |             | `string`  | `'OSMTILE'` |
| `static`        | `static`       |             | `boolean` | `false`     |
| `zoom`          | `zoom`         |             | `number`  | `0`         |


## Methods

### `whenLayersReady() => Promise<PromiseSettledResult<void>[]>`

Promise-based method to wait until all layers are ready
Returns a promise that resolves when all child layers are fully initialized

#### Returns

Type: `Promise<PromiseSettledResult<void>[]>`



### `whenProjectionDefined(projection: string) => Promise<unknown>`



#### Parameters

| Name         | Type     | Description |
| ------------ | -------- | ----------- |
| `projection` | `string` |             |

#### Returns

Type: `Promise<unknown>`



### `whenReady() => Promise<void>`

Promise-based method to wait until map is ready
Returns a promise that resolves when the map is fully initialized

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
