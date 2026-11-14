import assert from "assert";
import * as _ from "./path";

type RegistryValueOf<M extends object, K extends string> = K extends keyof M ? M[K] : unknown;

/**
 * A simple keyed store. Keys are lodash property paths such as "config.db.host";
 * setting "a.b" creates nested objects, so has("a") is then true as well.
 *
 * Pass a key-to-type map as the type parameter to get typed reads and writes for known
 * keys. Any other key is still accepted and typed as unknown.
 *
 * @example
 * interface AppRegistry { db: Database; "config.port": number }
 * const registry = new PocketRegistry<AppRegistry>();
 * registry.get("db"); // Database
 *
 * Methods are bound to the instance, so they can be passed around on their own.
 * Create as many registries as you need; nothing is shared between instances.
 */
class PocketRegistry<M extends object = Record<string, unknown>> {
  /**
   * Stores `value` under `key`.
   * @throws AssertionError if `key` already exists or `value` is undefined.
   */
  readonly set: <K extends string>(key: K, value: RegistryValueOf<M, K>) => void;

  /**
   * Returns the value stored under `key`.
   * Without a default, a missing key throws an AssertionError. With a default, a missing
   * key returns the default instead.
   */
  readonly get: PocketRegistry.Getter<M>;

  /** True if `key` (a property path) exists. */
  readonly has: (key: PocketRegistry.RegistryKey) => boolean;

  /** Deletes `key`. Does nothing if it doesn't exist. */
  readonly remove: (key: PocketRegistry.RegistryKey) => void;

  /** The top-level keys (the first segment of each path), read-only. */
  declare readonly keys: string[];

  constructor() {
    const register: Record<string, unknown> = {};

    const has = (key: PocketRegistry.RegistryKey): boolean => _.has(register, key);

    this.set = <K extends string>(key: K, value: RegistryValueOf<M, K>): void => {
      assert(!has(key), `Registry already has a '${key}'.`);
      assert(value !== undefined, `'${key}' cannot be set to undefined.`);
      _.set(register, key, value);
    };

    // Boundary: the Getter overloads describe the result; lodash's get only knows unknown.
    this.get = ((key: string, defaultValue?: unknown): unknown => {
      if (defaultValue === undefined) {
        assert(has(key), `Registry key '${key}' not found, default not provided!`);
      }
      return _.get(register, key, defaultValue);
    }) as PocketRegistry.Getter<M>;

    this.has = has;

    this.remove = (key: PocketRegistry.RegistryKey): void => {
      _.unset(register, key);
    };

    // A read-only, non-enumerable 'keys' property, using top-level objects only.
    Object.defineProperties(this, {
      keys: {
        get: () => Object.keys(register),
      },
    });
  }
}

declare namespace PocketRegistry {
  /** A lodash-style property path, e.g. "config.db.host". */
  type RegistryKey = string;

  /** The type stored under `K`: from the map `M` for a known key, otherwise unknown. */
  type RegistryValue<M extends object, K extends string> = RegistryValueOf<M, K>;

  interface Getter<M extends object> {
    <K extends string>(key: K): RegistryValue<M, K>;
    <K extends string, D>(key: K, defaultValue: D): RegistryValue<M, K> | D;
  }
}

// Export the class, not an instance, so an application can have more than one registry.
export = PocketRegistry;
