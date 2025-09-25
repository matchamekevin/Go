import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@features': resolve(__dirname, './src/features'),
      '@shared': resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:7000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})