import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const repoName = 'max-pulse-miniapp.github.io';
const isGithubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  base: isGithubPages ? `/${repoName}/` : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
