import { useEffect, useRef } from 'react'

// FadeContent-inspired, once-only reveals using native browser APIs.
// Content stays visible without animation support or JavaScript enhancement.
export default function useReveal() {
  const root = useRef(null)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches || !window.IntersectionObserver || !root.current?.animate) return

    const animations = new Set()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        observer.unobserve(entry.target)
        // A focused destination remains immediately visible during navigation.
        if (media.matches || entry.target.contains(document.activeElement)) continue
        const animation = entry.target.animate(
          [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        )
        animations.add(animation)
        animation.onfinish = () => animations.delete(animation)
      }
    }, { threshold: 0.08 })

    root.current.querySelectorAll('.landing-heading, .card, .conservation-mission, .reptile-gallery, .partner-column, .landing-contact')
      .forEach((element) => observer.observe(element))
    function stopMotion() {
      if (!media.matches) return
      observer.disconnect()
      animations.forEach((animation) => animation.cancel())
      animations.clear()
    }
    media.addEventListener('change', stopMotion)
    return () => {
      observer.disconnect()
      animations.forEach((animation) => animation.cancel())
      media.removeEventListener('change', stopMotion)
    }
  }, [])
  return root
}
