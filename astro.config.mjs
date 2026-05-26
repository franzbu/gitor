// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'static', // Static is best for a text/poem site
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  })
});