# web-extension

This web extension is designed to allow the user of the extension to modify Fetch/XMLHttpRequest/WebSocket data for vulnurability & API testing. This is a privately used browser extension that is not to be distrubuted.

Using Node 20.20.1

if not installed do:

npm install web-ext
npm install vue-tsc
npm install vite

manifest.json should contain some commands:

"build": "vue-tsc --noEmit && vite build",
"watch": "vite build --watch --mode development --minify false",
"dev": "vite",
"serve:firefox": "web-ext run --start-url \"about:debugging#/runtime/this-firefox\"  --source-dir ./dist/",
"serve:chrome": "web-ext run -t chromium --start-url \"https://example.com\" --source-dir ./dist/"

## Usage Notes

The extension manifest is defined in `src/manifest.js` and used by `@samrum/vite-plugin-web-extension` in the vite config.

Background, content scripts, options, and popup entry points exist in the `src/entries` directory. 

Content scripts are rendered by `src/entries/contentScript/renderContent.js` which renders content within a ShadowRoot
and handles style injection for HMR and build modes.

Otherwise, the project functions just like a regular Vite project.

To switch between Manifest V2 and Manifest V3 builds, use the MANIFEST_VERSION environment variable defined in `.env`

HMR during development in Manifest V3 requires Chromium version >= 110.0.5480.0.

Refer to [@samrum/vite-plugin-web-extension](https://github.com/samrum/vite-plugin-web-extension) for more usage notes.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

## Commands
### Build
#### Development, HMR

Hot Module Reloading is used to load changes inline without requiring extension rebuilds and extension/page reloads
Currently only works in Chromium based browsers.
```sh
npm run dev
```

#### Development, Watch

Rebuilds extension on file changes. Requires a reload of the extension (and page reload if using content scripts)
```sh
npm run watch
```

#### Production

Minifies and optimizes extension build
```sh
npm run build
```

### Load extension in browser

Loads the contents of the dist directory into the specified browser
```sh
npm run serve:chrome
```

```sh
npm run serve:firefox
```
