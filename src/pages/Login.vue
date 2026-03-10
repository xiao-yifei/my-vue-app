<script setup>
defineOptions({ name: 'Login' })
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api'
import { setAuth, getRememberedUsername, getRememberMe } from '@/utils/auth.js'

const router = useRouter()
const username = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const error = ref('')

onMounted(() => {
  username.value = getRememberedUsername()
  remember.value = getRememberMe()
})

async function onSubmit() {
  error.value = ''
  if (!username.value.trim() || !password.value) {
    const msg = '请填写用户名和密码'
    error.value = msg
    ElMessage.warning(msg)
    return
  }
  loading.value = true
  try {
    const data = await login({
      username: username.value.trim(),
      password: password.value,
      remember: remember.value,
    })
    const userInfo = data?.user
      ? data.user
      : { username: username.value.trim() }
    setAuth({
      token: data?.token ?? '',
      userInfo,
      remember: remember.value,
      username: username.value.trim(),
    })
    ElMessage.success('登录成功')
    router.push('/home')
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '登录失败，请重试'
    error.value = msg
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="login-card">
      <header class="login-header">
        <h1 class="login-title">欢迎回来</h1>
        <p class="login-subtitle">登录以继续使用</p>
      </header>

      <form class="login-form" @submit.prevent="onSubmit">
        <p v-if="error" class="form-error">{{ error }}</p>
        <div class="field">
          <label for="username">用户名 / 邮箱</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入用户名或邮箱"
            autocomplete="username"
          />
        </div>

        <div class="field">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>

        <div class="options">
          <label class="checkbox-wrap">
            <input v-model="remember" type="checkbox" />
            <span class="checkmark"></span>
            记住我
          </label>
          <router-link to="/forgot-password" class="forgot">忘记密码？</router-link>
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? '登录中…' : '登 录' }}
        </button>

        <p class="signup-hint">
          还没有账号？<router-link to="/register">立即注册</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
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

.login-bg {
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

.login-card {
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

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.login-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
}

.login-form {
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

.options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.checkbox-wrap {
  display: inline-flex;
  align-items: center;
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
  width: 18px;
  height: 18px;
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

.forgot {
  font-size: 0.875rem;
  color: var(--accent);
  text-decoration: none;
  transition: color 0.2s;
}

.forgot:hover {
  color: #2dd4bf;
}

.btn-login {
  margin-top: 0.5rem;
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

.btn-login:hover {
  background: var(--accent-hover);
  box-shadow: 0 8px 25px var(--accent-glow);
}

.btn-login:active {
  transform: scale(0.98);
}

.signup-hint {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0.5rem 0 0;
}

.signup-hint a {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}

.signup-hint a:hover {
  text-decoration: underline;
}
</style>
