import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['generated-image.ico', 'generated-image.png'],
      manifest: {
        name: 'DocKit 本地文书工具箱',
        short_name: 'DocKit',
        description: '隐私友好的本地 PDF 盖章与文书处理工具箱。',
        theme_color: '#eef4fb',
        background_color: '#eef4fb',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        start_url: '/',
        icons: [
          {
            src: '/generated-image.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/generated-image.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
      },
    }),
  ],
})
