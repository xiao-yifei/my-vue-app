# 前端目录结构说明

## 约定

- **页面**：每个路由对应 `pages/<模块名>/index.vue`，有子页面时使用 `pages/<模块名>/<子页>.vue`（如 `Article/Detail.vue`）。
- **组件**：可复用 UI 放在 `components/`，按需在页面中引用。
- **接口**：按业务拆成 `api/*.js`，由 `api/index.js` 统一导出。
- **工具与组合式**：`utils/` 放通用工具（如 auth、permission），`composables/` 放可复用的组合式逻辑（如 useTheme、useListScrollRestore）。

## 目录一览

```
src/
├── api/                 # 接口封装
│   ├── index.js        # 统一导出
│   ├── request.js      # axios 实例与拦截
│   ├── auth.js
│   ├── articles.js
│   ├── videos.js
│   ├── themes.js
│   ├── banners.js
│   ├── comments.js
│   ├── favorites.js
│   ├── history.js
│   ├── notifications.js
│   ├── profile.js
│   ├── stats.js
│   ├── tags.js
│   └── upload.js
├── components/         # 公共组件
│   ├── TopBar.vue
│   ├── BannerCarousel.vue
│   ├── CommentList.vue
│   ├── FileUpload.vue
│   └── HomeGallery.vue
├── composables/
│   ├── useTheme.js
│   └── useListScrollRestore.js
├── pages/              # 页面（按模块分目录）
│   ├── Home/
│   │   └── index.vue
│   ├── Login/
│   │   └── index.vue
│   ├── Register/
│   │   └── index.vue
│   ├── Articles/
│   │   └── index.vue
│   ├── Article/
│   │   └── Detail.vue
│   ├── ArticleConfig/
│   ├── Videos/
│   ├── Video/
│   │   └── Detail.vue
│   ├── VideoConfig/
│   ├── Gallery/
│   │   ├── index.vue   # 图库列表
│   │   └── Detail.vue  # 图库详情
│   ├── GalleryConfig/
│   ├── BannerConfig/
│   ├── Stats/
│   ├── Notifications/
│   ├── History/
│   ├── Search/
│   ├── Favorites/
│   ├── MyComments/
│   ├── Profile/
│   └── About/
├── router/
│   └── index.js
├── utils/
│   ├── auth.js
│   └── permission.js
├── App.vue
├── main.js
├── style.css
└── STRUCTURE.md        # 本说明
```

## 命名与路由

- 模块目录：PascalCase 或首字母大写（如 `ArticleConfig`、`MyComments`）。
- 路由路径：kebab-case（如 `/my-comments`、`/article-config`）。
- 新增页面：在对应目录下加 `index.vue` 或子页，再在 `router/index.js` 中注册路由与 import。
