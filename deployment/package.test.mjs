import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readdir, readFile, lstat } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const releaseName = process.env.TCSA_RELEASE_NAME || 'azure'
assert.match(releaseName, /^azure(?:-[a-z0-9-]{1,40})?$/)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist', releaseName)
async function inventory(directory, prefix = '') {
  const paths = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name
    assert.equal((await lstat(resolve(directory, entry.name))).isSymbolicLink(), false)
    if (entry.isDirectory()) paths.push(...await inventory(resolve(directory, entry.name), relative + '/'))
    else paths.push(relative)
  }
  return paths.sort()
}

test('release includes compiled public content and only the approved runtime files', async () => {
  const files = await inventory(root)
  const runtime = ['api/auth/login.php', 'api/auth/logout.php', 'api/auth/me.php', 'api/auth/session.php', 'api/auth/password.php',
    'api/bootstrap.php', 'api/health.php', 'api/lib/auth.php', 'api/lib/http.php', 'api/lib/settings.php', 'api/lib/care.php',
    'api/workspace.php', 'api/animals.php', 'api/tasks.php', 'api/history.php', 'api/reports.php',
    'deployment/azure-nginx.conf', 'deployment/azure-startup.sh', 'index.php']
  assert.deepEqual(files.filter((path) => !path.startsWith('public/')), runtime.sort())
  for (const path of files) assert.doesNotMatch(path, /(^|\/)(?:\.[^/]+|AGENTS\.md|node_modules|storage|bin|tests|src)(\/|$)|\.(?:map|sql|ps1)$/i)
  const html = await readFile(resolve(root, 'public/index.html'), 'utf8')
  assert.match(html, /data-prerendered="true"/)
  assert.match(await readFile(resolve(root, 'public/staff.html'), 'utf8'), /noindex, nofollow/)
  assert.match(await readFile(resolve(root, 'index.php'), 'utf8'), /http_response_code\(503\)/)
})
