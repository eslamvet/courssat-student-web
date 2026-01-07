import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: ['.ngrok-free.app', '.uks1.devtunnels.ms'],
  },
});
