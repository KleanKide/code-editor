import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "y-protocols/awareness": "y-protocols/awareness.js",
    },
  },
  optimizeDeps: {
    include: ["y-monaco", "y-protocols/awareness.js"],
  },
});
