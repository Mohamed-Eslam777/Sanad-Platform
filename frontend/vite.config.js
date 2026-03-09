import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 — uses the Vite plugin instead of PostCSS
  ],
  server: {
    port: 3000,
    proxy: {
      // All /api/* requests are forwarded to the Express backend on port 5000.
      // This avoids CORS issues during development entirely.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
