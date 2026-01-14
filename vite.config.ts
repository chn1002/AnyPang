import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base public path for assets
  base: '/',
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true, // Allow external connections for mobile testing
  },
  
  // Preview server configuration (for testing production build)
  preview: {
    port: 4173,
    open: true,
  },
  
  // Build configuration
  build: {
    // Output directory (Netlify expects 'dist')
    outDir: 'dist',
    
    // Target modern browsers
    target: 'es2020',
    
    // Minification (use esbuild for faster builds and no extra dependency)
    minify: 'esbuild',
    
    // Generate source maps for debugging
    sourcemap: false,
    
    // Asset handling
    assetsDir: 'assets',
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    
    // Rollup options
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // Report compressed sizes
    reportCompressedSize: true,
    
    // Chunk size warning limit (kB)
    chunkSizeWarningLimit: 500,
  },
  
  // Path resolution (matching tsconfig paths)
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@entities': resolve(__dirname, 'src/entities'),
      '@scenes': resolve(__dirname, 'src/scenes'),
      '@systems': resolve(__dirname, 'src/systems'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@assets': resolve(__dirname, 'src/assets'),
    },
  },
  
  // Environment variable prefix
  envPrefix: 'VITE_',
  
  // Dependency optimization
  optimizeDeps: {
    // Include dependencies that need pre-bundling
    include: [],
    // Exclude dependencies from pre-bundling
    exclude: [],
  },
});
