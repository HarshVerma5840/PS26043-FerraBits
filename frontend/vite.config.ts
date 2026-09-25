import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
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
    }
  }
})
