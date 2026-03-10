<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  banners: {
    type: Array,
    default: () => [],
  },
  autoplayInterval: { type: Number, default: 5000 },
})

const router = useRouter()
const current = ref(0)
let timer = null

function goTo(index) {
  if (index >= 0 && index < props.banners.length) {
    current.value = index
  }
}

function next() {
  current.value = (current.value + 1) % Math.max(1, props.banners.length)
}

function prev() {
  current.value =
    (current.value - 1 + props.banners.length) % Math.max(1, props.banners.length)
}

function handleClick(banner) {
  const link = banner.link
  if (!link) return
  if (link.startsWith('/')) {
    router.push(link)
  } else if (link.startsWith('http')) {
    window.open(link, '_blank')
  }
}

function startAutoplay() {
  if (props.banners.length <= 1) return
  timer = setInterval(next, props.autoplayInterval)
}

function stopAutoplay() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()
})
</script>

<template>
  <div
    v-if="banners.length"
    class="banner-carousel"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <div class="banner-track">
      <div
        v-for="(banner, i) in banners"
        :key="banner.id"
        class="banner-slide"
        :class="{ active: i === current }"
        @click="handleClick(banner)"
      >
        <img
          :src="banner.image"
          :alt="banner.title"
          class="banner-img"
          loading="eager"
        />
        <div v-if="banner.title" class="banner-title">{{ banner.title }}</div>
      </div>
    </div>
    <button
      v-if="banners.length > 1"
      type="button"
      class="banner-arrow banner-prev"
      aria-label="上一张"
      @click.stop="prev"
    >
      ‹
    </button>
    <button
      v-if="banners.length > 1"
      type="button"
      class="banner-arrow banner-next"
      aria-label="下一张"
      @click.stop="next"
    >
      ›
    </button>
    <div v-if="banners.length > 1" class="banner-dots">
      <button
        v-for="(banner, i) in banners"
        :key="banner.id"
        type="button"
        class="banner-dot"
        :class="{ active: i === current }"
        :aria-label="`切换到第 ${i + 1} 张`"
        @click.prevent="goTo(i)"
      />
    </div>
  </div>
</template>

<style scoped>
.banner-carousel {
  --accent: #0d9488;
  position: relative;
  aspect-ratio: 16/6;
  max-height: 380px;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.3),
    0 10px 30px -10px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.banner-track {
  position: relative;
  width: 100%;
  height: 100%;
}

.banner-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s ease;
  cursor: pointer;
}

.banner-slide.active {
  opacity: 1;
  z-index: 1;
}

.banner-slide.active .banner-img {
  animation: banner-zoom 0.6s ease-out;
}

@keyframes banner-zoom {
  from { transform: scale(1.05); }
  to { transform: scale(1); }
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.banner-slide::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 50%,
    rgba(0, 0, 0, 0.5) 100%
  );
  pointer-events: none;
}

.banner-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 2rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.02em;
  z-index: 1;
}

.banner-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 400;
  color: #fff;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.banner-arrow:hover {
  background: rgba(13, 148, 136, 0.5);
  border-color: rgba(13, 148, 136, 0.6);
  transform: translateY(-50%) scale(1.08);
}

.banner-arrow:active {
  transform: translateY(-50%) scale(0.95);
}

.banner-prev {
  left: 1rem;
}

.banner-next {
  right: 1rem;
}

.banner-dots {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.banner-dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.banner-dot:hover {
  background: rgba(255, 255, 255, 0.7);
}

.banner-dot.active {
  width: 24px;
  border-radius: 4px;
  background: var(--accent);
  box-shadow: 0 0 12px rgba(13, 148, 136, 0.5);
}
</style>
