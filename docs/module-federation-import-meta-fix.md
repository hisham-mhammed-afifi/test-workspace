# Fixing `Uncaught SyntaxError: Cannot use 'import.meta' outside a module` in Angular Module Federation (Webpack) Dev Server

## TL;DR

If you're running an Nx + Angular + Webpack Module Federation app and you see this in the browser console:

```
styles.js:10566 Uncaught SyntaxError: Cannot use 'import.meta' outside a module
```

…the dev-server-rendered `index.html` is loading `styles.js` as a **classic** `<script>` tag, but the bundle contains webpack's auto-publicPath runtime helper that uses `import.meta.url` — which only works in ES modules.

**Fix:** wrap `withModuleFederation` in each app's [webpack.config.ts](../apps/host1/webpack.config.ts) so you can override `output.scriptType: false`, forcing webpack to emit the dual-mode helper that uses `document.currentScript` instead.

```ts
import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';

export default async (webpackConfig: unknown) => {
  const apply = await withModuleFederation(config, { dts: false });
  const cfg = (apply as (c: unknown) => { output?: Record<string, unknown> })(webpackConfig);
  cfg.output = { ...cfg.output, scriptType: false };
  return cfg;
};
```

Apply identically to every host **and** every remote.

---

## Symptom

Running `pnpm nx serve host1 --devRemotes=...` (or any of the host serve commands), the host page is blank and DevTools shows:

```
styles.js:10566 Uncaught SyntaxError: Cannot use 'import.meta' outside a module
main.js:7582 [webpack-dev-server] Server started: ...
_debug_node-chunk.mjs:11006 Angular is running in development mode.
```

Crucially:
- The error is in **`styles.js`**, not `main.js`.
- It only happens at **dev-server time**, not in `nx build`.
- The exact line varies — it's wherever webpack injects the `webpack/runtime/publicPath` block.

Looking at the offending location in the served bundle:

```js
/******/ /* webpack/runtime/publicPath */
/******/ (() => {
/******/   var scriptUrl;
/******/   if (typeof import.meta.url === "string") scriptUrl = import.meta.url   // ← throws here
/******/   if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/   ...
/******/ })();
```

And in the served `index.html`:

```html
<script src="styles.js" defer></script>             <!-- classic <script> -->
<script src="vendor.js" type="module"></script>     <!-- module <script> -->
<script src="main.js"   type="module"></script>     <!-- module <script> -->
```

Note that `main.js` and `vendor.js` are tagged `type="module"`, but `styles.js` is **not**. Yet `styles.js` contains `import.meta.url`, which is only valid in module scripts. Browsers reject the file → `SyntaxError`.

## Root Cause

Four pieces have to line up for this bug to bite. Removing any one of them avoids it.

### 1. Module Federation pulls runtime code into `styles.js`

When `withModuleFederation` from `@nx/module-federation/angular` is applied to a webpack config, it adds the `ModuleFederationPlugin` and enables `experiments.outputModule: true`. The MF runtime code (from `@module-federation/runtime`) needs to be available wherever a chunk could load a remote — which includes the global styles entry.

You can confirm this by curling the dev-served `styles.js` and grepping for federation references:

```bash
curl -s http://localhost:4200/styles.js | grep -E "module-federation|getPublicPath" | head
# matches @module-federation/runtime code embedded inside styles.js
```

### 2. The MF runtime references `__webpack_require__.p`

`__webpack_require__.p` is webpack's *publicPath* — the prefix used to load lazy chunks at runtime. The MF runtime uses it to resolve remote container URLs. Any chunk that touches `__webpack_require__.p` causes webpack to inject the `webpack/runtime/publicPath` helper into that chunk.

### 3. `output.publicPath: 'auto'` triggers the runtime helper

`withModuleFederation` sets `output.publicPath: 'auto'`. With `'auto'`, webpack doesn't know the publicPath at build time, so it has to compute it at runtime by inspecting the URL of the currently-executing script. That's what the helper does.

### 4. `experiments.outputModule: true` selects the *module-only* helper variant

Webpack 5 has two flavors of the auto-publicPath helper:
- **Module-only:** uses `import.meta.url`. Only works when loaded as `<script type="module">`.
- **Dual-mode:** uses `document.currentScript.src`, with a `document.getElementsByTagName('script')` fallback. Works in classic and module scripts.

Webpack picks one based on `output.scriptType`:
- `output.scriptType: 'module'` → emits the module-only helper.
- `output.scriptType: false` (the default) → emits the dual-mode helper.

`experiments.outputModule: true` (set by `withModuleFederation`) **implies `output.scriptType: 'module'`**, so the module-only helper is what ends up in `styles.js`.

### And the kicker — Angular tags `styles.js` as classic

Angular's webpack-based browser builder (`@nx/angular:webpack-browser`) generates the dev `index.html` and only tags entry points it considers JavaScript code (`main`, `vendor`, polyfills) as `type="module"`. The `styles` entry is historically pure CSS or near-empty boilerplate, so it gets a plain `<script defer>`. With Module Federation in the picture, that assumption no longer holds — but the HTML generator wasn't updated for it.

This is the inconsistency: webpack thinks every chunk is a module (so it emits module-only runtime helpers), Angular thinks `styles.js` isn't a module (so it tags it classic). Browser tries to parse `import.meta` in classic context → boom.

## Why production works

In `dist/apps/host1/index.html` after `nx build`, you see this:

```html
<link rel="stylesheet" href="styles.css">
...
<script src="main.js" type="module"></script>
```

Notice — **no `styles.js`**. In the production build, all global styles are extracted to a CSS file, and the federation runtime lives entirely in `main.js`, which *is* a module script. The four conditions never line up. The bug is **dev-server-only**.

## The Fix

Override `output.scriptType` after `withModuleFederation` finishes setting up. Setting it to `false` (the webpack default) downgrades the publicPath helper to the dual-mode variant, which works in both classic and module script contexts.

For each app — **all 3 hosts and all 6 remotes** — replace [webpack.config.ts](../apps/host1/webpack.config.ts):

```ts
import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';

/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
export default async (webpackConfig: unknown) => {
  const apply = await withModuleFederation(config, { dts: false });
  const cfg = (apply as (c: unknown) => { output?: Record<string, unknown> })(webpackConfig);
  // Force the dual-mode publicPath helper. The MF plugin enables
  // experiments.outputModule which makes webpack emit an `import.meta.url`-only
  // helper. Angular's dev HTML generator tags styles.js as a classic <script>,
  // causing a SyntaxError when it hits import.meta. Setting scriptType: false
  // makes webpack emit the document.currentScript fallback variant.
  cfg.output = { ...cfg.output, scriptType: false };
  return cfg;
};
```

### Important detail — `withModuleFederation` returns `Promise<(config) => updatedConfig>`

The naive wrap-and-call doesn't work:

```ts
// ❌ Broken — TypeError: baseConfig is not a function
const baseConfig = withModuleFederation(config, { dts: false });
export default async (webpackConfig: unknown) => {
  const cfg = await (baseConfig as Function)(webpackConfig);
  ...
};
```

`withModuleFederation` is `async` and returns a Promise, so you have to `await` it **first** to get the inner function, **then** call that function with the webpack config. The fix above does exactly this in two steps:

```ts
const apply = await withModuleFederation(config, { dts: false });  // unwrap the Promise
const cfg = apply(webpackConfig);                                  // call the function
```

### How many files to update

Every app that uses `withModuleFederation` — all 3 hosts and 6 remotes in this repo. Even though remotes don't render `styles.js` to a browser themselves, when a host federates a remote at runtime the host's MF runtime is what loads the remote's `remoteEntry.mjs`. The bug is fully fixed by patching only the *hosts*, but applying to all 9 keeps the configs consistent and avoids surprises if a remote is ever served standalone for testing.

## Verification

### 1. Compare `styles.js` before and after

Start the dev server (`pnpm nx serve host1`) and curl the styles bundle:

```bash
curl -s http://localhost:4200/styles.js | grep -c "import\.meta\.url"
curl -s http://localhost:4200/styles.js | grep -c "document\.currentScript"
```

| | Before fix | After fix |
|---|---|---|
| `import.meta.url` occurrences | ≥ 1 | **0** |
| `document.currentScript` occurrences | 0 | **≥ 5** |

### 2. Inspect the helper directly

Find the `webpack/runtime/publicPath` block:

```bash
curl -s http://localhost:4200/styles.js | awk '/webpack\/runtime\/publicPath/,/__webpack_require__\.p = /'
```

After the fix it should look like:

```js
/* webpack/runtime/publicPath */
(() => {
  var scriptUrl;
  if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
  var document = __webpack_require__.g.document;
  if (!scriptUrl && document) {
    if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
      scriptUrl = document.currentScript.src;
    if (!scriptUrl) {
      var scripts = document.getElementsByTagName("script");
      if (scripts.length) {
        var i = scripts.length - 1;
        while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
      }
    }
  }
  ...
})();
```

No `import.meta.url`. Three resolution strategies (web worker, currentScript, script tag scan), all classic-script-safe.

### 3. End-to-end smoke test

```bash
pnpm nx serve host1 --devRemotes=remote1,remote2,remote3,remote4,remote5,remote6
```

Open `http://localhost:4200`. Console should be clean — no `SyntaxError`. Click each `Remote N` link and confirm the federated module loads.

Repeat for `host2` (port 4300) and `host3` (port 4400).

### 4. Production build still works

```bash
pnpm nx run-many -t build --projects=host1,host2,host3,remote1,remote2,remote3,remote4,remote5,remote6
```

All 9 builds should succeed exactly as before — the override only affects the resolved webpack config and `scriptType: false` is the webpack default for the production output anyway.

## Alternatives considered

These also fix the symptom, but were rejected for various reasons:

| Approach | Verdict |
|---|---|
| Add `type="module"` to the `styles.js` `<script>` tag via Angular's `indexHtmlTransformer` | More invasive — requires a separate transformer file and config wiring, just to flip one attribute. The `output.scriptType` override achieves the same end with less surface area. |
| Drop the global `styles.scss` entry from `project.json` | Eliminates `styles.js` entirely, which fixes the bug — but loses global stylesheet support. Acceptable only if you commit to inline component styles forever. |
| Hard-code `output.publicPath: '/'` (or any string) | Skips the runtime helper outright. Works in dev where everything is on `localhost:4200`, but breaks production federation where each remote needs its own publicPath. |
| Wait for an upstream fix (Angular's HTML generator or `@nx/module-federation`) | Reasonable long-term, but not actionable today. The override above is a self-contained, reversible workaround. |

## Applicability

You're affected if **all** of these are true:

- Nx workspace using `@nx/angular:webpack-browser` (not `@angular/build` esbuild)
- Module Federation via `@nx/module-federation/angular#withModuleFederation`
- Webpack 5 (any 5.x — the helper code is identical across patch versions)
- Running `nx serve` (dev server). Production `nx build` is unaffected.

Versions where this was confirmed:

- `nx@22.7.0`
- `@nx/angular@22.7.0`
- `@nx/module-federation@22.7.0`
- `@angular/*@21.2.x`
- `webpack@5.x` (transitive)

If any of those bumps and `withModuleFederation` stops setting `experiments.outputModule: true`, **or** Angular starts tagging `styles.js` as `type="module"` in the dev HTML, this workaround becomes unnecessary. You can verify by re-running the [verification](#verification) steps after the upgrade — if `import.meta.url` doesn't reappear in `styles.js`, you can revert the wrapper.

## References

- Webpack 5 `output.scriptType`: https://webpack.js.org/configuration/output/#outputscripttype
- Webpack 5 auto publicPath helper source: `node_modules/webpack/lib/runtime/AutoPublicPathRuntimeModule.js`
- `@nx/module-federation/angular` `withModuleFederation` source: `node_modules/@nx/module-federation/src/with-module-federation/angular/with-module-federation.js`
- MDN `import.meta`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta — "valid only in module scripts"
