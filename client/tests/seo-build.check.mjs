import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { seoConfig } from '../src/lib/seo.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const config = seoConfig({ ...loadEnv('production', root, 'VITE_'),
  ...Object.fromEntries(['VITE_SITE_URL', 'VITE_ALLOW_INDEXING'].filter((key) => process.env[key] !== undefined).map((key) => [key, process.env[key]])) })
const html = await readFile(resolve(root, 'dist/index.html'), 'utf8')

test('the actual build contains the public journey and its images without running JavaScript', async () => {
  assert.match(html, /data-prerendered="true"/)
  assert.match(html, /<h1[^>]*>Protect today,/)
  for (const text of ['About us', 'Support us', 'Rescue Roast', 'Tortoise food', 'Proudly endorsed by', 'Contact Dirk Barnard']) assert.ok(html.includes(text), text)
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1)
  assert.doesNotMatch(html, /type="password"|Overdue tasks|Add new animal/)
  for (const [, source] of html.matchAll(/<img[^>]+src="(\/images\/[^"?#]+)"/g)) await access(resolve(root, `public${source}`))
  const structured = JSON.parse(html.match(/<script id="tcsa-organization" type="application\/ld\+json">([^<]+)<\/script>/)[1])
  assert.equal(structured.name, 'Tortoise Conservation South Africa')
  assert.equal(structured.email, 'info.tortoiseconservation@gmail.com')
  assert.equal(structured.sameAs, undefined)
})

test('staff and error HTML have initial noindex metadata and no public-page content', async () => {
  for (const filename of ['staff.html', '404.html']) {
    const document = await readFile(resolve(root, 'dist', filename), 'utf8')
    assert.match(document, /name="robots" content="noindex, nofollow"/)
    assert.doesNotMatch(document, /data-prerendered|conservation-hero|tcsa-organization|rel="canonical"|property="og:/)
    assert.match(document, /<div id="root"><\/div>/)
  }
})

test('the built crawl files follow the production switch and contain no staff URLs', async () => {
  const robots = await readFile(resolve(root, 'dist/robots.txt'), 'utf8')
  if (config.allowIndexing) {
    assert.match(html, /name="robots" content="index, follow, max-image-preview:large"/)
    assert.ok(html.includes(`rel="canonical" href="${config.siteUrl}"`))
    const sitemap = await readFile(resolve(root, 'dist/sitemap.xml'), 'utf8')
    assert.ok(sitemap.includes(`<loc>${config.siteUrl}</loc>`))
    assert.equal((sitemap.match(/<loc>/g) || []).length, 1)
    assert.doesNotMatch(sitemap, /staff|dashboard|#|<lastmod>/)
    assert.ok(robots.includes(`Sitemap: ${config.siteUrl}sitemap.xml`))
  } else {
    assert.match(html, /name="robots" content="noindex, nofollow"/)
    assert.match(robots, /Disallow: \/\n/)
    await assert.rejects(access(resolve(root, 'dist/sitemap.xml')))
  }
})
