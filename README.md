# DELEE 个人创作档案

这是一个基于 Next.js App Router 的个人网站，包含公开展示站和独立的 Creator Admin 内容管理系统。

公开网站包含：

- Home
- Articles
- Gallery
- Orask

Creator Admin 包含：

- Dashboard
- Daily Updates 管理
- Articles 管理
- Gallery 管理
- Orask Messages 管理
- 图片和视频上传
- 发布 / 草稿状态管理

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Nodemailer
- zod
- react-hook-form
- react-markdown

## 安装依赖

```bash
cd personal-site
npm install
```

如果终端提示 `npm` 找不到，请确认 Node.js 已经安装并加入系统 PATH。

## 环境变量

复制环境变量示例：

```bash
cp .env.example .env.local
```

`.env.local` 示例：

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"

ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=change-this-session-secret

SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@163.com
SMTP_PASS=your-smtp-authorization-code
ORASK_RECEIVER_EMAIL=13218009000@163.com

MAX_IMAGE_UPLOAD_MB=20
MAX_VIDEO_UPLOAD_MB=100
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SMTP_PASS` 是 163 邮箱 SMTP 授权码，不是邮箱登录密码。

## 初始化数据库

```bash
npm run db:generate
npm run db:push
```

常用数据库命令：

```bash
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:seed
npm run db:studio
```

说明：生产环境必须使用 PostgreSQL。首次配置数据库后，可运行 `npm run db:push` 同步 Prisma schema；如需填充示例数据，再运行 `npm run db:seed`。

## 运行网站

公开网站和 Creator Admin 使用同一个开发服务器：

```bash
npm run dev
```

公开网站：

```txt
http://localhost:3000
```

Creator Admin：

```txt
http://localhost:3000/login
```

登录成功后进入：

```txt
http://localhost:3000/dashboard
```

后台账号密码来自 `.env.local`：

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
```

## 数据模型

Prisma schema 位于：

```txt
prisma/schema.prisma
```

核心模型：

- `DailyUpdate`：首页每日更新。
- `Article`：文章内容，正文以 Markdown 存储。
- `GalleryItem`：图片、视频、海报、动画、实验作品。
- `OraskMessage`：访客反馈。

数据库客户端：

```txt
lib/db.ts
```

初始化数据：

```txt
prisma/seed.ts
```

## Creator Admin 使用

### 新增 Daily Update

进入：

```txt
/dashboard/updates
```

可以新增、编辑、删除、搜索、按日期管理，并切换发布 / 草稿状态。封面可通过图片上传控件上传。

### 新增文章

进入：

```txt
/dashboard/articles
```

支持：

- 新增 / 编辑 / 删除
- 发布 / 取消发布
- Markdown 编辑
- Markdown 预览
- 自动生成 slug
- 手动修改 slug
- 标签和分类
- 封面上传

公开文章链接为：

```txt
/articles/your-slug
```

### 上传图片和视频

新增图片在 Vercel 生产环境会上传到 Vercel Blob，并把公开 URL 保存到数据库。旧的 `/uploads/images/...` 路径仅用于历史内容兼容。

新增视频在 Vercel 生产环境会上传到 Vercel Blob，并把公开 URL 保存到数据库。旧的 `/uploads/videos/...` 路径仅用于历史内容兼容。

上传接口：

```txt
POST /api/admin/upload/image
POST /api/admin/upload/video
```

限制：

- 图片：jpg、jpeg、png、webp、gif
- 视频：mp4、webm、mov
- 默认图片最大 20MB
- 默认视频最大 100MB

大小限制可通过环境变量修改：

```env
MAX_IMAGE_UPLOAD_MB=20
MAX_VIDEO_UPLOAD_MB=100
```

### 新增 Gallery 作品

进入：

```txt
/dashboard/gallery
```

支持图片和视频作品。视频支持上传视频文件和 thumbnail 封面。公开 Gallery 仍保留原来的动态视频体验：`muted`、`loop`、`playsInline`、`preload="metadata"`，进入视口后播放。

### 查看 Orask 反馈

进入：

```txt
/dashboard/orask
```

支持：

- 搜索名字、邮箱、主题、内容
- 查看详情
- 标记已读 / 未读
- 删除反馈

公开 Orask 提交后会先保存到数据库，再尝试发送邮件。如果邮件发送失败，后台仍能看到留言。

## API

后台 API 都需要登录：

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/me`
- `/api/admin/updates`
- `/api/admin/articles`
- `/api/admin/gallery`
- `/api/admin/orask`
- `/api/admin/upload/image`
- `/api/admin/upload/video`

公开 API 只返回 `published = true` 的内容：

- `GET /api/public/updates`
- `GET /api/public/articles`
- `GET /api/public/articles/[slug]`
- `GET /api/public/gallery`
- `POST /api/orask`

## 发布规则

公开网站现在读取数据库内容：

- Home 读取 `DailyUpdate`
- Articles 读取 `Article`
- Gallery 读取 `GalleryItem`
- Orask 写入 `OraskMessage` 并发送邮件

只有 `published = true` 的内容会显示在公开网站。

## 163 邮箱 SMTP

1. 登录 163 邮箱。
2. 开启 SMTP/POP3 服务。
3. 生成 SMTP 授权码。
4. 在 `.env.local` 中填写：

```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@163.com
SMTP_PASS=your-smtp-authorization-code
ORASK_RECEIVER_EMAIL=13218009000@163.com
```

## 数据库配置

`prisma/schema.prisma` 的 datasource 使用 PostgreSQL：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

把 `.env.local` 或 Vercel Environment Variables 的 `DATABASE_URL` 设置为 PostgreSQL 连接串，再执行：

```bash
npm run db:generate
npm run db:push
```

## 上传存储

上传逻辑集中在：

```txt
lib/storage.ts
```

生产环境使用 Vercel Blob；本地开发环境在没有配置 `BLOB_READ_WRITE_TOKEN` 时，会继续写入本地 `public/uploads` 目录，方便调试。后台表单和 Gallery 数据结构只保存公开 URL。

## 常用文件

- `app/`：公开页面、后台页面和 API Route。
- `components/admin/`：Creator Admin 后台组件。
- `components/`：公开网站组件。
- `lib/db.ts`：Prisma Client。
- `lib/admin-auth.ts`：后台登录 session。
- `lib/storage.ts`：上传存储。
- `lib/articles.ts`：公开文章读取。
- `lib/public-content.ts`：公开首页和 Gallery 数据读取。
- `prisma/schema.prisma`：数据库模型。
- `prisma/seed.ts`：初始化数据。
- `.env.local`：本地敏感配置。

## 验证命令

```bash
npm run typecheck
npm run lint
npm run build
```

## Vercel 部署

推荐使用 Vercel 的 Next.js 自动识别配置：

- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `.next`

生产环境至少需要配置：

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token
```

如果需要 Orask 邮件发送，还需要配置：

```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@163.com
SMTP_PASS=your-smtp-authorization-code
ORASK_RECEIVER_EMAIL=receiver@example.com
```

当前部署使用 PostgreSQL。构建阶段只执行 `prisma generate` 和 `next build`，不会初始化或写入数据库。后台新增图片、视频和 Markdown ZIP 内图片会上传到 Vercel Blob；生产环境如果缺少 `BLOB_READ_WRITE_TOKEN`，后台上传会显示：`Vercel Blob is not configured. Please add BLOB_READ_WRITE_TOKEN in Vercel Environment Variables.`

后台内容会写入 `DATABASE_URL` 指向的 PostgreSQL 数据库。
