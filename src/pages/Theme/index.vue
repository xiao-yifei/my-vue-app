<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getThemeById as fetchThemeById } from '@/api'

const route = useRoute()
const router = useRouter()

const theme = ref(null)
const loading = ref(true)
const error = ref('')

async function loadTheme() {
  const id = route.params.id
  if (!id) {
    theme.value = null
    loading.value = false
    return
  }
  loading.value = true
  error.value = ''
  theme.value = null
  try {
    const data = await fetchThemeById(id)
    theme.value = data
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '加载主题失败'
    error.value = msg
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, loadTheme, { immediate: true })

watch(
  theme,
  (t) => {
    document.title = t ? `${t.label} - 主题 - my-vue-app` : '主题 - my-vue-app'
  },
  { immediate: true }
)

const previewList = computed(() => theme.value?.images?.map((i) => i.src) ?? [])

function goBack() {
  router.push('/home')
}
</script>

<template>
  <div class="theme-page">
    <div class="theme-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <p v-if="loading" class="theme-loading">加载中…</p>
    <div v-else-if="error" class="theme-error-wrap">
      <p class="theme-error">{{ error }}</p>
      <button type="button" class="btn-back" @click="goBack">返回发现</button>
    </div>
    <div v-else-if="theme" class="theme-container">
      <header class="theme-header">
        <button type="button" class="btn-back" @click="goBack">← 返回发现</button>
        <h1 class="theme-title">{{ theme.label }}</h1>
        <p class="theme-desc">该主题下更多图片</p>
      </header>

      <div class="theme-gallery">
        <div
          v-for="(img, i) in theme.images"
          :key="i"
          class="theme-item"
        >
          <el-image
            :src="img.src"
            :alt="img.alt"
            :preview-src-list="previewList"
            :initial-index="i"
            fit="cover"
            loading="lazy"
            preview-teleported
            class="theme-img"
          />
        </div>
      </div>
    </div>

    <div v-else class="theme-empty">
      <p>未找到该主题</p>
      <button type="button" class="btn-back" @click="goBack">返回发现</button>
    </div>
  </div>
</template>

<style scoped>
.theme-page {
  --accent: #0d9488;
  --card-bg: rgba(255, 255, 255, 0.08);
  --card-border: rgba(255, 255, 255, 0.12);
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  min-height: 100vh;
  padding: 1.5rem;
  position: relative;
  overflow-x: hidden;
  font-family: 'Outfit', system-ui, sans-serif;
}

.theme-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
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

.theme-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.theme-header {
  margin-bottom: 1.5rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 10px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.btn-back:hover {
  color: var(--text);
  border-color: var(--accent);
}

.theme-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}

.theme-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

.theme-gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .theme-gallery {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
}

@media (min-width: 1200px) {
  .theme-gallery {
    grid-template-columns: repeat(4, 1fr);
  }
}

.theme-item {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  aspect-ratio: 4/3;
  background: var(--card-bg);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.theme-item:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.theme-img {
  width: 100%;
  height: 100%;
  display: block;
  cursor: pointer;
}

.theme-img :deep(.el-image__wrapper),
.theme-img :deep(.el-image__inner) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
}

.theme-loading,
.theme-error {
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
}

.theme-error-wrap {
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
}

.theme-error {
  color: #f87171;
  margin: 0 0 1rem;
}

.theme-error-wrap .btn-back {
  margin-top: 0.5rem;
}

.theme-empty {
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
}

.theme-empty .btn-back {
  margin-top: 1rem;
}
</style>
