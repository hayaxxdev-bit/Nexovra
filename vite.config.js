import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/js'),
      '@css': path.resolve(__dirname, './src/css'),
      '@components': path.resolve(__dirname, './src/js/components'),
      '@services': path.resolve(__dirname, './src/js/services'),
      '@utils': path.resolve(__dirname, './src/js/utils'),
      '@pages': path.resolve(__dirname, './src/js/pages'),
      '@core': path.resolve(__dirname, './src/js/core'),
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['@supabase/supabase-js'],
          charts: ['chart.js']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})