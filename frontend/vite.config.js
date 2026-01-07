import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { commonjsFixPlugin } from './vite-plugins/commonjs-fix.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    commonjsFixPlugin()
  ],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        warn(warning)
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
    }
  },
  optimizeDeps: {
    // Exclude the main Stream SDK but include its problematic dependencies
    exclude: ['@stream-io/video-react-sdk'],
    // Force include and transform all problematic CommonJS modules
    include: [
      'sdp',
      'sdp-transform',
      'ua-parser-js',
      'webrtc-adapter',
    ],
    // Force pre-bundling to handle CommonJS properly
    force: true,
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Create proper aliases for problematic modules
      'ua-parser-js': 'ua-parser-js/src/ua-parser.js',
      'sdp-transform': 'sdp-transform/lib/index.js'
    }
  }
})
