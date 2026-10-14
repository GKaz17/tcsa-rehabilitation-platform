import assert from 'node:assert/strict'
import { test } from 'node:test'
import { headMarkup, organizationData, robotsText, routeMetadata, seoConfig, sitemapXml } from './seo.js'

test('an unset domain keeps previews out of search and never invents public URLs', () => {
  const config = seoConfig()
  assert.equal(routeMetadata('/', config).robots, 'noindex, nofollow')
  assert.equal(routeMetadata('/', config).canonical, '')
  assert.equal(sitemapXml(config), null)
  assert.match(robotsText(config), /Disallow: \/\n/)
  assert.doesNotMatch(headMarkup('/', config), /rel="canonical"|property="og:url"|property="og:image"/)
  assert.equal(organizationData(config).url, undefined)
  assert.throws(() => seoConfig({ VITE_ALLOW_INDEXING: 'true' }), /Choose VITE_SITE_URL/)
})

test('the production sitemap lists only the public homepage and private/error pages stay noindex', () => {
  const config = seoConfig({ VITE_SITE_URL: 'https://tcsa.example', VITE_ALLOW_INDEXING: 'true' })
  assert.equal(routeMetadata('/', config).canonical, 'https://tcsa.example/')
  assert.match(routeMetadata('/', config).robots, /^index, follow/)
  assert.equal((sitemapXml(config).match(/<loc>/g) || []).length, 1)
  assert.doesNotMatch(sitemapXml(config), /staff|dashboard|#|about|support/)
  assert.match(headMarkup('/', config), /https:\/\/tcsa.example\/images\/pond-hero.jpg/)
  assert.doesNotMatch(robotsText(config), /Disallow: \/staff|Disallow: \/dashboard/)
  for (const path of ['/staff/login', '/login', '/dashboard', '/dashboard/animals/123', '/missing']) {
    assert.equal(routeMetadata(path, config).robots, 'noindex, nofollow')
    assert.equal(routeMetadata(path, config).canonical, '')
    assert.doesNotMatch(headMarkup(path, config), /rel="canonical"|og:|twitter:|application\/ld\+json/)
  }
})

test('invalid origins cannot silently become canonical or indexing destinations', () => {
  for (const url of ['http://tcsa.example', 'https://tcsa.example/about', 'https://tcsa.example?track=1', 'https://name:password@tcsa.example', 'https://localhost', 'https://127.0.0.1', 'https://tcsa.example/#about']) {
    assert.throws(() => seoConfig({ VITE_SITE_URL: url }))
  }
})
