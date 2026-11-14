/**
 * The property-path helpers the registry needs: get, set, has and unset, following
 * lodash 4's rules so existing keys behave the same.
 *
 * Paths are lodash paths: "a.b.c", "list[0].name", 'map["key.with.dots"]', or an array of
 * segments. A string that's already an own key of the object is used as-is.
 */

export type PathSegment = string | number;
export type Path = string | readonly PathSegment[];

type Container = Record<PropertyKey, unknown>;

// lodash's path parsing (stringToPath / isKey).
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
const reEscapeChar = /\\(\\)?/g;
const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
const reIsPlainProp = /^\w*$/;
const reIsUint = /^(?:0|[1-9]\d*)$/;

/** Segments that could reach Object.prototype. set() and unset() refuse them, as lodash does. */
const UNSAFE_SEGMENTS = new Set(["__proto__", "constructor", "prototype"]);

function isObjectLike(value: unknown): value is Container {
  return value !== null && (typeof value === "object" || typeof value === "function");
}

function isKey(value: string, object: unknown): boolean {
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || (isObjectLike(object) && value in object);
}

function stringToPath(value: string): string[] {
  const result: string[] = [];
  if (value.charCodeAt(0) === 46 /* . */) {
    result.push("");
  }
  // When `quote` is set, the regex has also captured `subString` (possibly empty).
  value.replace(rePropName, (match: string, number: string | undefined, quote: string | undefined, subString: string): string => {
    result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
    return match;
  });
  return result;
}

/** A segment as a property key. -0 stays "-0", as in lodash. */
function toKey(segment: PathSegment): string {
  if (typeof segment === "number" && Object.is(segment, -0)) {
    return "-0";
  }
  return String(segment);
}

/** The path's segments as given; numbers in an array path stay numbers. */
function castRawPath(path: Path, object: unknown): PathSegment[] {
  if (Array.isArray(path)) {
    return [...path];
  }
  const text = String(path);
  return isKey(text, object) ? [text] : stringToPath(text);
}

/** The path's segments as property keys. */
function castPath(path: Path, object: unknown): string[] {
  return castRawPath(path, object).map(toKey);
}

/** Whether a segment names an array index (lodash's isIndex): checked before toKey, so -0 counts. */
function isIndex(segment: PathSegment | undefined): boolean {
  const isCandidate = typeof segment === "number" || (typeof segment === "string" && reIsUint.test(segment));
  const value = Number(segment);
  return isCandidate && value > -1 && value % 1 === 0 && value < Number.MAX_SAFE_INTEGER;
}

/** The value at `path`, or `defaultValue` when it resolves to undefined. Reads inherited properties too. */
export function get(object: unknown, path: Path, defaultValue?: unknown): unknown {
  const segments = castPath(path, object);
  let current: unknown = object;
  let index = 0;
  for (; current != null && index < segments.length; index++) {
    // Boundary: plain property access, as lodash does (primitives included).
    current = (current as Container)[segments[index] as string];
  }
  // Stopping early (a null or undefined parent) means "not found", even if a parent was null.
  const result = index > 0 && index === segments.length ? current : undefined;
  return result === undefined ? defaultValue : result;
}

/** True if every segment of `path` is an own property. */
export function has(object: unknown, path: Path): boolean {
  const segments = castPath(path, object);
  let current: unknown = object;
  let result = false;
  let index = 0;
  for (; index < segments.length; index++) {
    const key = segments[index] as string;
    result = current != null && Object.prototype.hasOwnProperty.call(current, key);
    if (!result) {
      break;
    }
    current = (current as Container)[key];
  }
  if (result || index !== segments.length) {
    return result;
  }
  return false;
}

/**
 * Sets the value at `path`, creating missing (or non-object) parents: an array when the
 * next segment is an index, otherwise an object. Paths through __proto__, constructor
 * or prototype are ignored.
 */
export function set(object: Container, path: Path, value: unknown): void {
  const rawSegments = castRawPath(path, object);
  const segments = rawSegments.map(toKey);
  let nested: Container = object;
  for (let index = 0; index < segments.length; index++) {
    const key = segments[index] as string;
    if (UNSAFE_SEGMENTS.has(key)) {
      return;
    }
    if (index === segments.length - 1) {
      nested[key] = value;
      return;
    }
    const existing = nested[key];
    const next = rawSegments[index + 1];
    // Boundary: an array is used as a keyed container here, like any object.
    const child: Container = isObjectLike(existing) ? existing : isIndex(next) ? ([] as unknown as Container) : {};
    nested[key] = child;
    nested = child;
  }
}

/** Deletes the property at `path`. Paths through __proto__, constructor or prototype are ignored. */
export function unset(object: Container, path: Path): void {
  const segments = castPath(path, object);
  if (segments.length === 0 || segments.some((segment) => UNSAFE_SEGMENTS.has(segment))) {
    return;
  }
  const parent = segments.length === 1 ? object : get(object, segments.slice(0, -1));
  if (isObjectLike(parent)) {
    delete parent[segments[segments.length - 1] as string];
  }
}
