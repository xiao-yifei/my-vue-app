import { createRouter, createWebHistory } from 'vue-router'
import { getToken, getUserInfo } from '@/utils/auth.js'
import {
  canManageThemes,
  canManageArticles,
  canManageVideos,
} from '@/utils/permission.js'
import Login from '@/pages/Login.vue'
import Register from '@/pages/Register.vue'
import ForgotPassword from '@/pages/ForgotPassword/index.vue'
import ResetPassword from '@/pages/ResetPassword/index.vue'
import Home from '@/pages/Home/index.vue'
import Articles from '@/pages/Articles/index.vue'
import ArticleDetail from '@/pages/Article/Detail.vue'
import ArticleConfig from '@/pages/ArticleConfig/index.vue'
import Gallery from '@/pages/Gallery/index.vue'
import GalleryDetail from '@/pages/Gallery/Detail.vue'
import GalleryConfig from '@/pages/GalleryConfig/index.vue'
import Videos from '@/pages/Videos/index.vue'
import VideoDetail from '@/pages/Video/Detail.vue'
import VideoConfig from '@/pages/VideoConfig/index.vue'
import BannerConfig from '@/pages/BannerConfig/index.vue'
import Search from '@/pages/Search/index.vue'
import Stats from '@/pages/Stats/index.vue'
import History from '@/pages/History/index.vue'
import MyComments from '@/pages/MyComments/index.vue'
import Favorites from '@/pages/Favorites/index.vue'
import Notifications from '@/pages/Notifications/index.vue'
import Profile from '@/pages/Profile/index.vue'
import About from '@/pages/About/index.vue'

const routes = [
  {
    path: '/',
    redirect: () => (getToken() ? '/home' : '/login'),
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
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { title: '忘记密码' },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: { title: '重置密码' },
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { title: '首页', requiresAuth: true },
  },
  {
    path: '/articles',
    name: 'Articles',
    component: Articles,
    meta: { title: '文章', requiresAuth: true },
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: ArticleDetail,
    meta: { title: '文章详情', requiresAuth: true },
  },
  {
    path: '/article-config',
    name: 'ArticleConfig',
    component: ArticleConfig,
    meta: { title: '文章配置', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/themes',
    name: 'Gallery',
    component: Gallery,
    meta: { title: '图库', requiresAuth: true },
  },
  {
    path: '/theme/:id',
    name: 'GalleryDetail',
    component: GalleryDetail,
    meta: { title: '主题详情', requiresAuth: true },
  },
  {
    path: '/theme-config',
    name: 'GalleryConfig',
    component: GalleryConfig,
    meta: { title: '图库配置', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/videos',
    name: 'Videos',
    component: Videos,
    meta: { title: '视频', requiresAuth: true },
  },
  {
    path: '/video/:id',
    name: 'VideoDetail',
    component: VideoDetail,
    meta: { title: '视频详情', requiresAuth: true },
  },
  {
    path: '/video-config',
    name: 'VideoConfig',
    component: VideoConfig,
    meta: { title: '视频配置', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/banner-config',
    name: 'BannerConfig',
    component: BannerConfig,
    meta: { title: '横幅配置', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    meta: { title: '搜索', requiresAuth: true },
  },
  {
    path: '/stats',
    name: 'Stats',
    component: Stats,
    meta: { title: '数据统计', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/history',
    name: 'History',
    component: History,
    meta: { title: '浏览历史', requiresAuth: true },
  },
  {
    path: '/my-comments',
    name: 'MyComments',
    component: MyComments,
    meta: { title: '我的评论', requiresAuth: true },
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites,
    meta: { title: '我的收藏', requiresAuth: true },
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: { title: '消息通知', requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { title: '个人中心', requiresAuth: true },
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { title: '关于', requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = getToken()
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password']

  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }
  if (authPaths.includes(to.path) && token) {
    next('/home')
    return
  }
  if (to.meta.requiresAdmin) {
    const userInfo = getUserInfo()
    const adminPaths = {
      '/theme-config': canManageThemes,
      '/article-config': canManageArticles,
      '/video-config': canManageVideos,
      '/banner-config': () => userInfo?.role === 'admin',
      '/stats': () => userInfo?.role === 'admin',
    }
    const canAccess = adminPaths[to.path]?.(userInfo)
    if (!canAccess) {
      next({ path: '/home', query: { message: 'noPermission' } })
      return
    }
  }
  next()
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - my-vue-app` : 'my-vue-app'
})

export default router
