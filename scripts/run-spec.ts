/**
 * Minimal jest-compatible runner for src/card-engine.spec.ts.
 *
 * The package has no test framework dependency; this implements just the
 * globals/matchers the spec uses so `pnpm test` works offline:
 *   npx tsx scripts/run-spec.ts
 * Exits non-zero when any test fails, so it can gate CI.
 */
import { isDeepStrictEqual } from "node:util";

type Test = { name: string; fn: () => unknown };
const tests: Test[] = [];
const stack: string[] = [];
const g = globalThis as any;

g.describe = (name: string, fn: () => void) => {
  stack.push(name);
  fn();
  stack.pop();
};
g.it = (name: string, fn: () => unknown) =>
  tests.push({ name: [...stack, name].join(" › "), fn });
g.it.each =
  (rows: unknown[]) => (name: string, fn: (...args: any[]) => unknown) =>
    rows.forEach((row) => {
      const args = Array.isArray(row) ? row : [row];
      g.it(name.replace("%s", String(args[0])), () => fn(...args));
    });
g.test = g.it;

const fmt = (v: unknown) => {
  try {
    return JSON.stringify(v)?.slice(0, 300);
  } catch {
    return String(v);
  }
};
const plain = (v: unknown) => JSON.parse(JSON.stringify(v ?? null));
const matchObject = (a: any, b: any): boolean =>
  b && typeof b === "object"
    ? Object.keys(b).every((k) => a != null && matchObject(a[k], b[k]))
    : isDeepStrictEqual(a, b);

function matchers(actual: any, negate: boolean): any {
  const check = (ok: unknown, msg: string) => {
    if (Boolean(ok) === negate) throw new Error((negate ? "NOT " : "") + msg);
  };
  const m: any = {
    toBe: (e: unknown) => check(Object.is(actual, e), `expected ${fmt(actual)} toBe ${fmt(e)}`),
    toEqual: (e: unknown) => check(isDeepStrictEqual(plain(actual), plain(e)), `expected ${fmt(actual)} toEqual ${fmt(e)}`),
    toContain: (e: unknown) => check(actual?.includes?.(e), `expected ${fmt(actual)} toContain ${fmt(e)}`),
    toMatch: (e: string | RegExp) => check(typeof e === "string" ? actual.includes(e) : e.test(actual), `expected ${fmt(actual)} toMatch ${e}`),
    toMatchObject: (e: unknown) => check(matchObject(actual, e), `expected ${fmt(actual)} toMatchObject ${fmt(e)}`),
    toBeDefined: () => check(actual !== undefined, "expected defined"),
    toBeUndefined: () => check(actual === undefined, `expected undefined, got ${fmt(actual)}`),
    toBeTruthy: () => check(actual, `expected truthy, got ${fmt(actual)}`),
    toBeGreaterThan: (e: number) => check(actual > e, `${actual} > ${e}`),
    toBeGreaterThanOrEqual: (e: number) => check(actual >= e, `${actual} >= ${e}`),
    toBeLessThan: (e: number) => check(actual < e, `${actual} < ${e}`),
    toBeLessThanOrEqual: (e: number) => check(actual <= e, `${actual} <= ${e}`),
    toHaveLength: (e: number) => check(actual?.length === e, `length ${actual?.length} === ${e}`),
    toHaveProperty: (e: string) => check(actual != null && e in actual, `has property ${e}`),
    toThrow: () => {
      let threw = false;
      try {
        actual();
      } catch {
        threw = true;
      }
      check(threw, "expected to throw");
    },
  };
  if (!negate) m.not = matchers(actual, true);
  return m;
}
g.expect = (actual: unknown) => matchers(actual, false);

(async () => {
  await import("../src/card-engine.spec");
  const failures: string[] = [];
  for (const t of tests) {
    try {
      await t.fn();
    } catch (err) {
      failures.push(`✗ ${t.name}\n    ${(err as Error).message?.split("\n")[0]}`);
    }
  }
  if (failures.length) console.log(failures.join("\n"));
  console.log(`\n${tests.length - failures.length} passed, ${failures.length} failed, ${tests.length} total`);
  process.exit(failures.length ? 1 : 0);
})();
