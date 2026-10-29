import assert from 'node:assert/strict'
import { X509Certificate } from 'node:crypto'
import { test } from 'node:test'
import { readdir, readFile, lstat } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const name = process.env.TCSA_AWS_RELEASE_NAME || 'aws'
assert.match(name, /^aws(?:-[a-z0-9-]{1,40})?$/)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../dist', name)
async function inventory(directory, prefix = '') {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    assert.equal((await lstat(path)).isSymbolicLink(), false)
    if (entry.isDirectory()) result.push(...await inventory(path, `${prefix}${entry.name}/`))
    else result.push(`${prefix}${entry.name}`)
  }
  return result.sort()
}
test('AWS context includes only the approved runtime and a noindex public build', async () => {
  const files = await inventory(root)
  const expected = ['.dockerignore', 'Dockerfile', 'aws/nginx.conf', 'aws/php.ini', 'aws/php-fpm.conf', 'aws/supervisord.conf', 'aws/rds-ca.pem', 'api/bootstrap.php', 'api/health.php', 'api/auth/session.php', 'api/auth/login.php', 'api/auth/logout.php', 'api/auth/me.php', 'api/auth/password.php', 'api/workspace.php', 'api/animals.php', 'api/tasks.php', 'api/history.php', 'api/reports.php', 'api/lib/care.php', 'api/lib/settings.php', 'api/lib/http.php', 'api/lib/auth.php']
  assert.deepEqual(files.filter(path => !path.startsWith('public/')), expected.sort())
  for (const path of files.filter(path => path !== '.dockerignore')) assert.doesNotMatch(path, /(^|\/)(?:\.[^/]+|node_modules|storage|bin|tests|src)(\/|$)|\.(?:md|map|sql|ps1)$/i)
  const html = await readFile(resolve(root, 'public/index.html'), 'utf8')
  assert.match(html, /data-prerendered="true"/)
  assert.match(html, /name="robots" content="noindex, nofollow"/)
  assert.doesNotMatch(html, /tcsa-public-analytics|googletagmanager\.com/)
  assert.match(await readFile(resolve(root, 'public/robots.txt'), 'utf8'), /Disallow: \/\n/)
  assert.equal(files.includes('public/sitemap.xml'), false)
})

test('AWS package has valid Stockholm RDS roots for verified database TLS', async () => {
  const pem = await readFile(resolve(root, 'aws/rds-ca.pem'), 'utf8')
  const certificates = pem.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g) || []
  assert.equal(certificates.length, 3)
  const subjects = []
  for (const certificate of certificates) {
    const parsed = new X509Certificate(certificate)
    assert.equal(parsed.ca, true)
    assert.equal(parsed.verify(parsed.publicKey), true)
    assert.match(parsed.subject, /CN=Amazon RDS eu-north-1 Root CA/)
    assert.ok(Date.parse(parsed.validFrom) < Date.now())
    assert.ok(Date.parse(parsed.validTo) > Date.now() + 90 * 86400000)
    subjects.push(parsed.subject)
  }
  assert.ok(subjects.some(subject => subject.includes('RSA2048 G1')))
})
