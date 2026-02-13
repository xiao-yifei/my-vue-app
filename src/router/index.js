import { createRouter, createWebHistory } from 'vue-router'
import { getToken, getUserInfo } from '@/utils/auth.js'
import { canManageThemes } from '@/utils/permission.js'
import Login from '@/pages/Login.vue'
import Register from '@/pages/Register.vue'
import Home from '@/pages/Home/index.vue'
import Theme from '@/pages/Theme/index.vue'
import ThemeConfig from '@/pages/ThemeConfig/index.vue'

const routes = [
  {
    path: '/',
    redirect: () => (getToken() ? '/home' : '/login'),
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { title: '首页', requiresAuth: true },
  },
  {
    path: '/theme/:id',
    name: 'Theme',
    component: Theme,
    meta: { title: '主题', requiresAuth: true },
  },
  {
    path: '/theme-config',
    name: 'ThemeConfig',
    component: ThemeConfig,
    meta: { title: '主题配置', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: '注册' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = getToken()
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }
  if ((to.path === '/login' || to.path === '/register') && token) {
    next('/home')
    return
  }
  if (to.meta.requiresAdmin && !canManageThemes(getUserInfo())) {
    next({ path: '/home', query: { message: 'noPermission' } })
    return
  }
  next()
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - my-vue-app` : 'my-vue-app'
})

export default router
