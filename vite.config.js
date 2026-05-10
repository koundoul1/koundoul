import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
    include: ['src/__tests__/**/*.{test,spec}.{js,jsx}'],
  },
  server: {
    port: 3002,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor-react'
            if (id.includes('/react/')) return 'vendor-react'
            if (id.includes('lucide-react')) return 'vendor-ui'
            if (id.includes('katex') || id.includes('rehype-katex') || id.includes('remark-math')) return 'vendor-math'
            if (id.includes('react-markdown') || id.includes('rehype-raw') || id.includes('remark-gfm')) return 'vendor-markdown'
            if (id.includes('qrcode')) return 'vendor-qr'
            // plotly: lazy-loaded via InteractiveGraph.jsx, Vite splits it automatically
          }
        }
      }
    }
  }
})
