# xinjs-3d

[github](https://github.com/tonioloewald/xinjs-3d/) | [live demo](https://tonioloewald.github.io/xinjs-3d/) | [npm](https://www.npmjs.com/package/xinjs-3d)

**blueprint src url** `https://tonioloewald.github.io/xinjs-3d/dist/blueprint.js`

To create your own web-component blueprint, simply use `xinjs-3d` thus:

```
npx xinjs-3d my-custom-element
```

> The example web-component is a toggle-switch.

```
<xinjs-3d id="basic" checked>
  <div slot="on">on</div>
  <div slot="off">off</div>
</xinjs-3d>
```

## Loading a blueprint

If you just want to bundle the component…

```
import { makeComponent } from 'xinjs'
import blueprint from 'xinjs-3d'

const { creator } = makeBlueprint( 'xinjs-3d', blueprint )

document.body.append( creator() )
```

If you want to use a CDN:

```
<script type="module">
  import 'https://cdn.jsdelivr.net/npm/xinjs@0.7.1/dist/module.js'
</script>
<xin-loader>
  <xin-blueprint tag="xinjs-3d" src="https://tonioloewald.github.io/xinjs-3d/dist/blueprint.js"></xin-blueprint>
</xin-loader>
<xinjs-3d></xinjs-3d>
```

You can also use `<xin-loader>` and `<xin-blueprint>` or `makeComponent` to load blueprints at runtime.

## Development

This project is designed for use with [Bun](https://bun.sh).

The blueprint code is `./src/blueprint.ts` and unless it's complicated there's no reason
it can't all be in one source file.

`./index.html` exercises your blueprint.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun start
```

## Development

This project is designed for use with [Bun](https://bun.sh).

The blueprint code is `./src/blueprint.ts` and unless it's complicated there's no reason
it can't all be in one source file.

`./index.html` exercises your blueprint.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun start
```
