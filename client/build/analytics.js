import { publicTitle } from '../src/lib/seo.js'

// Add tracking only to the production public document, never the staff template.
export function analyticsMarkup(settings, config) {
  const id = (settings.VITE_GA4_ID || '').trim()
  if (id && !/^G-[A-Z0-9]{6,20}$/.test(id)) throw new Error('VITE_GA4_ID must be a GA4 Measurement ID beginning with G-.')
  if (!id || !config.allowIndexing || !config.siteUrl) return ''
  const origin = new URL(config.siteUrl).origin
  const options = {
    page_location: config.siteUrl,
    page_title: publicTitle,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  }
  return `<script id="tcsa-public-analytics">
(function () {
  if (window.location.pathname !== '/' || window.location.origin !== ${JSON.stringify(origin)}) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  var options = ${JSON.stringify(options)};
  options.page_referrer = '';
  try {
    var referrer = new URL(document.referrer);
    // Preserve referring domains without exposing private record paths or queries.
    if (referrer.origin !== window.location.origin || referrer.pathname === '/') options.page_referrer = referrer.origin + '/';
  } catch (_) { /* A direct visit has no referrer. */ }
  window.gtag('js', new Date());
  window.gtag('config', ${JSON.stringify(id)}, options);
  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + ${JSON.stringify(id)};
  document.head.appendChild(tag);
})();
</script>`
}
