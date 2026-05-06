// Note: re-add .ts extensions to imports below if running codegen via
// Node native TypeScript (npm run generate:types / npm run migrate).
// The Payload CLI regenerates this file WITHOUT them when you run
// migrate:create — re-fix it after every regeneration.
import * as migration_20260429_045222_initial from './20260429_045222_initial.ts'
import * as migration_20260429_053253_add_color_image_url from './20260429_053253_add_color_image_url.ts'
import * as migration_20260429_063949_extend_specs_and_description from './20260429_063949_extend_specs_and_description.ts'
import * as migration_20260505_060257_hero_slides_and_finance from './20260505_060257_hero_slides_and_finance.ts'
import * as migration_20260506_031225_add_orders from './20260506_031225_add_orders.ts'

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
  {
    up: migration_20260505_060257_hero_slides_and_finance.up,
    down: migration_20260505_060257_hero_slides_and_finance.down,
    name: '20260505_060257_hero_slides_and_finance',
  },
  {
    up: migration_20260506_031225_add_orders.up,
    down: migration_20260506_031225_add_orders.down,
    name: '20260506_031225_add_orders',
  },
]
