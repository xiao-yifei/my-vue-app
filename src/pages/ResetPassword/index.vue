<script setup>
defineOptions({ name: 'ResetPassword' })
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { resetPassword } from '@/api'

const route = useRoute()
const router = useRouter()
const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const passwordMatch = computed(
  () => password.value === confirmPassword.value && confirmPassword.value.length > 0
)

onMounted(() => {
  token.value = (route.query.token || '').trim()
  if (!token.value) {
    ElMessage.warning('缺少重置凭证，请从邮件中的链接访问')
    router.replace('/forgot-password')
  }
})

async function onSubmit() {
  error.value = ''
  if (!token.value) {
    ElMessage.warning('请从邮件中的链接访问此页面')
    return
  }
  if (!password.value || password.value.length < 6) {
    error.value = '请输入至少 6 位密码'
    ElMessage.warning('请输入至少 6 位密码')
    return
  }
  if (!passwordMatch.value) {
    error.value = '两次输入的密码不一致'
    ElMessage.warning('两次输入的密码不一致')
    return
  }
  loading.value = true
  try {
    await resetPassword({ token: token.value, password: password.value })
    ElMessage.success('密码已重置，请使用新密码登录')
    router.push('/login')
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '重置失败，链接可能已过期，请重新申请'
    error.value = msg
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="reset-page">
    <div class="reset-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="reset-card">
      <header class="reset-header">
        <h1 class="reset-title">重置密码</h1>
        <p class="reset-subtitle">请设置您的新密码</p>
      </header>

      <form v-if="token" class="reset-form" @submit.prevent="onSubmit">
        <p v-if="error" class="form-error">{{ error }}</p>
        <div class="field">
          <label for="password">新密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入新密码（至少 6 位）"
            autocomplete="new-password"
          />
        </div>
        <div class="field">
          <label for="confirmPassword">确认密码</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            autocomplete="new-password"
          />
          <span v-if="confirmPassword && !passwordMatch" class="field-error">两次密码不一致</span>
        </div>
        <button
          type="submit"
          class="btn-submit"
          :disabled="!passwordMatch || password.length < 6 || loading"
        >
          {{ loading ? '提交中…' : '确认重置' }}
        </button>
      </form>

      <p class="back-hint">
        <router-link to="/login">返回登录</router-link>
        <span class="divider">|</span>
        <router-link to="/forgot-password">重新申请</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.reset-page {
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

.reset-bg {
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

.reset-card {
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

.reset-header {
  text-align: center;
  margin-bottom: 2rem;
}

.reset-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.reset-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
}

.reset-form {
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

.field-error {
  font-size: 0.8rem;
  color: #f87171;
  margin-top: 0.25rem;
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
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s, opacity 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: var(--accent-hover);
  box-shadow: 0 8px 25px var(--accent-glow);
}

.btn-submit:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.divider {
  margin: 0 0.5rem;
  opacity: 0.6;
}
</style>
