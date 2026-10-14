import { loadEnv } from 'vite'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { headMarkup, publicAliases, seoConfig } from '../src/lib/seo.js'

export default function seoPlugin() {
  let config
  return {
    name: 'tcsa-seo',
    configResolved(vite) {
      const env = loadEnv(vite.mode, vite.root, 'VITE_')
      for (const key of ['VITE_SITE_URL', 'VITE_ALLOW_INDEXING']) {
        if (process.env[key] !== undefined) env[key] = process.env[key]
      }
      config = seoConfig(env)
    },
    transformIndexHtml(html, context) {
      const pathname = context.server ? new URL(context.originalUrl || '/', 'http://localhost').pathname : '/'
      return html.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, `<!-- seo:start -->\n    ${headMarkup(pathname, config)}\n    <!-- seo:end -->`)
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url, 'http://localhost')
        const path = url.pathname
        if (path === '/index.html') {
          response.writeHead(301, { Location: '/' })
          response.end()
          return
        }
        if (publicAliases[path]) {
          response.writeHead(301, { Location: `/${url.search}#${publicAliases[path]}` })
          response.end()
          return
        }
        if (/^\/(?:staff|dashboard)(?:\/|$)/.test(path) || ['/login', '/staff.html'].includes(path)) {
          response.setHeader('X-Robots-Tag', 'noindex, nofollow')
          response.setHeader('Cache-Control', 'no-store')
          request.url = '/staff.html'
        } else if (path !== '/' && ((!/^\/(?:assets|fonts|images)\//.test(path) && !['/index.html', '/favicon.svg', '/icons.svg', '/robots.txt', '/sitemap.xml'].includes(path)) ||
          !existsSync(resolve(server.config.root, server.config.build.outDir, `.${decodeURIComponent(path)}`)))) {
          response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' })
          response.end(readFileSync(resolve(server.config.root, server.config.build.outDir, '404.html')))
          return
        }
        next()
      })
    },
  }
}
