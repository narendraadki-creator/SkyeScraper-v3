import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  esbuild: {
    jsx: 'automatic',
    target: 'es2015',
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    // Reduce CPU usage for file watching
    watch: {
      usePolling: false,
      interval: 1000, // Check for changes every 1 second instead of constantly
      ignored: ['**/node_modules/**', '**/dist/**'], // Ignore unnecessary directories
    },
    // Reduce HMR overhead
    hmr: {
      overlay: false, // Disable error overlay for better performance
      port: 24678, // Use a specific port for HMR
    },
    // Performance optimizations
    fs: {
      strict: false,
    },
  },
  build: {
    // Skip TypeScript checking during build for performance
    emptyOutDir: true,
    sourcemap: false, // Disable source maps for performance
    minify: false, // Disable minification for faster builds
    target: 'es2015',
    rollupOptions: {
      onwarn: () => {}, // Suppress warnings
    },
  },
  // Define to avoid env variable processing overhead
  define: {
    'process.env.NODE_ENV': '"development"',
  },
})
