import { cp, mkdir, readdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// A fresh directory prevents leftover files from an earlier release being shipped.
const releaseName = process.env.TCSA_RELEASE_NAME || 'azure'
if (!/^azure(?:-[a-z0-9-]{1,40})?$/.test(releaseName)) throw new Error('Choose an azure-prefixed release folder name.')
const output = resolve(root, 'dist', releaseName)
await mkdir(output, { recursive: true })
if ((await readdir(output)).length) throw new Error('The output folder already contains a release. Choose a fresh TCSA_RELEASE_NAME to preserve it.')
const html = await readFile(resolve(root, 'client/dist/index.html'), 'utf8')
if (!html.includes('data-prerendered="true"')) throw new Error('Build the React client before packaging.')
await cp(resolve(root, 'client/dist'), resolve(output, 'public'), { recursive: true })
// Explicit source allowlist: never copy local config, sessions, CLI tools or tests.
const files = ['bootstrap.php', 'health.php', 'auth/session.php', 'auth/login.php',
  'auth/logout.php', 'auth/me.php', 'auth/password.php', 'workspace.php', 'animals.php',
  'tasks.php', 'history.php', 'reports.php', 'lib/care.php', 'lib/settings.php', 'lib/http.php', 'lib/auth.php']
for (const file of files) {
  const target = resolve(output, 'api', file)
  await mkdir(dirname(target), { recursive: true })
  await cp(resolve(root, 'api', file), target)
}
await mkdir(resolve(output, 'deployment'))
for (const file of ['azure-nginx.conf', 'azure-startup.sh']) {
  await cp(resolve(root, 'deployment', file), resolve(output, 'deployment', file))
}
await cp(resolve(root, 'deployment/fallback-index.php'), resolve(output, 'index.php'))
console.log(`Azure package ready in dist/${releaseName}. No local configuration or session files included.`)
