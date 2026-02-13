# 与 node-test 后端联动说明

本前端项目（my-vue-app）已按 node-test 的接口约定配置，可按以下步骤联动运行。

## 1. 启动后端（node-test）

在 **node-test** 项目根目录执行：

```bash
cd e:\node-test
npm install
npm start
```

后端默认运行在 **http://localhost:3000**，提供：

- `POST /api/auth/register` — 注册（username, email, password）
- `POST /api/auth/login` — 登录（username, password）
- `GET /api/auth/me` — 获取当前用户（需 Bearer token）
- `POST /api/auth/logout` — 退出（需 Bearer token）
- `GET /api/themes` — 获取全部主题（发现页列表）
- `GET /api/themes/:id` — 根据 id 获取单个主题（主题详情页）

## 2. 启动前端（my-vue-app）

在本项目根目录执行：

```bash
cd e:\my-vue-app
npm run dev
```

开发环境下，Vite 会把前端的 **/api** 请求代理到 **http://localhost:3000**，因此登录、注册、退出等会直接打到 node-test。

## 3. 已对齐的配置

| 项目     | 说明 |
|----------|------|
| 代理     | `vite.config.js` 中 `/api` → `http://localhost:3000` |
| 请求基址 | 开发时 `baseURL = '/api'`，即请求为 `/api/auth/login` 等 |
| 认证     | 请求头 `Authorization: Bearer <token>`，与 node-test 一致 |
| 响应     | 登录/注册返回 `{ token, user }`，前端会存 token 与 userInfo |

## 4. 注意事项

- **登录**：node-test 仅支持用 **用户名** 登录（不支持用邮箱登录），请使用注册时的用户名。
- **生产/其他环境**：若前端与后端不同域，在 my-vue-app 根目录配置 `.env` 或 `.env.production`，设置 `VITE_API_BASE_URL=http(s)://你的后端地址/api`，打包后请求会发往该地址。
- **CORS**：node-test 已设置 `Access-Control-Allow-Origin: *`，跨域请求可正常使用。

## 5. 快速自测

1. 先启动 node-test（端口 3000），再启动 my-vue-app。
2. 在浏览器打开前端地址（如 http://localhost:5173），进入注册页注册一个账号。
3. 使用该账号的用户名和密码登录，能进入首页即表示前后端已联动成功。
