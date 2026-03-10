import { nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const scrollStore = new Map()

/**
 * 列表页滚动位置与搜索词持久化
 * 用全局 Map 存储，不依赖 keep-alive 保留的组件状态
 * @param {string} stateKey - 存储键名（如 'galleryState'、'videosState'）
 * @returns {{ searchQuery: Ref<string>, scrollContainerRef: Ref, onScrollReady: () => void }}
 */
export function useListScrollRestore(stateKey) {
  const searchQuery = ref('')
  const scrollContainerRef = ref(null)
  const savedScrollTop = ref(0)
  const scrollRestored = ref(false)

  function saveScroll() {
    try {
      const el = scrollContainerRef.value
      const top = el ? el.scrollTop : (scrollStore.get(stateKey)?.scrollTop ?? 0)
      scrollStore.set(stateKey, { scrollTop: top, searchQuery: searchQuery.value })
      sessionStorage.setItem(
        stateKey,
        JSON.stringify({ scrollTop: top, searchQuery: searchQuery.value })
      )
    } catch {
      // ignore
    }
  }

  function loadScroll() {
    const cached = scrollStore.get(stateKey)
    if (cached) {
      searchQuery.value = cached.searchQuery || ''
      if (cached.scrollTop > 0) savedScrollTop.value = cached.scrollTop
      return cached.scrollTop
    }
    try {
      const raw = sessionStorage.getItem(stateKey)
      if (raw) {
        const { scrollTop = 0, searchQuery: q = '' } = JSON.parse(raw)
        searchQuery.value = q
        if (scrollTop > 0) savedScrollTop.value = scrollTop
        return scrollTop
      }
    } catch {
      // ignore
    }
    return 0
  }

  function onScrollReady() {
    if (scrollContainerRef.value) {
      const top = scrollContainerRef.value.scrollTop
      scrollStore.set(stateKey, { scrollTop: top, searchQuery: searchQuery.value })
    }
    if (!scrollRestored.value && savedScrollTop.value > 0 && scrollContainerRef.value) {
      scrollRestored.value = true
      const top = savedScrollTop.value
      savedScrollTop.value = 0
      nextTick(() => {
        if (scrollContainerRef.value) {
          scrollContainerRef.value.scrollTop = top
        }
      })
    }
  }

  onMounted(() => {
    loadScroll()
  })

  onActivated(() => {
    scrollRestored.value = false
    const top = loadScroll()
    if (top <= 0) return
    const tryRestore = () => nextTick(() => onScrollReady())
    requestAnimationFrame(() => {
      requestAnimationFrame(tryRestore)
      setTimeout(tryRestore, 50)
    })
  })

  onBeforeRouteLeave(saveScroll)
  onDeactivated(saveScroll)
  onBeforeUnmount(saveScroll)

  return {
    searchQuery,
    scrollContainerRef,
    savedScrollTop,
    scrollRestored,
    onScrollReady,
  }
}
