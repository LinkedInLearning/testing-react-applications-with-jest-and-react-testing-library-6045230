import { defineConfig, coverageConfigDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8', // Use V8's built-in coverage tool
      reporter: ['text', 'json', 'html'], // Generate reports in multiple formats
      exclude: [
        ...coverageConfigDefaults.exclude, // Use Vitest's default excluded files
        'src/main.tsx', // Exclude entry point files
        'src/types',
      ],
    },
  },
})
