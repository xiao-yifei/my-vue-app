<script setup>
defineOptions({ name: 'Register' })
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register } from '@/api'
import LegalModal from '@/components/LegalModal.vue'

const router = useRouter()
const showTermsModal = ref(false)
const showPrivacyModal = ref(false)
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeTerms = ref(false)
const loading = ref(false)
const error = ref('')

const passwordMatch = computed(() => password.value === confirmPassword.value && confirmPassword.value.length > 0)

async function onSubmit() {
  if (!agreeTerms.value || !passwordMatch.value) {
    if (!agreeTerms.value) {
      ElMessage.warning('请先同意用户协议')
    } else if (!passwordMatch.value) {
      ElMessage.warning('两次输入的密码不一致')
    }
    return
  }
  error.value = ''
  loading.value = true
  try {
    await register({
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value,
    })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '注册失败，请重试'
    error.value = msg
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="register-card">
      <header class="register-header">
        <h1 class="register-title">创建账号</h1>
        <p class="register-subtitle">填写信息即可注册</p>
      </header>

      <form class="register-form" @submit.prevent="onSubmit">
        <p v-if="error" class="form-error">{{ error }}</p>
        <div class="field">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>

        <div class="field">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="请输入邮箱地址"
            autocomplete="email"
          />
        </div>

        <div class="field">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请设置密码（至少 6 位）"
            autocomplete="new-password"
          />
        </div>

        <div class="field">
          <label for="confirmPassword">确认密码</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            autocomplete="new-password"
          />
          <span v-if="confirmPassword && !passwordMatch" class="field-error">两次密码不一致</span>
        </div>

        <label class="checkbox-wrap">
          <input v-model="agreeTerms" type="checkbox" />
          <span class="checkmark"></span>
          <span class="checkbox-text">
            我已阅读并同意
            <a href="#" @click.prevent.stop="showTermsModal = true">用户协议</a>
            和
            <a href="#" @click.prevent.stop="showPrivacyModal = true">隐私政策</a>
          </span>
        </label>

        <LegalModal v-model="showTermsModal" type="terms" />
        <LegalModal v-model="showPrivacyModal" type="privacy" />

        <button type="submit" class="btn-register" :disabled="!agreeTerms || !passwordMatch || loading">
          {{ loading ? '注册中…' : '注 册' }}
        </button>

        <p class="login-hint">
          已有账号？<router-link to="/login">去登录</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register-page {
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

.register-bg {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.65) 50%, rgba(30, 41, 59, 0.78) 100%),
    url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=85') center/cover no-repeat;
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

.register-card {
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

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.register-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
}

.register-form {
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

.field input:hover {
  border-color: rgba(148, 163, 184, 0.35);
}

.field input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.field input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-error {
  font-size: 0.8rem;
  color: #f87171;
  margin-top: 0.25rem;
}

.checkbox-wrap {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  cursor: pointer;
  user-select: none;
}

.checkbox-wrap input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkmark {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 2px;
  border: 2px solid var(--input-border);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, background 0.2s;
}

.checkbox-wrap input:checked + .checkmark {
  background: var(--accent);
  border-color: var(--accent);
}

.checkbox-wrap input:checked + .checkmark::after {
  content: '';
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-bottom: 2px;
}

.checkbox-wrap a {
  color: var(--accent);
  text-decoration: none;
}

.checkbox-wrap a:hover {
  text-decoration: underline;
}

.btn-register {
  margin-top: 0.25rem;
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

.btn-register:hover:not(:disabled) {
  background: var(--accent-hover);
  box-shadow: 0 8px 25px var(--accent-glow);
}

.btn-register:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-register:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-hint {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0.5rem 0 0;
}

.login-hint a {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}

.login-hint a:hover {
  text-decoration: underline;
}
</style>
