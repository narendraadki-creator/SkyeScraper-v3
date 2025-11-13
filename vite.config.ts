import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Optimize for low resource usage
  optimizeDeps: {
    disabled: false,
    force: false, // Don't force re-optimization
    entries: [], // Don't pre-bundle dependencies
  },
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
    // Minimal resource usage for file watching
    watch: {
      usePolling: false,
      interval: 5000, // Check for changes every 5 seconds to reduce CPU usage
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/docs/**'], // Ignore more directories
    },
    // Disable HMR to save resources
    hmr: false,
    // Performance optimizations
    fs: {
      strict: false,
    },
  },
  build: {
    // Minimal resource usage during build
    emptyOutDir: true,
    sourcemap: false, // Disable source maps to save resources
    minify: false, // Disable minification to save CPU
    target: 'es2015',
    rollupOptions: {
      onwarn: () => {}, // Suppress warnings
      maxParallelFileOps: 1, // Limit parallel file operations
    },
  },
  // Define to avoid env variable processing overhead
  define: {
    'process.env.NODE_ENV': '"development"',
  },
})
