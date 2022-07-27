import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ['**/*{js,css,html,ico,png,svg}']
      },
      includeAssets: [
        "favicon.png",
        "robots.txt",
        "196x196.png",
        "512x512.png"
      ],
      manifest: {
        id: '0.1',
        name: 'Open Slides',
        short_name: 'OpenSlides',
        description: 'Create awesome presentations with live collaboration',
        start_url: '/',
        theme_color: '#ffffff',
        icons: [
          {
            src: '196x196.png',
            sizes: '196x196',
            type: 'image/png'
          },
          {
            src: '512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
        ]
      },
      // strategies: 'injectManifest',
      // srcDir: 'src',
      // filename: 'my-sw.js'
    }),
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
});
