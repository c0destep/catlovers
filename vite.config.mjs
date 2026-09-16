import { readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import htmlInclude from 'vite-plugin-html-include'

const root = dirname(fileURLToPath(import.meta.url))

// Site multipágina: o Vite só descobre o index.html sozinho, então cada página
// da raiz precisa entrar explicitamente como entrada do Rollup.
const htmlEntries = Object.fromEntries(
  readdirSync(root)
    .filter((file) => file.endsWith('.html'))
    .map((file) => [file.slice(0, -'.html'.length), resolve(root, file)])
)

export default defineConfig({
  base: './',

  plugins: [
    htmlInclude()
  ],

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: htmlEntries
    }
  },

  server: {
    host: '127.0.0.1',
    open: true,
    port: 1234,
    strictPort: true
  },

  preview: {
    host: '127.0.0.1',
    port: 1234,
    strictPort: true
  }
})
