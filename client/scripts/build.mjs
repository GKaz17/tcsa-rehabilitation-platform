import { build, createServer, loadEnv } from 'vite'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { headMarkup, robotsText, seoConfig, sitemapXml } from '../src/lib/seo.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const config = seoConfig({ ...loadEnv('production', root, 'VITE_'),
  ...Object.fromEntries(['VITE_SITE_URL', 'VITE_ALLOW_INDEXING'].filter((key) => process.env[key] !== undefined).map((key) => [key, process.env[key]])) })
await build({ root })
const template = await readFile(resolve(root, 'dist/index.html'), 'utf8')
const server = await createServer({ root, mode: 'production', server: { middlewareMode: true, hmr: false } })
try {
  const { default: PublicDocument } = await server.ssrLoadModule('/src/entry-public.jsx')
  const content = renderToString(createElement(PublicDocument))
  await writeFile(resolve(root, 'dist/index.html'), template.replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${content}</div>`))
} finally { await server.close() }

const privateTemplate = template.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, `<!-- seo:start -->\n    ${headMarkup('/staff/login', config)}\n    <!-- seo:end -->`)
const errorTemplate = template.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, `<!-- seo:start -->\n    ${headMarkup('/not-found', config)}\n    <!-- seo:end -->`)
await writeFile(resolve(root, 'dist/staff.html'), privateTemplate)
await writeFile(resolve(root, 'dist/404.html'), errorTemplate)
await writeFile(resolve(root, 'dist/robots.txt'), robotsText(config))
const sitemap = sitemapXml(config)
if (sitemap) await writeFile(resolve(root, 'dist/sitemap.xml'), sitemap)
console.log(`Public content pre-rendered. Search indexing ${config.allowIndexing ? 'enabled for the configured domain' : 'disabled for this preview'}.`)
