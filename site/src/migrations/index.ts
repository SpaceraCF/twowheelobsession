// Note: re-add .ts extensions to imports below if running codegen via
// Node native TypeScript (npm run generate:types). The Payload CLI
// regenerates this file without them when you run migrate:create.
import * as migration_20260429_045222_initial from './20260429_045222_initial.ts'

export const migrations = [
  {
    up: migration_20260429_045222_initial.up,
    down: migration_20260429_045222_initial.down,
    name: '20260429_045222_initial',
  },
]
