import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    proxy: {
      // Proxy Ollama requests during local development
      '/ollama': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ''),
      },
      // Proxy trusted health resources for live retrieval during local development
      '/healthlinkbc': {
        target: 'https://www.healthlinkbc.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/healthlinkbc/, ''),
      },
      '/smartsexresource': {
        target: 'https://smartsexresource.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/smartsexresource/, ''),
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
