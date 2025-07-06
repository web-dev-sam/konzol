# unplugin-konzol [![npm](https://img.shields.io/npm/v/konzol.svg)](https://npmjs.com/package/unplugin-macros) [![Unit Tests](https://github.com/web-dev-sam/konzol/actions/workflows/ci.yml/badge.svg)](https://github.com/web-dev-sam/konzol/actions/workflows/ci.yml)
&nbsp;
<center>
<img src="https://raw.githubusercontent.com/web-dev-sam/konzol/9adc7003011a194caaf4495290de485a16dd5e47/docs/logo.svg" height="100">
</center>
&nbsp;

&nbsp;

A zero-runtime, compile-time logging macro for JavaScript and TypeScript. Add powerful, expressive logs to your code that are automatically removed in production builds (0 bytes shipped!).

## Features

- Write logs with macro syntax: `log!(...)`
- Supports string interpolation, object/array path extraction, wildcards, and format modifiers
- Logs are stripped from production bundles
- Works with Vite, Rollup, Webpack, and more (Currently only tested with Vite)

## Installation

```sh
pnpm add -D konzol@latest
# or
npm i -D konzol@latest
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import Konzol from 'konzol/vite';

export default defineConfig({
  plugins: [
    Konzol()
  ],
})

// konzol.d.ts (Soon this is no longer needed)
declare function log(format: string, ...args: unknown[]): void
```

See the playground and tests for more advanced patterns! Docs are in the making...

## Example Usage

```ts
// Plain string
log!("Hello, world!")

// String with placeholder
log!("User ID: {}", userId)

// Multiple arguments
log!("User {} has role {}", user.name, user.role)

// Object path extraction
log!("Theme: {settings.theme}", profile) // profile.settings.theme

// Array element by index
log!("Second item: {items.1}", items) // items[1]

// Wildcard object extraction
log!("Names: {*.name}", users) // users.map(user => user.name)

// Format modifiers
log!("Theme: {settings.theme:v|0}", profile) // Object.values(profile.settings.theme)[0]

// Deep Search
log!("Theme: {settings.theme:@dark}", profile) // Anything in profile.settings.theme that includes "dark" like "github-dark"
```

## 0 Bytes in Production

All `log!` macros are removed at build time. No code is shipped to production, ensuring zero runtime cost.

## License
MIT License © 2025-PRESENT Samuel Braun
