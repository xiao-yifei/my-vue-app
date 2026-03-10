<script setup>
defineOptions({ name: 'About' })
import { ref } from 'vue'
import LegalModal from '@/components/LegalModal.vue'

const showTermsModal = ref(false)
const showPrivacyModal = ref(false)
</script>

<template>
  <div class="about-page">
    <div class="about-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>
    <main class="about-main">
      <div class="about-container">
        <header class="about-header">
          <h1 class="about-title">关于</h1>
          <p class="about-subtitle">my-vue-app</p>
        </header>

        <section class="about-section">
          <p class="about-desc">
            本应用是一个内容展示平台，提供文章、视频、图库的浏览与搜索功能，
            支持用户注册登录、个人收藏、浏览历史、评论互动等。
          </p>
        </section>

        <section class="about-section">
          <h2 class="section-title">版本信息</h2>
          <p class="about-version">v0.0.0</p>
        </section>

        <section class="about-section">
          <h2 class="section-title">法律条款</h2>
          <p class="about-links">
            <a href="#" @click.prevent="showTermsModal = true">用户协议</a>
            <span class="sep">·</span>
            <a href="#" @click.prevent="showPrivacyModal = true">隐私政策</a>
          </p>
          <LegalModal v-model="showTermsModal" type="terms" />
          <LegalModal v-model="showPrivacyModal" type="privacy" />
        </section>

        <section class="about-section">
          <h2 class="section-title">联系我们</h2>
          <p class="about-contact">
            如有问题或建议，请通过应用内反馈或邮件与我们取得联系。
          </p>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.about-page {
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
.about-bg {
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
  width: 350px;
  height: 350px;
  background: var(--accent);
  top: -80px;
  right: -60px;
}
.shape-2 {
  width: 250px;
  height: 250px;
  background: #6366f1;
  bottom: -40px;
  left: -40px;
}
.about-main {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem;
}
.about-container {
  max-width: 480px;
  margin: 0 auto;
}
.about-header {
  margin-bottom: 2rem;
}
.about-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.25rem;
}
.about-subtitle {
  font-size: 1rem;
  color: var(--accent);
  margin: 0;
}
.about-section {
  margin-bottom: 2rem;
}
.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0 0 0.75rem;
}
.about-desc,
.about-version,
.about-contact {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text);
  margin: 0;
}
.about-links {
  margin: 0;
  font-size: 0.95rem;
}
.about-links a {
  color: var(--accent);
  text-decoration: none;
}
.about-links a:hover {
  text-decoration: underline;
}
.about-links .sep {
  margin: 0 0.5rem;
  color: var(--text-muted);
}
</style>
