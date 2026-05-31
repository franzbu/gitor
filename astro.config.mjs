import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gitor.uk',
  integrations: [sitemap()],
  output: 'static',
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  })
});