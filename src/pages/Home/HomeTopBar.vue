<script setup>
defineProps({
  displayName: { type: String, default: '用户' },
  displayEmail: { type: String, default: '—' },
  showThemeConfig: { type: Boolean, default: false },
  loggingOut: { type: Boolean, default: false },
})

defineEmits(['logout'])
</script>

<template>
  <header class="top-bar">
    <div class="top-bar-left">
      <span class="top-bar-title">首页</span>
      <router-link v-if="showThemeConfig" to="/theme-config" class="top-bar-link">主题配置</router-link>
    </div>
    <div class="top-bar-right">
      <div class="user-info-bar">
        <div class="avatar">{{ displayName.charAt(0).toUpperCase() }}</div>
        <div class="user-meta">
          <span class="user-name">{{ displayName }}</span>
          <span class="user-email">{{ displayEmail }}</span>
        </div>
      </div>
      <button type="button" class="btn-logout" :disabled="loggingOut" @click="$emit('logout')">
        {{ loggingOut ? '退出中…' : '退出登录' }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--card-bg);
  border-bottom: 1px solid var(--card-border);
  /* 降低模糊度以提升滚动性能 */
  backdrop-filter: blur(10px);
  /* 启用硬件加速 */
  transform: translateZ(0);
}

.top-bar-left {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.top-bar-link {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.top-bar-link:hover {
  color: var(--accent);
}

.top-bar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.02em;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.user-info-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info-bar .avatar {
  width: 36px;
  height: 36px;
  font-size: 1rem;
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
  min-width: 0;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.user-email {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-logout {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.btn-logout:hover:not(:disabled) {
  color: var(--text);
  border-color: rgba(148, 163, 184, 0.5);
}

.btn-logout:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
