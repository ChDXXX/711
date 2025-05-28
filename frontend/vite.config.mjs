import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "./", // 关键点：告诉 Vite 所有资源路径从根路径加载
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          mantine: ['@mantine/core', '@mantine/hooks'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ethers: ['ethers'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: 'localhost',
    hmr: {
      port: 3001,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001/digital-skill-wallet/us-central1',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'ethers',
    ],
  },
});
