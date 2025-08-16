import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
  // Proxy short-id routes (e.g. /abc123) to backend so redirects work in dev.
  // Exclude known frontend routes (login, profile, dashboard, etc.) so they
  // are handled by the SPA and not proxied. Adjust the excluded list as needed.
  // Assumption: short ids are alphanumeric with optional - or _, length 6-12.
  '^/(?!(?:login|profile|dashboard|register|forgot|reset|about|contact|home|main)$)([A-Za-z0-9_-]{6,12})$': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    },
  },
})