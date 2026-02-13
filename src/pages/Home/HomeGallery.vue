<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getThemes } from '@/api'

const props = defineProps({
  searchQuery: { type: String, default: '' },
})

const emit = defineEmits(['update:searchQuery', 'ready'])

const themesList = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await getThemes()
    themesList.value = Array.isArray(data) ? data : []
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '加载主题失败'
    error.value = msg
    ElMessage.error(msg)
    themesList.value = []
  } finally {
    loading.value = false
    nextTick(() => emit('ready'))
  }
})

const filteredThemes = computed(() => {
  const list = themesList.value
  const q = (props.searchQuery || '').trim().toLowerCase()
  if (!q) return list
  return list.filter((t) => t.label && t.label.toLowerCase().includes(q))
})
</script>

<template>
  <section class="gallery-section">
    <div class="section-header">
      <h2 class="section-title">发现</h2>
      <div class="search-wrap">
        <input
          :value="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索主题（如：森林、星空）"
          aria-label="搜索主题"
          @input="emit('update:searchQuery', ($event.target || $event).value)"
        />
      </div>
    </div>
    <p v-if="loading" class="search-empty">加载中…</p>
    <p v-else-if="error" class="search-empty search-error">{{ error }}</p>
    <div v-else-if="filteredThemes.length" class="gallery gallery--masonry">
      <router-link
        v-for="(item, i) in filteredThemes"
        :key="item.id"
        :to="`/theme/${item.id}`"
        class="gallery-item"
        :class="[
          item.large && 'gallery-item--large',
          item.ratio && `gallery-item--${item.ratio}`,
        ]"
      >
        <img
          :src="item.src"
          :alt="item.alt"
          loading="lazy"
          decoding="async"
          class="gallery-img"
        />
        <span class="gallery-label">{{ item.label }}</span>
      </router-link>
    </div>
    <p v-else class="search-empty">暂无匹配的主题</p>
  </section>
</template>

<style scoped>
.gallery-section {
  margin-bottom: 0;
  width: 100%;
  box-sizing: border-box;
}

.section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.search-wrap {
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}

.search-input {
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.25rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--text);
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 0.75rem center;
}

.search-input::placeholder {
  color: var(--text-muted);
  opacity: 0.8;
}

.search-input:hover {
  border-color: rgba(148, 163, 184, 0.35);
}

.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.25);
}

.search-empty {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 2rem 0;
}

.search-error {
  color: #f87171;
}

/* 瀑布流：多列布局 + 首图横跨全列 */
.gallery--masonry {
  column-count: 2;
  column-gap: 1rem;
  width: 100%;
  /* 优化列布局性能 */
  contain: layout;
}

@media (min-width: 768px) {
  .gallery--masonry {
    column-count: 3;
    column-gap: 1rem;
  }
}

@media (min-width: 1200px) {
  .gallery--masonry {
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
  /* 使用 transform 和 opacity 代替 box-shadow 变化，性能更好 */
  transition: transform 0.2s ease;
  /* 提示浏览器优化 */
  will-change: transform;
  /* 启用硬件加速 */
  transform: translateZ(0);
}

.gallery-item:hover {
  transform: translateZ(0) scale(1.02);
}

/* 首图横跨整行 */
.gallery-item--large {
  column-span: all;
  aspect-ratio: 21/9;
  margin-bottom: 1rem;
}

/* 不同比例形成错落 */
.gallery-item--wide {
  aspect-ratio: 4/3;
}

.gallery-item--tall {
  aspect-ratio: 3/4;
}

.gallery-item--square {
  aspect-ratio: 1/1;
}

/* 无 ratio 时默认 */
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
  /* 使用 will-change 和 translateZ 优化图片缩放动画 */
  transition: transform 0.3s ease;
  will-change: transform;
  transform: translateZ(0);
}

.gallery-item:hover .gallery-img {
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
  /* 优化动画性能 */
  transition: opacity 0.2s ease, transform 0.2s ease;
  will-change: opacity, transform;
}

.gallery-item:hover .gallery-label {
  opacity: 1;
  transform: translateY(0);
}
</style>
