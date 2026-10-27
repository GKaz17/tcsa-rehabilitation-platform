import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import seoPlugin from './build/seo-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seoPlugin()],
  server: {
    proxy: {
      '/api': {
        // The optional target keeps isolated browser tests off the user's database.
        target: process.env.TCSA_API_TARGET || 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
})
