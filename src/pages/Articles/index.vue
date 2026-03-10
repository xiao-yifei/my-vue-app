<script setup>
defineOptions({ name: 'Articles' })
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getArticles, getTags, addHistory } from '@/api'
import { getToken } from '@/utils/auth.js'
import { useListScrollRestore } from '@/composables/useListScrollRestore.js'

const route = useRoute()
const router = useRouter()
const list = ref([])
const tagsList = ref([])
const loading = ref(true)
const error = ref('')
const selectedTag = ref('')

const {
  searchQuery,
  scrollContainerRef,
  savedScrollTop,
  onScrollReady,
} = useListScrollRestore('articlesState')

async function loadList() {
  loading.value = true
  error.value = ''
  try {
    const data = await getArticles()
    list.value = Array.isArray(data) ? data : []
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '加载文章列表失败'
    error.value = msg
    ElMessage.error(msg)
    list.value = []
  } finally {
    loading.value = false
  }
}

loadList()

async function loadTags() {
  try {
    const data = await getTags()
    tagsList.value = Array.isArray(data) ? data : []
  } catch {
    tagsList.value = []
  }
}
loadTags()

const filteredList = computed(() => {
  let items = list.value
  const tag = (selectedTag.value || '').trim()
  if (tag) {
    items = items.filter(
      (a) => Array.isArray(a.tags) && a.tags.some((t) => String(t).trim() === tag)
    )
  }
  const q = (searchQuery.value || '').trim().toLowerCase()
  if (!q) return items
  return items.filter(
    (a) =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.excerpt && a.excerpt.toLowerCase().includes(q))
  )
})

function selectTag(tag) {
  const v = (tag || '').trim()
  selectedTag.value = selectedTag.value === v ? '' : v
  router.replace({
    path: '/articles',
    query: selectedTag.value ? { tag: selectedTag.value } : {},
  })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function goToDetail(item) {
  if (getToken() && item?.id != null) {
    addHistory('article', String(item.id), { title: item.title, cover: item.cover }).catch((err) => {
      console.warn('[history] 记录文章历史失败:', err?.response?.data?.message || err?.message)
    })
  }
  router.push(`/article/${item.id}`)
}

watch(loading, (v) => {
  if (!v && savedScrollTop.value > 0) nextTick(onScrollReady)
})

onMounted(() => {
  selectedTag.value = (route.query.tag || '').trim()
  if (route.query.message === 'noPermission') {
    router.replace({ path: '/articles', query: {} })
  }
})

watch(
  () => route.query.tag,
  (v) => {
    selectedTag.value = (v || '').trim()
  }
)
</script>

<template>
  <div class="articles-page">
    <div class="articles-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <main ref="scrollContainerRef" class="articles-main" @scroll="onScrollReady">
      <div class="articles-scroll">
        <p v-if="loading" class="article-loading">加载中…</p>
        <div v-else-if="error" class="article-error-wrap">
          <p class="article-error">{{ error }}</p>
        </div>
        <div v-else class="article-container">
          <header class="article-header">
            <div class="article-header-text">
              <h1 class="article-title">文章</h1>
              <p class="article-desc">浏览所有文章</p>
            </div>
            <div class="article-search">
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="搜索文章标题或摘要"
                aria-label="搜索文章"
              />
            </div>
          </header>
          <div v-if="tagsList.length" class="article-tags">
            <button
              type="button"
              class="article-tag"
              :class="{ active: !selectedTag }"
              @click="selectTag('')"
            >
              全部
            </button>
            <button
              v-for="tag in tagsList"
              :key="tag"
              type="button"
              class="article-tag"
              :class="{ active: selectedTag === tag }"
              @click="selectTag(tag)"
            >
              {{ tag }}
            </button>
          </div>

          <div v-if="filteredList.length" class="article-grid">
            <article
              v-for="item in filteredList"
              :key="item.id"
              class="article-card"
              @click="goToDetail(item)"
            >
              <div class="article-cover-wrap">
                <img
                  v-if="item.cover"
                  :src="item.cover"
                  :alt="item.title"
                  loading="lazy"
                  class="article-cover"
                />
                <div v-else class="article-cover article-cover-placeholder">无图</div>
              </div>
              <div class="article-body">
                <h2 class="article-card-title">{{ item.title }}</h2>
                <p class="article-excerpt">{{ item.excerpt || '暂无摘要' }}</p>
                <time v-if="item.createdAt" class="article-date">
                  {{ formatDate(item.createdAt) }}
                </time>
              </div>
            </article>
          </div>
          <p v-else class="article-empty">暂无文章</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.articles-page {
  --accent: #0d9488;
  --card-bg: rgba(255, 255, 255, 0.08);
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

.articles-bg {
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

.articles-main {
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
}

.articles-scroll {
  padding: 1.5rem 2rem;
}

@media (min-width: 768px) {
  .articles-scroll {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
  }
}

@media (min-width: 1200px) {
  .articles-scroll {
    padding-left: 3rem;
    padding-right: 3rem;
  }
}

.article-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.article-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.article-header-text {
  flex: 1;
  min-width: 0;
}

.article-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}

.article-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

.article-search {
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

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.article-tag {
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--text-muted, #94a3b8);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.article-tag:hover {
  color: var(--accent);
  border-color: var(--accent);
}
.article-tag.active {
  color: var(--accent);
  background: rgba(13, 148, 136, 0.15);
  border-color: var(--accent);
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .article-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
}

@media (min-width: 1200px) {
  .article-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.article-card {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: var(--card-bg);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.article-card:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.article-cover-wrap {
  aspect-ratio: 4/3;
  overflow: hidden;
}

.article-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.article-cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  font-size: 0.875rem;
}

.article-body {
  padding: 1rem;
}

.article-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-excerpt {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0 0 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.article-date {
  font-size: 0.75rem;
  color: var(--text-muted);
  opacity: 0.8;
}

.article-loading {
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
}

.article-error-wrap {
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
}

.article-error {
  color: #f87171;
  margin: 0;
}

.article-empty {
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
  margin: 0;
}
</style>
