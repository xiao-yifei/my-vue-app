<script setup>
defineOptions({ name: 'Gallery' })
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getThemes } from '@/api'
import { useListScrollRestore } from '@/composables/useListScrollRestore.js'

const GALLERY_RATIO_WHITELIST = ['wide', 'tall', 'square']

const route = useRoute()
const router = useRouter()
const noPermissionHint = ref(false)
const list = ref([])
const loading = ref(true)
const error = ref('')

const {
  searchQuery,
  scrollContainerRef,
  savedScrollTop,
  onScrollReady,
} = useListScrollRestore('galleryState')

async function loadList() {
  loading.value = true
  error.value = ''
  try {
    const data = await getThemes()
    list.value = Array.isArray(data) ? data : []
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '加载图库失败'
    error.value = msg
    ElMessage.error(msg)
    list.value = []
  } finally {
    loading.value = false
  }
}

loadList()

const filteredList = computed(() => {
  const items = list.value
  const q = (searchQuery.value || '').trim().toLowerCase()
  if (!q) return items
  return items.filter((t) => t.label && t.label.toLowerCase().includes(q))
})

function galleryItemClass(item) {
  const classes = []
  if (item.large) classes.push('gallery-item--large')
  const ratio = item.ratio && GALLERY_RATIO_WHITELIST.includes(item.ratio) ? item.ratio : null
  if (ratio) classes.push(`gallery-item--${ratio}`)
  return classes
}

function goToDetail(item) {
  router.push(`/theme/${item.id}`)
}

watch(loading, (v) => {
  if (!v && savedScrollTop.value > 0) nextTick(onScrollReady)
})

onMounted(() => {
  if (route.query.message === 'noPermission') {
    noPermissionHint.value = true
    router.replace({ path: '/themes', query: {} })
    setTimeout(() => { noPermissionHint.value = false }, 4000)
  }
})
</script>

<template>
  <div class="gallery-page">
    <div class="gallery-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <p v-if="noPermissionHint" class="permission-hint">无权限访问该页面，仅管理员可管理图库配置。</p>
    <main ref="scrollContainerRef" class="gallery-main" @scroll="onScrollReady">
      <div class="gallery-scroll">
        <p v-if="loading" class="gallery-loading">加载中…</p>
        <div v-else-if="error" class="gallery-error-wrap">
          <p class="gallery-error">{{ error }}</p>
        </div>
        <div v-else class="gallery-container">
          <header class="gallery-header">
            <div class="gallery-header-text">
              <h1 class="gallery-title">图库</h1>
              <p class="gallery-desc">浏览图库主题</p>
            </div>
            <div class="gallery-search">
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="搜索图库标题"
                aria-label="搜索图库"
              />
            </div>
          </header>

          <div v-if="filteredList.length" class="gallery gallery--masonry">
            <article
              v-for="item in filteredList"
              :key="item.id"
              class="gallery-item"
              :class="galleryItemClass(item)"
              @click="goToDetail(item)"
            >
              <img
                v-if="item.src"
                :src="item.src"
                :alt="item.alt || item.label"
                loading="lazy"
                decoding="async"
                class="gallery-img"
              />
              <div v-else class="gallery-img gallery-img-placeholder">无图</div>
              <span class="gallery-label">{{ item.label || '未命名' }}</span>
            </article>
          </div>
          <p v-else class="gallery-empty">暂无图库</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.gallery-page {
  --accent: #0d9488;
  --card-bg: rgba(255, 255, 255, 0.08);
  --card-border: rgba(255, 255, 255, 0.12);
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  font-family: 'Outfit', system-ui, sans-serif;
}

.gallery-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
  will-change: transform;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: var(--accent);
  top: -120px;
  right: -80px;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: #6366f1;
  bottom: -60px;
  left: -60px;
}

.permission-hint {
  position: relative;
  z-index: 5;
  margin: 0;
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
  border-bottom: 1px solid rgba(251, 191, 36, 0.3);
}

.gallery-main {
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
}

.gallery-scroll {
  padding: 1.5rem 2rem;
}

@media (min-width: 768px) {
  .gallery-scroll {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
  }
}

@media (min-width: 1200px) {
  .gallery-scroll {
    padding-left: 3rem;
    padding-right: 3rem;
  }
}

.gallery-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.gallery-header-text {
  flex: 1;
  min-width: 0;
}

.gallery-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}

.gallery-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

.gallery-search {
  flex-shrink: 0;
  width: 100%;
  max-width: 280px;
}

.search-input {
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--text);
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  border-color: var(--accent);
}

/* 瀑布流：多列布局 + 首图横跨全列 */
.gallery.gallery--masonry {
  column-count: 2;
  column-gap: 1rem;
  width: 100%;
  contain: layout;
}

@media (min-width: 768px) {
  .gallery.gallery--masonry {
    column-count: 3;
    column-gap: 1rem;
  }
}

@media (min-width: 1200px) {
  .gallery.gallery--masonry {
    column-count: 4;
    column-gap: 1.25rem;
  }
}

.gallery-item {
  position: relative;
  display: block;
  text-decoration: none;
  color: inherit;
  border-radius: 14px;
  overflow: hidden;
  break-inside: avoid;
  margin-bottom: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease;
  will-change: transform;
  transform: translateZ(0);
}

.gallery-item:hover {
  transform: translateZ(0) scale(1.02);
}

.gallery-item--large {
  column-span: all;
  aspect-ratio: 21/9;
  margin-bottom: 1rem;
}

.gallery-item--wide {
  aspect-ratio: 4/3;
}

.gallery-item--tall {
  aspect-ratio: 3/4;
}

.gallery-item--square {
  aspect-ratio: 1/1;
}

.gallery-item:not(.gallery-item--large):not([class*='gallery-item--']) {
  aspect-ratio: 4/3;
}

.gallery-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  cursor: pointer;
  transition: transform 0.3s ease;
  will-change: transform;
  transform: translateZ(0);
}

.gallery-img-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  font-size: 0.875rem;
}

.gallery-item:hover .gallery-img:not(.gallery-img-placeholder) {
  transform: translateZ(0) scale(1.06);
}

.gallery-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.6rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  will-change: opacity, transform;
}

.gallery-item:hover .gallery-label {
  opacity: 1;
  transform: translateY(0);
}

.gallery-loading {
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
}

.gallery-error-wrap {
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
}

.gallery-error {
  color: #f87171;
  margin: 0;
}

.gallery-empty {
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
  margin: 0;
}
</style>
