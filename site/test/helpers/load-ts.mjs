import { readFileSync, existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { createRequire } from "node:module"
import { runInNewContext } from "node:vm"
import ts from "typescript"

const nativeRequire = createRequire(import.meta.url)
// Load actual TS modules with explicit boundary mocks. Never import Payload config,
// a DB driver, Next's runtime, or a network client into these offline regressions.
export function createLoader(root, mocks = {}, globals = {}) {
  const cache = new Map()
  function load(file) {
    const filename = resolve(root, file)
    if (cache.has(filename)) return cache.get(filename).exports
    const loaded = { exports: {} }
    cache.set(filename, loaded)
    const source = ts.transpileModule(readFileSync(filename, "utf8"), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText
    const require = (name) => {
      if (Object.hasOwn(mocks, name)) return mocks[name]
      if (name.startsWith("node:")) return nativeRequire(name)
      if (name.startsWith(".") || name.startsWith("@/")) {
        const base = name.startsWith("@/") ? resolve(root, "src", name.slice(2)) : resolve(dirname(filename), name)
        const resolved = [base, base + ".ts", base + ".tsx"].find((candidate) => existsSync(candidate))
        if (resolved) return load(resolved)
      }
      throw new Error("Unmocked dependency blocked: " + name)
    }
    runInNewContext(source, {
      exports: loaded.exports, module: loaded, require, Buffer, URL, Request, Response, Headers, AbortSignal,
      console, process: { env: {} },
      fetch: () => { throw new Error("Unexpected network call blocked") },
      ...globals,
    }, { filename })
    return loaded.exports
  }
  return load
}
