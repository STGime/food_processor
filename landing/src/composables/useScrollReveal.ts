import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollReveal(threshold = 0.15) {
  const elementRef = ref<HTMLElement | null>(null)
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!elementRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          isVisible.value = true
          observer?.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(elementRef.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { elementRef, isVisible }
}
