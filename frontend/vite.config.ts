import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In dev, proxy every backend path prefix to the API Gateway.
    // In production, VITE_API_BASE_URL is set to the real gateway URL.
    proxy: (() => {
      const target = process.env.VITE_API_BASE_URL || process.env.VITE_GATEWAY_URL || 'http://localhost:8080'
      const prefixes = [
        '/auth', '/users', '/registration', '/reviewer', '/source', '/sources',
        '/domains', '/problems', '/citizen', '/uploads', '/audit',
        '/evaluation', '/portal', '/codejudge', '/capability', '/notifications'
      ]
      return prefixes.reduce((acc, prefix) => {
        acc[prefix] = { target, changeOrigin: true }
        return acc
      }, {} as Record<string, { target: string; changeOrigin: boolean }>)
    })(),
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
