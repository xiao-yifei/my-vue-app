<script setup>
defineOptions({ name: 'Search' })
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticles, getVideos, getThemes } from '@/api'

const route = useRoute()
const router = useRouter()
const q = ref((route.query.q || '').trim())
const loading = ref(false)
const articles = ref([])
const videos = ref([])
const themes = ref([])
const activeTab = ref('all') // all | article | video | theme

async function search() {
  const keyword = q.value.toLowerCase()
  if (!keyword) {
    articles.value = []
    videos.value = []
    themes.value = []
    return
  }
  loading.value = true
  try {
    const [articlesRes, videosRes, themesRes] = await Promise.all([
      getArticles(),
      getVideos(),
      getThemes(),
    ])
    const a = Array.isArray(articlesRes) ? articlesRes : []
    const v = Array.isArray(videosRes) ? videosRes : []
    const t = Array.isArray(themesRes) ? themesRes : []
    const match = (text) => (text || '').toLowerCase().includes(keyword)
    articles.value = a.filter((x) => match(x.title) || match(x.excerpt))
    videos.value = v.filter((x) => match(x.title) || match(x.excerpt))
    themes.value = t.filter((x) => match(x.label) || match(x.id))
  } catch (err) {
    articles.value = []
    videos.value = []
    themes.value = []
  } finally {
    loading.value = false
  }
}

const totalCount = computed(
  () => articles.value.length + videos.value.length + themes.value.length
)

const showArticles = computed(() => activeTab.value === 'all' || activeTab.value === 'article')
const showVideos = computed(() => activeTab.value === 'all' || activeTab.value === 'video')
const showThemes = computed(() => activeTab.value === 'all' || activeTab.value === 'theme')

watch(
  () => route.query.q,
  (v) => {
    if (route.path !== '/search') return
    q.value = (v || '').trim()
    search()
  },
  { immediate: true }
)

function onSubmit() {
  router.replace({ path: '/search', query: q.value ? { q: q.value } : {} })
  search()
}

function goArticle(item) {
  router.push(`/article/${item.id}`)
}
function goVideo(item) {
  router.push(`/video/${item.id}`)
}
function goTheme(item) {
  router.push(`/theme/${item.id}`)
}
</script>

<template>
  <div class="search-page">
    <div class="search-bg"></div>
    <main class="search-main">
      <div class="search-container">
        <header class="search-header">
          <h1 class="search-title">搜索</h1>
          <form class="search-form" @submit.prevent="onSubmit">
            <input
              v-model="q"
              type="search"
              class="search-input"
              placeholder="搜索文章、视频、图库..."
              aria-label="搜索"
              autofocus
            />
            <button type="submit" class="btn-search" :disabled="loading">
              {{ loading ? '搜索中…' : '搜索' }}
            </button>
          </form>
        </header>

        <div v-if="!q.trim()" class="search-hint">
          <p>输入关键词搜索文章、视频和图库内容</p>
        </div>

        <template v-else>
          <div v-if="loading" class="search-loading">加载中…</div>
          <template v-else>
            <div class="search-tabs">
              <button
                type="button"
                class="tab"
                :class="{ active: activeTab === 'all' }"
                @click="activeTab = 'all'"
              >
                全部 ({{ totalCount }})
              </button>
              <button
                type="button"
                class="tab"
                :class="{ active: activeTab === 'article' }"
                @click="activeTab = 'article'"
              >
                文章 ({{ articles.length }})
              </button>
              <button
                type="button"
                class="tab"
                :class="{ active: activeTab === 'video' }"
                @click="activeTab = 'video'"
              >
                视频 ({{ videos.length }})
              </button>
              <button
                type="button"
                class="tab"
                :class="{ active: activeTab === 'theme' }"
                @click="activeTab = 'theme'"
              >
                图库 ({{ themes.length }})
              </button>
            </div>

            <div v-if="totalCount === 0" class="search-empty">
              <p>未找到与「{{ q }}」相关的内容</p>
            </div>

            <div v-else class="search-results">
              <section v-if="showArticles && articles.length" class="result-section">
                <h2 class="result-section-title">文章</h2>
                <ul class="result-list">
                  <li
                    v-for="item in articles"
                    :key="'a-' + item.id"
                    class="result-item"
                    @click="goArticle(item)"
                  >
                    <img
                      v-if="item.cover"
                      :src="item.cover"
                      :alt="item.title"
                      class="result-thumb"
                    />
                    <div v-else class="result-thumb result-thumb-placeholder">文</div>
                    <div class="result-meta">
                      <span class="result-title">{{ item.title }}</span>
                      <span v-if="item.excerpt" class="result-desc">{{ item.excerpt }}</span>
                    </div>
                  </li>
                </ul>
              </section>
              <section v-if="showVideos && videos.length" class="result-section">
                <h2 class="result-section-title">视频</h2>
                <ul class="result-list">
                  <li
                    v-for="item in videos"
                    :key="'v-' + item.id"
                    class="result-item"
                    @click="goVideo(item)"
                  >
                    <img
                      v-if="item.cover"
                      :src="item.cover"
                      :alt="item.title"
                      class="result-thumb"
                    />
                    <div v-else class="result-thumb result-thumb-placeholder">视</div>
                    <div class="result-meta">
                      <span class="result-title">{{ item.title }}</span>
                      <span v-if="item.excerpt" class="result-desc">{{ item.excerpt }}</span>
                    </div>
                  </li>
                </ul>
              </section>
              <section v-if="showThemes && themes.length" class="result-section">
                <h2 class="result-section-title">图库</h2>
                <ul class="result-list">
                  <li
                    v-for="item in themes"
                    :key="'t-' + item.id"
                    class="result-item"
                    @click="goTheme(item)"
                  >
                    <img
                      v-if="item.src"
                      :src="item.src"
                      :alt="item.label"
                      class="result-thumb"
                    />
                    <div v-else class="result-thumb result-thumb-placeholder">图</div>
                    <div class="result-meta">
                      <span class="result-title">{{ item.label || item.id }}</span>
                    </div>
                  </li>
                </ul>
              </section>
            </div>
          </template>
        </template>
      </div>
    </main>
  </div>
</template>

<style scoped>
.search-page {
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
  font-family: 'Outfit', system-ui, sans-serif;
}
.search-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
}
.search-main {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem;
}
.search-container {
  max-width: 800px;
  margin: 0 auto;
}
.search-header {
  margin-bottom: 1.5rem;
}
.search-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 1rem;
}
.search-form {
  display: flex;
  gap: 0.5rem;
}
.search-input {
  flex: 1;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  color: var(--text);
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  outline: none;
}
.search-input:focus {
  border-color: var(--accent);
}
.search-input::placeholder {
  color: var(--text-muted);
}
.btn-search {
  padding: 0.6rem 1.25rem;
  font-size: 0.95rem;
  font-family: inherit;
  font-weight: 500;
  color: #fff;
  background: var(--accent);
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
.btn-search:hover:not(:disabled) {
  opacity: 0.9;
}
.btn-search:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.search-hint,
.search-loading,
.search-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}
.search-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.tab {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.tab:hover {
  color: var(--text);
}
.tab.active {
  color: var(--accent);
  background: rgba(13, 148, 136, 0.15);
  border-color: rgba(13, 148, 136, 0.3);
}
.search-results {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.result-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0 0 0.75rem;
}
.result-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.result-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent);
}
.result-thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
.result-thumb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  font-size: 1.25rem;
}
.result-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.result-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.result-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
