import * as migration_20260429_045222_initial from './20260429_045222_initial.ts';
import * as migration_20260429_053253_add_color_image_url from './20260429_053253_add_color_image_url.ts';
import * as migration_20260429_063949_extend_specs_and_description from './20260429_063949_extend_specs_and_description.ts';
import * as migration_20260505_060257_hero_slides_and_finance from './20260505_060257_hero_slides_and_finance.ts';
import * as migration_20260506_031225_add_orders from './20260506_031225_add_orders.ts';
import * as migration_20260514_014232_add_sms_inbox from './20260514_014232_add_sms_inbox.ts';
import * as migration_20260514_015237_add_user_push_sms from './20260514_015237_add_user_push_sms.ts';
import * as migration_20260514_021600_add_customers from './20260514_021600_add_customers.ts';
import * as migration_20260906_225436_add_posts from './20260906_225436_add_posts.ts';

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
  {
    up: migration_20260514_014232_add_sms_inbox.up,
    down: migration_20260514_014232_add_sms_inbox.down,
    name: '20260514_014232_add_sms_inbox',
  },
  {
    up: migration_20260514_015237_add_user_push_sms.up,
    down: migration_20260514_015237_add_user_push_sms.down,
    name: '20260514_015237_add_user_push_sms',
  },
  {
    up: migration_20260514_021600_add_customers.up,
    down: migration_20260514_021600_add_customers.down,
    name: '20260514_021600_add_customers',
  },
  {
    up: migration_20260906_225436_add_posts.up,
    down: migration_20260906_225436_add_posts.down,
    name: '20260906_225436_add_posts'
  },
];
