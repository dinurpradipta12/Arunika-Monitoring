import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    base: '/', // 🔴 WAJIB untuk Cloudflare Pages

    plugins: [react()],

    define: {
      // Kalau masih ada kode lama yang pakai process.env.API_KEY
      'process.env': {
        API_KEY: JSON.stringify(env.VITE_API_KEY || '')
      }
    }
  };
});