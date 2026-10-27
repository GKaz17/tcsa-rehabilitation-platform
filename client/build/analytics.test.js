import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runInNewContext } from 'node:vm'
import { analyticsMarkup } from './analytics.js'

const origin = 'https://tcsa.example'
const config = { siteUrl: `${origin}/`, allowIndexing: true }
const settings = { VITE_GA4_ID: 'G-Z0XK8ERT14' }

function visit(pathname, siteOrigin = origin, referrer = '') {
  const tags = []
  const window = { location: { pathname, origin: siteOrigin } }
  const document = { referrer, createElement: () => ({}), head: { appendChild: (tag) => tags.push(tag) } }
  const markup = analyticsMarkup(settings, config)
  runInNewContext(markup.replace(/^<script[^>]*>\n/, '').replace(/\n<\/script>$/, ''), { window, document, URL })
  return { tags, commands: (window.dataLayer || []).map((command) => Array.from(command)) }
}

test('public tracking is absent from previews and refuses an invalid Measurement ID', () => {
  assert.equal(analyticsMarkup({}, config), '')
  assert.equal(analyticsMarkup(settings, { ...config, allowIndexing: false }), '')
  assert.equal(analyticsMarkup(settings, { ...config, siteUrl: '' }), '')
  assert.throws(() => analyticsMarkup({ VITE_GA4_ID: 'G-INVALID</script>' }, config), /Measurement ID/)
})

test('only the configured public origin and root page may load Google Analytics', () => {
  const publicVisit = visit('/')
  assert.equal(publicVisit.tags.length, 1)
  assert.equal(publicVisit.tags[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-Z0XK8ERT14')
  assert.equal(publicVisit.tags[0].async, true)
  assert.equal(publicVisit.commands.filter(([command]) => command === 'config').length, 1)
  for (const path of ['/staff/login', '/staff/password', '/dashboard/animals/private-id', '/not-found']) {
    assert.equal(visit(path).tags.length, 0)
    assert.equal(visit(path).commands.length, 0)
  }
  assert.equal(visit('/', 'http://localhost:5173').tags.length, 0)
  assert.equal(visit('/', 'https://another-deployment.example').tags.length, 0)
})

test('tracking does not forward private referrer paths, URL queries or advertising signals', () => {
  const privateReturn = visit('/', origin, `${origin}/dashboard/animals/private-id?email=private@example.com`)
  const options = privateReturn.commands.find(([command]) => command === 'config')[2]
  assert.equal(options.page_referrer, '')
  assert.equal(options.page_location, `${origin}/`)
  assert.equal(options.allow_google_signals, false)
  assert.equal(options.allow_ad_personalization_signals, false)
  const external = visit('/', origin, 'https://www.google.com/search?q=tortoise&private=value')
  assert.equal(external.commands.find(([command]) => command === 'config')[2].page_referrer, 'https://www.google.com/')
  assert.doesNotMatch(JSON.stringify(privateReturn.commands), /private-id|private@example|user_id/)
})
