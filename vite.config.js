import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Si tienes problemas con HTTPS del backend:
    proxy: {
      '/api': {
        target: 'https://localhost:7283',
        changeOrigin: true,
        secure: false, // Acepta certificados self-signed
      }
    }
  }
})
