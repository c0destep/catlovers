import { readFileSync, readdirSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const root = dirname(fileURLToPath(import.meta.url))
const includesRoot = resolve(root, 'includes')
const includePattern = /<include\s+file=(["'])([^"']+)\1\s*><\/include>/g

const isInside = (parent, target) => {
  const relativePath = relative(parent, target)
  return relativePath !== '' && !relativePath.startsWith('..') && !isAbsolute(relativePath)
}

const renderIncludes = (html, baseDirectory = root) => html.replace(
  includePattern,
  (_tag, _quote, filename) => {
    const includePath = resolve(baseDirectory, filename)

    if (!isInside(root, includePath) || !includePath.endsWith('.html')) {
      throw new Error(`Invalid HTML include path: ${filename}`)
    }

    return renderIncludes(readFileSync(includePath, 'utf8'), dirname(includePath))
  }
)

const htmlIncludes = () => ({
  name: 'catlovers-html-includes',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) => renderIncludes(html)
  },
  handleHotUpdate: ({ file, server }) => {
    if (isInside(includesRoot, file) && file.endsWith('.html')) {
      server.ws.send({ type: 'full-reload', path: '*' })
    }
  }
})

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
    htmlIncludes()
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
