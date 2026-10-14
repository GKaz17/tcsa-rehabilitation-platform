import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { headMarkup, seoConfig } from '../lib/seo'

const config = seoConfig(import.meta.env)

export default function SeoMetadata() {
  const { pathname } = useLocation()
  useEffect(() => {
    const template = document.createElement('template')
    template.innerHTML = headMarkup(pathname, config)
    document.head.querySelectorAll('title, meta[name="description"], meta[name="robots"], meta[name="theme-color"], link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"], #tcsa-organization')
      .forEach((node) => node.remove())
    document.head.append(template.content)
  }, [pathname])
  return null
}
