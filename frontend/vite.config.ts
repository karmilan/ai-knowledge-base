import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ask': {
        target: 'import.meta.env.VITE_API_URL',
        changeOrigin: true,
      },
    },
  },
})
