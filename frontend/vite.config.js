import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/booom-hub/',
  server: {
    port: 5173,
  },
});
