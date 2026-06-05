# DELEE - 个人创作档案

DELEE 不是一个只用来摆放链接的个人主页，而是一个持续生长的创作档案。它把文章、视觉作品、视频、实验项目、每日更新和访客反馈放进同一个网站里，让“我最近在想什么、做什么、留下些什么”可以被清晰地浏览，也可以被后台持续维护。

这个项目的核心目标是：前台像一个有气质的个人网站，后台像一个真正能长期使用的内容工作台。为了做到这件事，我没有只堆页面，而是围绕内容生产、媒体上传、公开展示、反馈收集和部署维护设计了一整套链路。

## 网站里有什么

- 首页：展示每日更新和最近加入档案的内容，让访问者第一眼看到网站仍然在更新。
- 文章：保存文本作品、观察札记、长期想法和创作记录，支持分类筛选、Markdown 渲染和 DOCX 阅读体验。
- 画廊：展示图片、视频、海报、动态作品和实验性视觉内容，图片可预览，视频可在画廊里直接动起来。
- Lab：放置实验性作品、交互系统、视觉系统和未完成项目，适合记录正在形成中的东西。
- Orask：访客可以留下问题、建议或合作想法，内容会进入后台，并尝试通过邮件提醒我。
- 内容后台：用于发布和管理文章、画廊、Lab、每日更新、默认封面、Orask 留言和管理员密码。

## 我为什么加入这些技术

### Next.js App Router

我选择 Next.js App Router，是为了让公开页面、后台页面和 API 路由放在同一个清晰的应用结构里。这个项目既需要展示型页面，也需要后台表单和服务端接口；App Router 可以让我把 `/articles`、`/gallery`、`/dashboard`、`/api/admin/*` 这些功能自然地组织在 `app/` 目录下。

项目中大量页面使用服务端组件读取数据库内容，例如首页、文章列表、画廊和 Lab。这样做的目的不是炫技，而是让公开内容尽量直接、稳定、适合部署，同时让后台写入后的内容能即时反映到前台。

### React 与 TypeScript

React 用来承载交互体验，例如画廊预览弹窗、分类切换、后台表单、文件上传控件、Orask 提交状态和 DOCX 分页阅读。TypeScript 则是为了让这些数据流更可靠：文章、画廊作品、Lab 项目、上传结果、后台表单字段都有明确类型，后续继续扩展时不容易把内容结构写乱。

### Tailwind CSS

我加入 Tailwind CSS，是为了让这个站点保持统一的视觉语言，同时仍然能快速调整页面细节。DELEE 的前台不是通用模板风格，而是偏“创作档案”的纸张感、安静的排版和低饱和界面；Tailwind 让我可以把布局、间距、边框、响应式状态直接落在组件里，减少样式文件和组件之间来回跳转。

### Prisma 与 PostgreSQL

这个网站不是静态作品集，它需要后台持续写入内容，所以我引入 Prisma 和 PostgreSQL。

Prisma 的作用是把数据库模型变成清晰的 TypeScript 开发体验。当前核心模型包括：

- `DailyUpdate`：首页每日更新。
- `Article`：文章内容、分类、标签、封面、发布状态和精选状态。
- `GalleryItem`：图片、视频、海报、动画和实验作品。
- `LabProject`：实验项目、打开方式、嵌入链接和发布排序。
- `OraskMessage`：访客反馈、来源、已读状态和提交时间。

PostgreSQL 用来承载生产环境数据。相比把内容写死在文件里，数据库让后台发布、草稿、筛选、搜索和状态管理变得自然，也让这个网站更像一个可以长期运转的创作系统。

### Markdown、DOCX 与 ZIP 导入

文章系统支持手写 Markdown，也支持导入 Markdown 文件、Markdown ZIP 包和 DOCX 文件。

我加入 `gray-matter`，是为了从 Markdown front matter 中读取标题、日期、分类、标签、摘要、封面和发布状态。这样文章既可以保留写作工具里的元信息，又能进入后台统一管理。

我加入 `react-markdown`、`remark-gfm`、`rehype-slug` 和 `rehype-sanitize`，是为了让文章正文既能支持 GFM 表格、任务列表等常见写法，又能自动生成标题锚点，并在渲染前进行 HTML 清理。这里的目标是让 Markdown 足够自由，但不把前台渲染暴露给不必要的风险。

我加入 `jszip`，是为了处理两类更真实的内容迁移场景：

- Markdown ZIP：当文章引用本地图片时，系统会从压缩包中找到图片，上传到远程存储，再重写 Markdown 图片路径。
- DOCX：当内容来自 Word 文档时，系统会读取 DOCX 内部 XML，把段落、标题、列表、表格、分页符和图片转换成可渲染的文章内容。

这套导入链路的目的很简单：降低发布门槛。内容可以先在熟悉的写作工具里完成，再进入网站。

### Vercel Blob 与腾讯云 COS

图片和视频不能只存在本地目录里，因为生产环境部署后本地文件系统并不适合作为长期存储。为了解决媒体文件的持久化和公开访问，我加入了两套远程存储路径：

- Vercel Blob：适合部署在 Vercel 时直接保存图片和视频。
- 腾讯云 COS：适合需要国内云存储、独立 CDN 或自定义公开域名的场景。

`lib/storage.ts` 会根据环境变量自动选择 COS、Vercel Blob 或本地开发目录。本地开发没有配置远程存储时，文件会写入 `public/uploads`，方便调试；生产环境则要求配置远程存储，避免上传内容随着部署环境丢失。

### 图片水印机制

我还加入了一个比较克制的图片水印机制。它不是传统意义上把水印烙进原图，也不是试图做成不可破解的 DRM；它更像是在公开展示层上加一层明确的边界。

具体实现上，图片仍然通过正常的 `img` 加载，`WatermarkedImage` 会在图片容器上叠加一层独立的水印元素，水印素材来自 `public/watermarks/delee-website-7-1.svg`，并通过 CSS 控制位置、透明度、尺寸和阴影。这样做的好处是：原始图片不会被破坏，站点视觉仍然干净，但访问者直接截图或随手搬运时，图片会自然带上 DELEE 的标识。

这个设计的真实目的不是阻止所有人。如果一个人真的喜欢作品，愿意稍微研究浏览器开发者工具，当然仍然有机会找到无水印资源；但对于那种只是顺手截图、批量搬运、直接盗资源的人，水印层会显著抬高低成本盗用的门槛。它是一种温和的防护，也是一种作者署名的在场感。

### Nodemailer 与 Orask

Orask 是这个网站的访客反馈入口。我加入 `nodemailer`，是为了在访客提交问题、建议或合作想法后，除了把内容保存进数据库，还能尝试发送邮件提醒。

这里的设计重点是“先保存，再通知”。也就是说，即使邮件发送失败，Orask 留言仍然会进入后台，不会因为 SMTP 配置或网络波动导致反馈丢失。

### Zod 与 React Hook Form

后台和 Orask 都有大量表单输入。我加入 `zod`，是为了在 API 层统一校验请求内容，例如标题、slug、日期、邮箱、文件类型和密码长度。`react-hook-form` 则用于前端表单状态管理，让后台编辑、登录、上传和 Orask 提交更轻量。

这两者配合的目的，是让表单体验不要只依赖浏览器提示，而是在前端交互和后端保护之间建立一致的规则。

### 自定义后台登录与 Session

这个项目没有接入庞大的用户系统，因为后台只服务个人内容管理。我用环境变量保存管理员身份配置，并通过 HMAC 签名的 `httpOnly` Cookie 实现后台 Session。

这样做的目的，是在复杂度可控的前提下保护 `/dashboard` 和 `/api/admin/*`。后台登录态不会暴露给前端脚本，生产环境下 Cookie 会启用 `secure`，并且 Session 有过期时间。

## 内容后台能做什么

后台入口：

```txt
/login
```

登录后进入：

```txt
/dashboard
```

后台目前支持：

- 管理每日更新：新增、编辑、删除、搜索、发布/草稿切换。
- 管理文章：新建、编辑、删除、发布、分类、标签、封面、Markdown 预览。
- 导入文章：支持 Markdown 单文件、Markdown ZIP 包和 DOCX 文件。
- 管理画廊：上传图片、视频、视频封面，维护分类、标签和发布状态。
- 管理 Lab：维护实验项目的分类、状态、封面、打开方式和链接。
- 管理默认封面：给不同类型内容提供可复用的视觉资产。
- 管理 Orask：搜索、查看、标记已读/未读、删除访客反馈。
- 修改管理员密码：新密码会以哈希形式保存，不继续保留明文密码。

## 公开 API 与后台 API

公开 API 只返回已发布内容：

```txt
GET  /api/public/updates
GET  /api/public/articles
GET  /api/public/articles/[slug]
GET  /api/public/gallery
GET  /api/public/lab
POST /api/orask
```

后台 API 需要登录：

```txt
POST /api/admin/login
POST /api/admin/logout
GET  /api/admin/me

/api/admin/updates
/api/admin/articles
/api/admin/gallery
/api/admin/lab
/api/admin/orask
/api/admin/default-covers
/api/admin/upload/image
/api/admin/upload/video
/api/admin/upload/cos
```

## 本地运行

安装依赖：

```bash
npm install
```

复制环境变量：

```bash
cp .env.example .env.local
```

生成 Prisma Client：

```bash
npm run db:generate
```

同步数据库结构：

```bash
npm run db:push
```

启动开发服务器：

```bash
npm run dev
```

访问：

```txt
http://localhost:3000
http://localhost:3000/login
```

## 环境变量

基础配置：

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"

ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret

NEXT_PUBLIC_SITE_URL=http://localhost:3000
MAX_IMAGE_UPLOAD_MB=20
MAX_VIDEO_UPLOAD_MB=300
```

Orask 邮件通知：

```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@163.com
SMTP_PASS=your-smtp-authorization-code
ORASK_RECEIVER_EMAIL=receiver@example.com
```

Vercel Blob：

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token
```

腾讯云 COS：

```env
TENCENT_COS_SECRET_ID=your-secret-id
TENCENT_COS_SECRET_KEY=your-secret-key
TENCENT_COS_BUCKET=your-bucket
TENCENT_COS_REGION=ap-shanghai
TENCENT_COS_PUBLIC_URL=https://your-cdn-or-bucket-domain
```

## 常用命令

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run lint
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:seed
npm run db:studio
```

## 部署说明

推荐部署到 Vercel。项目的构建命令是：

```bash
npm run build
```

生产环境至少需要配置：

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

如果要在后台上传图片和视频，还需要配置 Vercel Blob 或腾讯云 COS。生产环境不会把上传文件长期保存在本地目录里，这是为了保证每次部署后媒体内容仍然可访问。

## 项目结构

```txt
app/                    前台页面、后台页面和 API Route
components/             公开站点组件和通用交互组件
components/admin/       内容后台组件
content/                站点文案
data/                   分类、默认数据和展示元信息
lib/                    数据读取、认证、上传、导入、邮件和工具函数
prisma/                 数据模型、迁移和种子数据
public/                 Logo、图标、默认图片和本地开发上传目录
scripts/                迁移和初始化脚本
```

## 验证

提交前建议运行：

```bash
npm run typecheck
npm run build
```

`npm run lint` 也保留在脚本中，不过当前项目使用的是 Next.js 14，而 `next lint` 在新版 Next.js 生态中已经逐步不再作为推荐入口；如果后续升级 lint 流程，可以迁移到独立 ESLint 命令。
