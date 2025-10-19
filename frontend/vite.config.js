import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost', // Ensures the server binds to localhost
    port: 5173,        // Default Vite port
    strictPort: true,  // Ensures the server fails if the port is already in use
    proxy: {
      '/api': {
        target: 'http://localhost:5002', // Backend server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
