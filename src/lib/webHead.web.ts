/**
 * Injection des métadonnées <head> spécifiques au web (version SPA,
 * web.output "single" — où app/+html n'est pas pris en compte).
 *
 * Couvre ce qu'app.json ne gère pas : icône d'écran d'accueil iOS
 * (apple-touch-icon), manifest PWA (Android/Chrome) et couleur de thème.
 * Safari et Chrome relisent le DOM vivant au moment du « Ajouter à l'écran
 * d'accueil » : l'injection au runtime suffit donc. Idempotent.
 */

type Meta = { name: string; content: string }

const METAS: Meta[] = [
  { name: 'theme-color', content: '#A855F7' },
  { name: 'apple-mobile-web-app-capable', content: 'yes' },
  { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
  { name: 'apple-mobile-web-app-title', content: 'Ippo' },
  { name: 'mobile-web-app-capable', content: 'yes' },
]

const upsertMeta = ({ name, content }: Meta) => {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

const upsertLink = (rel: string, href: string, attrs: Record<string, string> = {}) => {
  const selectorParts = [`link[rel="${rel}"]`, ...Object.entries(attrs).map(([k, v]) => `[${k}="${v}"]`)]
  let el = document.querySelector<HTMLLinkElement>(selectorParts.join(''))
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function installWebHead(): void {
  if (typeof document === 'undefined') return
  for (const m of METAS) upsertMeta(m)
  upsertLink('apple-touch-icon', '/apple-touch-icon.png')
  upsertLink('manifest', '/manifest.json')
  upsertLink('icon', '/icon-192.png', { type: 'image/png', sizes: '192x192' })
  upsertLink('icon', '/icon-512.png', { type: 'image/png', sizes: '512x512' })
}
