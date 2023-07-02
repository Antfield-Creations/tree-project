import {defineConfig} from "vite";

export default defineConfig({
  build: {
    target: 'esnext', // Allow top-level awaits
    sourcemap: true,
    minify: false
  },
})
