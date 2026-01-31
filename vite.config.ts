import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Base public path when served in production
  // For GitHub Pages: set to '/your-repo-name/'
  // For custom domain or root: set to '/'
  base: '/WebJogoDiMomo/',
  
  // Build options
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate sourcemaps for debugging production builds
    sourcemap: true,
    
    // Minification
    minify: 'terser',
    
    // Rollup options for advanced bundling
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'phaser': ['phaser']
        }
      }
    }
  },
  
  // Development server options
  server: {
    port: 5173,
    strictPort: false,
    host: true, // Listen on all addresses (for mobile testing)
    open: true  // Auto-open browser on server start
  },
  
  // Preview server options (for 'npm run preview')
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: true
  }
});
