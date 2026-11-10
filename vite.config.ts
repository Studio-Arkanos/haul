import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          supabase: ['@supabase/supabase-js'],
          react: ['react', 'react-dom', '@tanstack/react-router'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    // Le preview Arena proxifie via *.e2b.app — on autorise ces hôtes
    allowedHosts: ['.e2b.app'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
