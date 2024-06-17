import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const path = require("path")
// https://vitejs.dev/config/



export default defineConfig({
  build: {
    minify: false
  },
  plugins: [vue()],
  define: {
      "global": {},
      'process.env': {}
  },
  server: {
     port: parseInt(process.env.VITE_PORT) || 3000
   },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, '/src'),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        process: "process/browser",
        stream: "stream-browserify",
        zlib: "browserify-zlib",
        util: "util"
      }

    ]
  }
})
