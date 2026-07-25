import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative asset URLs, so the build works at a domain root and in a subfolder.
  base: './',
  plugins: [react(), tailwindcss()],
})
