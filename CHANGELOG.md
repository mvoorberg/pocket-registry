# Changelog

## Unreleased

- Rewritten in TypeScript. Compiled output and type definitions ship in `dist/`.
  Runtime behaviour is unchanged.
- Types fixed: the package is a CommonJS `export =` (the old `index.d.ts` declared a
  default export), `remove()` returns `void`, and `keys` is `string[]`.
- `PocketRegistry` takes an optional key-to-type map, e.g. `new PocketRegistry<{ port: number }>()`,
  so known keys are typed; other keys are `unknown`. Code that relied on the old `any`
  return of `get()` needs a type argument or a cast.
- Methods are bound to the instance, so they also work when detached (`const { get } = registry`).
- `typescript` and `@types/lodash` moved from `dependencies` to `devDependencies`.
