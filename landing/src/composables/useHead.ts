import { watchEffect, onUnmounted, type MaybeRefOrGetter, toValue } from 'vue'

interface HeadOptions {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  ogTitle?: MaybeRefOrGetter<string>
  ogDescription?: MaybeRefOrGetter<string>
  ogUrl?: MaybeRefOrGetter<string>
  ogImage?: MaybeRefOrGetter<string>
  ogType?: MaybeRefOrGetter<string>
}

const defaults = {
  title: 'FoodProcessor — Turn Cooking Videos Into Recipes & Shopping Lists',
  description: 'Paste any YouTube cooking video and let AI extract a complete recipe card, ingredient list, and shopping list in seconds.',
  ogImage: 'https://foodprocessor.app/og-image.webp',
}

function setMeta(name: string, content: string, attribute = 'name') {
  let el = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attribute, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function useHead(options: HeadOptions) {
  watchEffect(() => {
    const title = toValue(options.title)
    const description = toValue(options.description)
    const ogTitle = toValue(options.ogTitle) || title
    const ogDescription = toValue(options.ogDescription) || description
    const ogUrl = toValue(options.ogUrl) || window.location.href
    const ogImage = toValue(options.ogImage) || defaults.ogImage
    const ogType = toValue(options.ogType) || 'website'

    document.title = title
    setMeta('description', description)
    setMeta('og:title', ogTitle, 'property')
    setMeta('og:description', ogDescription, 'property')
    setMeta('og:url', ogUrl, 'property')
    setMeta('og:image', ogImage, 'property')
    setMeta('og:type', ogType, 'property')
    setMeta('twitter:title', ogTitle, 'name')
    setMeta('twitter:description', ogDescription, 'name')
    setMeta('twitter:image', ogImage, 'name')
  })

  onUnmounted(() => {
    document.title = defaults.title
    setMeta('description', defaults.description)
    setMeta('og:title', defaults.title, 'property')
    setMeta('og:description', defaults.description, 'property')
    setMeta('og:url', 'https://foodprocessor.app/', 'property')
    setMeta('og:image', defaults.ogImage, 'property')
    setMeta('og:type', 'website', 'property')
    setMeta('twitter:title', defaults.title, 'name')
    setMeta('twitter:description', defaults.description, 'name')
    setMeta('twitter:image', defaults.ogImage, 'name')
  })
}
