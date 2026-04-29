// Note: re-add .ts extensions to imports below if running codegen via
// Node native TypeScript (npm run generate:types). The Payload CLI
// regenerates this file without them when you run migrate:create.
import * as migration_20260429_045222_initial from './20260429_045222_initial.ts'
import * as migration_20260429_053253_add_color_image_url from './20260429_053253_add_color_image_url.ts'
import * as migration_20260429_063949_extend_specs_and_description from './20260429_063949_extend_specs_and_description.ts'

export const migrations = [
  {
    up: migration_20260429_045222_initial.up,
    down: migration_20260429_045222_initial.down,
    name: '20260429_045222_initial',
  },
  {
    up: migration_20260429_053253_add_color_image_url.up,
    down: migration_20260429_053253_add_color_image_url.down,
    name: '20260429_053253_add_color_image_url',
  },
  {
    up: migration_20260429_063949_extend_specs_and_description.up,
    down: migration_20260429_063949_extend_specs_and_description.down,
    name: '20260429_063949_extend_specs_and_description',
  },
]
