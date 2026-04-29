import * as migration_20260429_045222_initial from './20260429_045222_initial';
import * as migration_20260429_053253_add_color_image_url from './20260429_053253_add_color_image_url';

export const migrations = [
  {
    up: migration_20260429_045222_initial.up,
    down: migration_20260429_045222_initial.down,
    name: '20260429_045222_initial',
  },
  {
    up: migration_20260429_053253_add_color_image_url.up,
    down: migration_20260429_053253_add_color_image_url.down,
    name: '20260429_053253_add_color_image_url'
  },
];
