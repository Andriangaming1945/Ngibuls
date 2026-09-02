import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollReveal(options = {}) {
  const target = ref(null)
  const isVisible = ref(false)
  let observer

  onMounted(() => {
    if (!target.value) return
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer.disconnect()
        }
      },
      { threshold: 0.2, ...options }
    )
    observer.observe(target.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { target, isVisible }
}