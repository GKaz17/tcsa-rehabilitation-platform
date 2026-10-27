import { cp, mkdir, readdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const project = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const name = process.env.TCSA_AWS_RELEASE_NAME || 'aws'
if (!/^aws(?:-[a-z0-9-]{1,40})?$/.test(name)) throw new Error('Choose an aws-prefixed release directory.')
const publicRoot = resolve(project, 'client/dist')
const html = await readFile(resolve(publicRoot, 'index.html'), 'utf8')
const robots = await readFile(resolve(publicRoot, 'robots.txt'), 'utf8')
if (!html.includes('data-prerendered="true"') || !html.includes('content="noindex, nofollow"') || !robots.includes('Disallow: /') || /tcsa-public-analytics|googletagmanager\.com/.test(html)) throw new Error('Build the AWS copy with indexing and analytics disabled.')
const output = resolve(project, 'dist', name)
await mkdir(output, { recursive: true })
if ((await readdir(output)).length) throw new Error('Preserve the earlier package and choose a fresh TCSA_AWS_RELEASE_NAME.')
await cp(publicRoot, resolve(output, 'public'), { recursive: true })
const runtime = ['bootstrap.php', 'health.php', 'auth/session.php', 'auth/login.php', 'auth/logout.php', 'auth/me.php', 'auth/password.php', 'workspace.php', 'animals.php', 'tasks.php', 'history.php', 'reports.php', 'lib/care.php', 'lib/settings.php', 'lib/http.php', 'lib/auth.php']
for (const file of runtime) {
  const target = resolve(output, 'api', file)
  await mkdir(dirname(target), { recursive: true })
  await cp(resolve(project, 'api', file), target)
}
for (const file of ['Dockerfile', '.dockerignore']) await cp(resolve(project, 'deployment/aws', file), resolve(output, file))
await mkdir(resolve(output, 'aws'))
for (const file of ['nginx.conf', 'php.ini', 'php-fpm.conf', 'supervisord.conf', 'rds-ca.pem']) await cp(resolve(project, 'deployment/aws', file), resolve(output, 'aws', file))
console.log(`AWS build context ready in dist/${name}. No local configuration, database files or provisioning tools included.`)
