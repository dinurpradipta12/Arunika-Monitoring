import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Prevents "process is not defined" error in browser
    'process.env': process.env
  }
});