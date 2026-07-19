import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gitor.uk',
  integrations: [sitemap({
    filter: (page) => !page.endsWith('/offline/')
  })],
  output: 'static',
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  })
});
