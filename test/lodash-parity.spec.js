"use strict";
// pocket-registry used lodash's get/set/has/unset. It now has its own (src/path.ts);
// this checks they behave like lodash for the paths a registry sees. lodash is a
// devDependency only for this test.
const expect = require("chai").expect;
const lodash = require("lodash");
const ours = require("../dist/path");

const PATHS = [
  "a", "a.b", "a.b.c", "a[0]", "a[0].b", "a[1].c", 'a["x.y"]', "a['q']", "a.0", "a.1.b",
  ".a", "a.", "a..b", "a[]", "", "a[-1]", "a[1.5]", "x.y.z", "a.b.c.d.e",
  "transom-config.definition.uri.prefix", "transom-config.transom.cors",
  "with space.key", "a.b-c", "a\.b", "a[\"esc\\\"aped\"]",
  ["a", "b"], ["a.b"], ["list", 0, "name"], [],
  // Missing parents: an index segment creates an array, anything else an object.
  "fresh[0].name", "fresh.0.name", "fresh.list[2]", 'a[""]', "a['']",
  // Too large to be a safe array index, so the parent is an object.
  "big[9007199254740993].x", "big.9007199254740991.x",
  // Array paths with numbers, including -0, which lodash keeps as the key "-0".
  ["arr", -0], ["arr", 0, "x"], ["arr", 1.5], ["-0"],
];
const VALUES = [1, "str", null, false, 0, { nested: true }, [1, 2]];

function seed(fns) {
  const obj = {};
  fns.set(obj, "a.b.c", 1);
  fns.set(obj, "list", [{ name: "x" }]);
  fns.set(obj, "transom-config", { definition: { uri: { prefix: "/api/v1" } } });
  fns.set(obj, "n", null);
  fns.set(obj, "p", 5);
  return obj;
}

describe("path helpers match lodash", function () {
  it("get, has and get-with-default on a seeded object", function () {
    const ref = seed(lodash);
    const mine = seed(ours);
    expect(mine).to.deep.equal(ref);
    for (const path of PATHS.concat(["n.x", "p.x", "list[0].name", "toString", "a.b.toString"])) {
      expect(ours.get(mine, path), `get ${JSON.stringify(path)}`).to.deep.equal(lodash.get(ref, path));
      expect(ours.get(mine, path, "dflt"), `get default ${JSON.stringify(path)}`).to.deep.equal(lodash.get(ref, path, "dflt"));
      expect(ours.has(mine, path), `has ${JSON.stringify(path)}`).to.equal(lodash.has(ref, path));
    }
  });

  it("set produces the same structure", function () {
    for (const path of PATHS.concat(["p.x", "n.x", "a.b.c.d"])) {
      for (const value of VALUES) {
        const ref = seed(lodash);
        const mine = seed(ours);
        lodash.set(ref, path, value);
        ours.set(mine, path, value);
        expect(mine, `set ${JSON.stringify(path)}`).to.deep.equal(ref);
        expect(Array.isArray(ours.get(mine, "a")), `array shape ${JSON.stringify(path)}`).to.equal(Array.isArray(lodash.get(ref, "a")));
      }
    }
  });

  it("unset removes the same things", function () {
    for (const path of PATHS.concat(["list[0].name", "p.x", "n.x", "missing.deep"])) {
      const ref = seed(lodash);
      const mine = seed(ours);
      lodash.unset(ref, path);
      ours.unset(mine, path);
      expect(mine, `unset ${JSON.stringify(path)}`).to.deep.equal(ref);
    }
  });

  it("never writes to Object.prototype", function () {
    const attempts = ["__proto__.polluted", "constructor.prototype.polluted", "a.__proto__.polluted", ["__proto__", "polluted"], "prototype.polluted"];
    for (const path of attempts) {
      const obj = {};
      ours.set(obj, path, "yes");
      ours.unset(obj, path);
    }
    expect({}.polluted).to.equal(undefined);
    expect(Object.prototype.hasOwnProperty("polluted")).to.equal(false);
  });
});
