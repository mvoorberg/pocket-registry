# Changelog

## Unreleased
- **Requires Node.js 22 or newer** (`engines.node` is `>=22`). The compiled code targets ES2023,
  and CI runs on Node 22 and 24.

- Rewritten in TypeScript. Compiled output and type definitions ship in `dist/`.
  Runtime behaviour is unchanged.
- Types fixed: the package is a CommonJS `export =` (the old `index.d.ts` declared a
  default export), `remove()` returns `void`, and `keys` is `string[]`.
- `PocketRegistry` takes an optional key-to-type map, e.g. `new PocketRegistry<{ port: number }>()`,
  so known keys are typed; other keys are `unknown`. Code that relied on the old `any`
  return of `get()` needs a type argument or a cast.
- Methods are bound to the instance, so they also work when detached (`const { get } = registry`).
- No runtime dependencies. lodash is replaced by a small built-in path module that follows
  lodash's rules for keys like `a.b`, `a[0]` and `a["x.y"]`, including refusing paths through
  `__proto__`, `constructor` and `prototype`. A test compares it against lodash.
- `typescript` is no longer a runtime dependency.
