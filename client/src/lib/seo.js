export const siteName = 'Tortoise Conservation South Africa'
export const publicTitle = `TCSA | ${siteName}`
export const publicDescription = 'Support tortoise conservation and reptile rehabilitation in South Africa. Learn about TCSA, donations, Rescue Roast and how to contact Dirk Barnard.'
export const publicAliases = { '/about': 'about-us', '/support': 'support-us', '/contact': 'contact-dirk', '/education': 'education' }

export function seoConfig(settings = {}) {
  const raw = (settings.VITE_SITE_URL || '').trim()
  let siteUrl = ''
  if (raw) {
    const url = new URL(raw)
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
      url.pathname !== '/' || url.port || url.hostname === 'localhost' || url.hostname.endsWith('.localhost') ||
      /^[\d.]+$/.test(url.hostname) || url.hostname.includes(':')) {
      throw new Error('VITE_SITE_URL must be the public HTTPS origin, without a path, query or credentials.')
    }
    siteUrl = `${url.origin}/`
  }
  const allowIndexing = settings.VITE_ALLOW_INDEXING === 'true'
  if (allowIndexing && !siteUrl) throw new Error('Choose VITE_SITE_URL before enabling production indexing.')
  return { siteUrl, allowIndexing }
}

export function routeMetadata(pathname, config) {
  const isPublic = pathname === '/'
  const isStaff = /^\/(?:staff|dashboard)(?:\/|$)/.test(pathname) || pathname === '/login'
  const title = isPublic ? publicTitle : isStaff ? 'Staff workspace | TCSA' : 'Page not found | TCSA'
  return {
    isPublic, title,
    description: isPublic ? publicDescription : isStaff ? 'Private TCSA staff sign-in and care workspace.' : 'Return to TCSA to find the page you need.',
    robots: isPublic && config.allowIndexing ? 'index, follow, max-image-preview:large' : 'noindex, nofollow',
    canonical: isPublic ? config.siteUrl : '',
  }
}

export function organizationData(config) {
  return {
    '@context': 'https://schema.org', '@type': 'Organization',
    name: siteName, alternateName: 'TCSA', foundingDate: '2024',
    description: 'Tortoise conservation and reptile rehabilitation in South Africa.',
    email: 'info.tortoiseconservation@gmail.com', telephone: '+27713091665',
    areaServed: { '@type': 'Country', name: 'South Africa' },
    ...(config.siteUrl ? { url: config.siteUrl, logo: `${config.siteUrl}images/tcsa-logo.jpg` } : {}),
  }
}

const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]))

export function headMarkup(pathname, config) {
  const page = routeMetadata(pathname, config)
  const tags = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    `<meta name="robots" content="${page.robots}" />`,
    '<meta name="theme-color" content="#123E35" />',
  ]
  if (page.canonical) tags.push(`<link rel="canonical" href="${escapeHtml(page.canonical)}" />`)
  if (page.isPublic) {
    tags.push('<meta property="og:type" content="website" />', '<meta property="og:locale" content="en_ZA" />',
      `<meta property="og:site_name" content="${siteName}" />`,
      `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
      `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
      '<meta name="twitter:card" content="summary_large_image" />',
      `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`)
    if (config.siteUrl) tags.push(`<meta property="og:url" content="${escapeHtml(config.siteUrl)}" />`,
      `<meta property="og:image" content="${escapeHtml(config.siteUrl)}images/pond-hero.jpg" />`,
      '<meta property="og:image:alt" content="A pond surrounded by rocks and indigenous garden plants" />',
      `<meta name="twitter:image" content="${escapeHtml(config.siteUrl)}images/pond-hero.jpg" />`,
      '<meta name="twitter:image:alt" content="A pond surrounded by rocks and indigenous garden plants" />')
    tags.push(`<script id="tcsa-organization" type="application/ld+json">${JSON.stringify(organizationData(config)).replaceAll('<', '\\u003c')}</script>`)
  }
  return tags.join('\n    ')
}

export function robotsText(config) {
  if (!config.allowIndexing) return 'User-agent: *\nDisallow: /\n'
  // Private pages remain crawlable so crawlers can read their noindex response.
  return `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${config.siteUrl}sitemap.xml\n`
}

export function sitemapXml(config) {
  if (!config.allowIndexing) return null
  // The public content journey is one page. Its section anchors are not pages.
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeHtml(config.siteUrl)}</loc></url></urlset>\n`
}
