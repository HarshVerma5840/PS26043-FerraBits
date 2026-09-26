import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In dev, proxy every backend path prefix to the API Gateway at localhost:8080.
    // In production, VITE_API_BASE_URL is set to the real gateway URL and this
    // proxy block has no effect — requests are sent directly to the gateway.
    proxy: {
      '/auth': 'http://localhost:8080',
      '/users': 'http://localhost:8080',
      '/registration': 'http://localhost:8080',
      '/reviewer': 'http://localhost:8080',
      '/source': 'http://localhost:8080',
      '/sources': 'http://localhost:8080',
      '/domains': 'http://localhost:8080',
      '/problems': 'http://localhost:8080',
      '/audit': 'http://localhost:8080',
      '/evaluation': 'http://localhost:8080',
      '/portal': 'http://localhost:8080',
      '/codejudge': 'http://localhost:8080',
      '/capability': 'http://localhost:8080',
      '/notifications': 'http://localhost:8080',  // NotificationController
    },
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react') || id.includes('react-hot-toast')) return 'ui';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'maps';
            if (id.includes('@tanstack/react-query')) return 'query';
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router/')) return 'vendor';
            return 'vendor-other';
          }
        }
      }
    }
  }
})
