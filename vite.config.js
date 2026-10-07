import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleApiRequest } from './server/apiHandler.js';

function restApiPlugin() {
  return {
    name: 'rest-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          try {
            const handled = await handleApiRequest(req, res);
            if (handled) return;
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), restApiPlugin()],
  server: {
    port: 5173,
    open: false,
    watch: {
      ignored: ['**/testing/**', '**/*.md'],
    },
  },
  build: {
    sourcemap: false, // Prevents original raw source files from appearing in DevTools "Sources" tab
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
});
