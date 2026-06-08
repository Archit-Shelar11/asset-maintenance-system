import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/users': 'http://localhost:8080',
      '/tasks': 'http://localhost:8080',
      '/materials': 'http://localhost:8080',
      '/assets': 'http://localhost:8080'
    }
  }
})
