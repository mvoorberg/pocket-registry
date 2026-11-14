// Compiled by `npm run typecheck` only: checks the published types the way a consumer uses them.
import PocketRegistry = require("../../dist");

interface AppRegistry {
  port: number;
  "db.host": string;
}

const typed = new PocketRegistry<AppRegistry>();
typed.set("port", 7077);
const port: number = typed.get("port");
const host: string | undefined = typed.get("db.host", undefined as string | undefined);
// Unknown keys are allowed and typed as unknown.
const other: unknown = typed.get("anything.else", 1);

const plain = new PocketRegistry();
plain.set("a.b", { c: 1 });
const exists: boolean = plain.has("a");
plain.remove("a.b");
const keys: string[] = plain.keys;
// Methods are bound, so they work detached.
const { get } = plain;
get("a", null);

// @ts-expect-error -- a known key must get a value of its declared type
typed.set("port", "not a number");

export { port, host, other, exists, keys };
