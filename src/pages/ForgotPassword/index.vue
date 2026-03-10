<script setup>
defineOptions({ name: 'ForgotPassword' })
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { requestPasswordReset } from '@/api'

const router = useRouter()
const email = ref('')
const loading = ref(false)
const error = ref('')
const submitted = ref(false)

async function onSubmit() {
  error.value = ''
  const trimmed = email.value.trim()
  if (!trimmed) {
    error.value = '请输入邮箱地址'
    ElMessage.warning('请输入邮箱地址')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    error.value = '请输入有效的邮箱地址'
    ElMessage.warning('请输入有效的邮箱地址')
    return
  }
  loading.value = true
  try {
    await requestPasswordReset({ email: trimmed })
    submitted.value = true
    ElMessage.success('重置链接已发送至您的邮箱，请查收')
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '发送失败，请稍后重试'
    error.value = msg
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="forgot-page">
    <div class="forgot-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="forgot-card">
      <header class="forgot-header">
        <h1 class="forgot-title">忘记密码</h1>
        <p class="forgot-subtitle">输入注册时使用的邮箱，我们将发送重置链接</p>
      </header>

      <form v-if="!submitted" class="forgot-form" @submit.prevent="onSubmit">
        <p v-if="error" class="form-error">{{ error }}</p>
        <div class="field">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="请输入注册时的邮箱地址"
            autocomplete="email"
          />
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? '发送中…' : '发送重置链接' }}
        </button>
      </form>

      <div v-else class="forgot-success">
        <p class="success-text">我们已向 <strong>{{ email }}</strong> 发送了密码重置链接。</p>
        <p class="success-hint">请查看您的邮箱并点击链接重置密码。如未收到，请检查垃圾邮件文件夹。</p>
      </div>

      <p class="back-hint">
        <router-link to="/login">返回登录</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.forgot-page {
  --accent: #0d9488;
  --accent-hover: #0f766e;
  --accent-glow: rgba(13, 148, 136, 0.35);
  --card-bg: rgba(255, 255, 255, 0.08);
  --card-border: rgba(255, 255, 255, 0.12);
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --input-bg: rgba(15, 23, 42, 0.6);
  --input-border: rgba(148, 163, 184, 0.2);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  font-family: 'Outfit', system-ui, sans-serif;
}

.forgot-bg {
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

.shape-3 {
  width: 200px;
  height: 200px;
  background: #8b5cf6;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.25;
}

.forgot-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
}

.forgot-header {
  text-align: center;
  margin-bottom: 2rem;
}

.forgot-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.forgot-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
}

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-error {
  font-size: 0.875rem;
  color: #f87171;
  margin: 0;
  padding: 0.5rem 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
}

.field input {
  width: 100%;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  color: var(--text);
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.field input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.field input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.btn-submit {
  padding: 0.9rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  color: white;
  background: var(--accent);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: var(--accent-hover);
  box-shadow: 0 8px 25px var(--accent-glow);
}

.btn-submit:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.forgot-success {
  text-align: center;
  padding: 0.5rem 0;
}

.success-text {
  font-size: 0.95rem;
  color: var(--text);
  margin: 0 0 1rem;
  line-height: 1.6;
}

.success-text strong {
  color: var(--accent);
}

.success-hint {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.6;
}

.back-hint {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 1.5rem 0 0;
}

.back-hint a {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}

.back-hint a:hover {
  text-decoration: underline;
}
</style>
