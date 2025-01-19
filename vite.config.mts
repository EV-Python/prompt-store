import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,tsx,ts,js}"
    })
  ],
  server: {
    port: 3000,
    hmr: {
      overlay: true
    }
  },
}) 