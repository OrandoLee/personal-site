# DELEE - 个人创作档案与内容工作台

DELEE 不是一个只用来陈列个人简介和社交链接的主页，也不是一组彼此孤立的作品页面。它更接近一套持续生长的个人创作基础设施：前台负责保存、组织和呈现文章、视觉作品、视频、实验项目与阶段性想法；后台负责把这些内容真正发布出去，并继续处理媒体上传、文档导入、访客留言和邮件回复。

我希望它同时具备两种性格：

- 对访客而言，它是一座安静、有辨识度、可以慢慢浏览的个人档案馆。
- 对创作者而言，它是一张能长期使用的工作台，而不只是项目完成时才打开一次的展示模板。

因此，这个项目的重点并不只是“做出几个页面”，而是建立一条完整链路：

```txt
创作与整理
  -> Markdown / DOCX / 图片 / 视频 / 项目信息
  -> 内容后台校验、上传和保存
  -> PostgreSQL 与对象存储持久化
  -> Next.js 服务端读取
  -> 前台按内容类型重新组织和呈现
  -> Orask 收集访客反馈
  -> 后台继续回复和维护
```

这份 README 会同时说明网站现在能够做什么、每项技术为什么被加入，以及整套视觉设计背后的审美判断。

## 目录

- [项目定位](#项目定位)
- [网站功能地图](#网站功能地图)
- [整体架构](#整体架构)
- [完整技术栈与选型原因](#完整技术栈与选型原因)
- [审美设计理念](#审美设计理念)
- [内容与数据模型](#内容与数据模型)
- [内容生产工作流](#内容生产工作流)
- [后台能力](#后台能力)
- [API 结构](#api-结构)
- [本地运行](#本地运行)
- [环境变量](#环境变量)
- [部署说明](#部署说明)
- [项目结构](#项目结构)
- [当前实现说明](#当前实现说明)
- [验证与维护](#验证与维护)

## 项目定位

### 不是“个人名片”，而是个人档案

传统个人主页通常围绕身份信息组织：头像、简介、技能、项目链接和联系方式。DELEE 选择了另一种中心：内容本身。

这里更关心的是：

- 最近在思考什么。
- 最近完成了什么。
- 哪些作品值得长期保存。
- 哪些实验还没有完成，但已经值得留下痕迹。
- 访客能否在看完内容之后继续提出问题。

首页因此不以履历作为第一信息，而是展示最近进入档案的文章和画廊内容。文章、画廊与 Lab 也不是同一种卡片换三套数据，而是根据内容媒介建立不同的阅读节奏和视觉隐喻。

### 不是“纯展示站”，而是可维护的系统

如果所有内容都写死在组件里，网站第一次上线会很快，但之后每次更新都需要修改代码、重新构建，并且很难处理草稿、筛选、批量导入和媒体上传。

所以我加入了数据库、后台、对象存储、文章导入与邮件链路。它们让这个网站从一次性作品变成可以长期运行的内容系统：

- 内容可以保存为草稿，再决定是否公开。
- 文章和画廊作品可以置顶。
- 图片与视频不依赖部署机器的临时文件系统。
- Word 和 Markdown 内容可以进入同一个发布流程。
- 访客留言不会只停留在一封容易遗漏的通知邮件里。
- 回复记录会保存在数据库中，形成可追踪的沟通历史。

### 前台和后台拥有不同气质

前台强调纸张、墨色、留白、阅读与内容气质；后台强调信息密度、状态识别、批量操作和长期维护。

我没有强行让后台延续前台的全部装饰语言。后台采用深色工作台界面，是为了让“编辑、搜索、上传、发布、回复”这些重复操作更集中、更清楚，也让公开展示与私人管理在心理上形成边界。

## 网站功能地图

### 首页 `/`

首页是整个档案的时间入口。

当前实现会从已发布文章和已发布画廊作品中自动聚合更新，优先展示置顶内容，再按创建时间排序。页面会先寻找上海时区下的“今日更新”；如果当天没有内容，则回退到最近一次有内容的日期。

这样设计是为了避免首页变成一个需要额外维护的宣传页。只要内容被正常发布，首页就会自然反映网站仍在生长。

首页包含：

- 当前日期或最近更新日期。
- 当日进入档案的内容。
- 最近四条文章、图片或视频。
- 指向文章与画廊的主要入口。
- 类型、置顶状态与内容摘要。

### 文章 `/articles`

文章区用于保存文本作品、观察札记、长期想法、公告与技术文档。

它支持：

- 按分类筛选文章。
- 文章置顶。
- 标签、摘要、封面与发布日期。
- Markdown 正文渲染。
- GFM 表格、任务列表等扩展语法。
- 标题锚点。
- 外部链接安全打开。
- Markdown HTML 清理。
- DOCX 来源文章的分页阅读。
- 文章合集与合集内排序。
- 默认封面回退。

文章合集不是简单标签。它拥有自己的标题、slug、摘要、封面、公开状态、置顶状态和文档顺序，适合组织系列文章、连续记录或一组需要共同阅读的文档。

### 画廊 `/gallery`

画廊用于承载图片、海报、视频、动态作品和视觉实验。

它支持：

- 按图片、视频、海报、动态和实验分类筛选。
- 单个作品保存多张图片或多个媒体地址。
- 图片灯箱预览与前后切换。
- 缩略图导航。
- 视频静音循环。
- 视频进入视口后播放、离开视口后暂停。
- 移动端内联播放。
- 图片和视频置顶。
- 图片展示层水印。
- 可配置的视频默认封面。

画廊没有把视频当成“点击之后才知道是什么”的附件。视频可以直接在网格中运动，但通过 `IntersectionObserver` 控制播放时机，减少不可见视频持续占用资源。

### Lab `/lab`

Lab 用于保存尚在形成中的实验项目，例如：

- 游戏原型。
- 网页交互。
- 视觉系统。
- 技术 Demo。
- 尚未归类的尝试。

每个项目可以选择三种打开方式：

- `embed`：在项目详情页中使用 `iframe` 嵌入。
- `external`：跳转到独立外部页面。
- `internal`：进入主站内部路径。

Lab 还可以关联 GitHub 仓库。前台会读取仓库创建时间和最近推送时间，并统一转换为上海时区显示。加入这项能力，是因为实验项目的“生命迹象”往往不只体现在发布日期，也体现在代码仓库是否仍然更新。

### Orask `/orask`

Orask 是访客反馈入口，也是一种比普通“Contact”页面更接近网站整体语气的沟通方式。

访客可以提交：

- 名字。
- 邮箱。
- 主题。
- 问题、建议、合作想法或其他内容。
- 当前来源页面。

提交后，系统会先把留言保存到 PostgreSQL，再尝试发送通知邮件。即使 SMTP 暂时失败，留言仍然会保存在后台。

页面左侧的便笺列表可以勾选、编辑和继续添加条目；右侧表单被设计成一张会进入、书写并在成功后“撕下”的纸张。这些互动不是独立小游戏，而是把“留下一个想法”转换成更具体的动作感。

### 内容后台 `/dashboard`

后台用于管理：

- 文章与文章合集。
- Markdown、Markdown ZIP 和 DOCX 导入。
- 画廊图片与视频。
- Lab 项目。
- 自动聚合的首页更新。
- 默认封面。
- Orask 留言。
- Orask 回复邮箱。
- 管理员密码。

### Orask 回复工作台 `/login/ans`

回复工作台与普通留言管理分开，是因为“查看留言”和“持续回复邮件”是两种不同的工作流。

这里支持：

- 待回复、全部、已回复筛选。
- 搜索访客、邮箱、主题和正文。
- 查看留言来源与时间。
- 撰写邮件主题和正文。
- 保存每次回复的发送状态。
- 记录发送成功、发送失败与错误原因。
- 成功后自动标记留言已读并写入最后回复时间。

## 整体架构

项目采用一个 Next.js 应用同时承载前台、后台与 API：

```txt
Browser
  |
  |-- Public UI
  |     |-- Home
  |     |-- Articles / Collections
  |     |-- Gallery
  |     |-- Lab
  |     `-- Orask
  |
  |-- Creator Admin
  |     |-- Content managers
  |     |-- Import workflows
  |     |-- Upload workflows
  |     `-- Reply workspace
  |
  `-- Next.js Route Handlers
        |-- Public read APIs
        |-- Admin CRUD APIs
        |-- Authentication
        |-- Upload signatures
        |-- Import parsers
        `-- Mail delivery

Next.js Server Components / Route Handlers
  |
  |-- Prisma Client -> PostgreSQL
  |-- Vercel Blob / Tencent COS
  |-- SMTP
  `-- GitHub REST API
```

公开页面大量使用服务端组件直接读取数据。需要筛选、弹窗、播放控制、语言切换、主题切换和表单状态的部分再进入客户端组件。

这种边界的目的不是追求“所有代码都在服务端”，而是让不同职责待在合适的位置：

- 数据查询、权限判断和敏感配置留在服务端。
- 浏览器交互、媒体控制和即时反馈留在客户端。
- 公开内容尽量由服务端输出稳定 HTML。
- 后台写入通过受保护的 Route Handler 完成。

## 完整技术栈与选型原因

### Next.js 14 与 App Router

项目使用 `Next.js 14.2` 和 App Router。

我选择 App Router，是因为这个网站天然包含三类边界：

- 公开页面。
- 私有后台页面。
- 服务端 API。

它们都可以按照 URL 结构自然放在 `app/` 中，例如：

```txt
app/articles/
app/gallery/
app/lab/
app/orask/
app/dashboard/
app/api/public/
app/api/admin/
```

App Router 的服务端组件也适合这个项目的数据读取方式。文章列表、文章详情、画廊和 Lab 都可以在服务端直接查询 Prisma，不需要先把数据库能力暴露成浏览器可访问接口，再从客户端二次请求。

公开内容页面使用 `force-dynamic`，是为了让后台发布后的数据能够直接反映到前台，而不被静态构建结果长期冻结。

### React 18

React 负责所有需要状态和生命周期的交互：

- 画廊筛选与灯箱。
- 视频可见性播放控制。
- 页面和卡片进入动画。
- 主题与语言状态。
- 自定义光标。
- Orask 表单和纸张动画。
- 后台表单、搜索、批量选择和上传进度。
- DOCX 分页器。

我没有把所有页面都做成客户端应用。React 在这里主要承担“交互层”，而不是替代 Next.js 的服务端数据能力。

### TypeScript 5

项目开启了 `strict` TypeScript。

加入 TypeScript 的原因，是网站中的内容结构已经明显超过简单博客：

- 文章与文章合集。
- 多媒体画廊。
- 三种打开模式的 Lab 项目。
- 多状态的 Orask 回复。
- 对象存储上传结果。
- 后台 API 响应。
- 简繁语言偏好和主题偏好。

这些结构如果只依靠运行时约定，很容易在后台表单、数据库序列化和前台组件之间出现字段漂移。TypeScript 让数据模型的变化更早暴露，也使批量发布、导入和序列化逻辑更容易维护。

### Tailwind CSS 3

Tailwind 用于页面布局、间距、响应式状态、边框、颜色和大部分组件样式。

我加入 Tailwind，不是为了快速套用一个现成设计系统，而是为了让大量定制页面仍然共享同一套视觉变量。项目通过 CSS Variables 定义：

- 纸张色。
- 次级纸张色。
- 墨色。
- 辅助文字色。
- 分隔线。
- 陶土色。
- 苔绿色。
- 蓝灰色。
- 金色。

Tailwind 再把这些变量映射为 `archive-*` 颜色。这样主题切换时不需要替换每个组件的类名，视觉语言也不会因为页面增多而逐渐失控。

### 原生 CSS、CSS Variables 与关键帧动画

`app/globals.css` 不只是基础样式文件，它承担了网站大量视觉表达：

- 浅色与深色主题变量。
- 自定义光标。
- 纸张、水印和灯箱。
- Lab CRT 外壳、扫描线、闪烁和打字效果。
- 文章标题的书写与下划线动画。
- 画廊曝光、蓝图和拼贴动画。
- Orask 手写便笺、勾选和撕纸动画。
- 卡片倾斜、滚动显现和页面过渡。
- `prefers-reduced-motion` 降级。

我保留原生 CSS，是因为这些效果需要伪元素、复杂关键帧、组合选择器和媒体查询。把它们全部压进 Tailwind 任意值会降低可读性，也不利于统一管理动效降级。

### PostCSS 与 Autoprefixer

Tailwind 通过 PostCSS 参与构建，Autoprefixer 为需要的 CSS 规则补充浏览器前缀。

这部分技术不直接形成视觉特色，但它让定制 CSS 不必手工维护不同浏览器的兼容写法，是整个样式管线的基础层。

### Prisma 6

Prisma 是应用与 PostgreSQL 之间的数据访问层。

我选择 Prisma，主要因为：

- Schema 可以清楚表达内容模型和关系。
- Prisma Client 与 TypeScript 类型自然衔接。
- 迁移文件可以进入版本管理。
- 事务适合处理文章导入、合集关联和回复状态更新。
- 查询条件可以直接表达公开状态、置顶、分类与排序。

例如导入文章并加入合集时，文章创建与合集关系写入会放在同一个事务里；Orask 回复成功后，回复状态和留言最后回复时间也会一起更新。

### PostgreSQL

PostgreSQL 保存生产内容和后台状态。

它被加入的原因，是这个项目需要的不只是“读取几篇文章”，而是长期写入和管理：

- 草稿与公开状态。
- 唯一 slug。
- 文章合集关系。
- 多媒体元数据。
- Lab 排序和打开模式。
- 留言已读状态。
- 回复历史。
- 站点级设置。

相比把内容全部写进仓库文件，数据库更适合后台编辑、筛选、状态切换、批量操作和独立部署。

### React Hook Form

后台的登录、文章编辑、画廊管理、Lab 管理和密码修改使用 `react-hook-form`。

加入它的原因，是后台表单字段多、状态复杂，而且经常包含：

- 默认值回填。
- 编辑与新建模式切换。
- 数字、复选框和条件字段。
- 异步提交状态。
- 上传结果写回表单。

React Hook Form 可以减少每个输入框都手写状态同步的代码，让表单性能和可维护性更稳定。

### Zod

Zod 用于 API 请求体校验。

前端表单校验只能改善体验，不能保护服务端。后台 API 和 Orask API 都需要再次确认：

- 必填字段。
- 邮箱格式。
- slug 格式。
- 日期格式。
- 内容长度。
- 枚举值。
- 批量操作参数。

加入 Zod，是为了让校验规则以结构化 Schema 表达，并让错误信息可以统一返回，而不是在每个 Route Handler 中散落大量手写 `if`。

### React Markdown

文章正文由 `react-markdown` 渲染。

选择 Markdown，是因为它在写作工具、代码仓库和网站之间具有良好的可迁移性。选择 `react-markdown`，则是为了让 Markdown 节点进入 React 组件树，而不是直接插入一段未经控制的 HTML。

当前渲染链还包括：

- `remark-gfm`：支持表格、任务列表、删除线等 GFM 语法。
- `rehype-slug`：为标题生成锚点。
- `rehype-sanitize`：清理不安全 HTML，并保留需要的标题 id 与任务列表属性。

外部链接会自动添加新窗口和 `noopener noreferrer`，图片默认使用懒加载。

### Gray Matter

`gray-matter` 用于解析 Markdown front matter。

它让文章文件可以携带标题、slug、日期、分类、标签、封面和发布状态等元信息。这样内容可以先在熟悉的 Markdown 编辑器里完成，再进入后台，而不需要在导入后重新填写所有字段。

### JSZip

JSZip 同时服务两条内容导入链路：

1. Markdown ZIP。
2. DOCX。

Markdown ZIP 中，系统会定位 Markdown 文件和它引用的本地图片，将图片上传到对象存储，再重写正文中的相对路径。

DOCX 本身也是 ZIP 容器。系统会读取 OOXML 文件、关系表和媒体目录，把标题、段落、粗体、斜体、列表、表格、分页符和图片转换为可渲染 Markdown。

我加入 ZIP 和 DOCX 导入，是为了降低内容迁移成本。网站不应该强迫所有写作都从后台编辑器开始；更合理的方式是允许内容从现有工具进入网站。

### 自定义 DOCX 解析与分页

项目没有只把 DOCX 当成附件下载，而是尝试恢复其可阅读结构。

解析过程包括：

- 读取 `word/document.xml`。
- 读取图片关系。
- 上传 `word/media` 中的图片。
- 转换段落样式和标题层级。
- 转换列表与表格。
- 保留显式分页符。
- 在结构化解析覆盖不足时回退到纯文本路径。
- 使用内部标记识别 DOCX 来源文章。

前台遇到 DOCX 来源文章时，会启用分页阅读器。显式分页符优先；没有分页符时，再按内容长度进行保守分页。

加入这套实现，是因为 Word 文档在真实写作环境中非常常见。与其要求作者先手工清理格式，不如让系统承担尽可能多的迁移工作。

### Vercel Blob

Vercel Blob 是生产媒体存储路径之一。

Vercel 的应用文件系统不适合作为长期上传目录。部署实例可能更换，本地写入也不会成为可靠的持久化数据。因此图片和视频需要离开应用运行目录。

Vercel Blob 与 Vercel 部署结合简单，适合作为默认的云端对象存储方案。

### 腾讯云 COS

腾讯云 COS 是另一条远程存储路径。

加入 COS，是为了支持：

- 中国大陆访问场景。
- 独立 CDN 或自定义域名。
- 更灵活的对象存储控制。
- 大文件从浏览器直接上传到存储服务。

后台会先向服务端请求短期签名，再由浏览器直接 `PUT` 到 COS。这样视频数据不需要完整经过 Next.js 函数，能够减少服务端内存、带宽和请求体限制带来的压力。

### 本地、Blob 与 COS 的存储选择

`lib/storage.ts` 会按环境自动选择：

```txt
已配置 Tencent COS -> 使用 COS
否则已配置 Vercel Blob -> 使用 Blob
否则处于本地开发 -> 写入 public/uploads
否则处于生产环境 -> 拒绝上传并提示配置远程存储
```

这个顺序让本地开发保持简单，同时避免生产环境误把上传文件写进临时目录。

### Nodemailer 与 SMTP

Nodemailer 负责：

- Orask 新留言通知。
- 后台回复访客邮件。

我没有把邮件作为留言的唯一存储，因为邮件发送依赖网络和 SMTP 服务商。正确的顺序是：

```txt
先保存数据库
  -> 再尝试发送邮件
  -> 邮件失败也保留内容
```

回复流程同样会先创建 `pending` 记录，再更新为 `sent` 或 `failed`。这使邮件成为可追踪的业务动作，而不是一次不可见的函数调用。

### HMAC Session 与 HttpOnly Cookie

后台是单创作者使用，因此没有引入多租户用户系统或第三方 OAuth。

登录成功后，服务端会生成带过期时间的 Session Payload，并使用 HMAC SHA-256 签名。浏览器通过 `httpOnly`、`sameSite=lax` Cookie 保存 Session；生产环境同时启用 `secure`。

选择这套轻量认证，是因为当前需求只有一个管理员身份。它比完整用户系统更容易审计，也避免为不存在的角色、注册和账户恢复需求增加复杂度。

### PBKDF2 管理员密码哈希

管理员密码支持使用 PBKDF2 SHA-256、随机盐和高迭代次数生成哈希。

这样可以避免在本地 `.env` 中长期保留明文密码。验证时使用 timing-safe 比较，降低普通字符串比较带来的时序差异。

需要注意：后台修改密码当前会写入项目运行目录中的 `.env`。这适合本地或拥有持久磁盘的服务器；在 Vercel 等 Serverless 环境中，运行时文件写入不是可靠的持久配置方式，生产密码应通过部署平台环境变量维护。

### GitHub REST API

Lab 项目可以保存 GitHub 仓库地址。系统支持识别：

- HTTPS 仓库地址。
- SSH 仓库地址。
- `owner/repo` 简写。

服务端调用 GitHub REST API 获取仓库创建时间和最近推送时间。可选的 `GITHUB_TOKEN` 用于提高请求限额。

加入这项技术，是为了让实验项目呈现真实的迭代时间，而不只是一张手工填写的静态卡片。

### 简体与繁体中文切换

公开站点支持简体中文与繁体中文显示。

当前实现没有为每个组件维护两套文案文件，而是使用：

- 词组映射。
- 字符映射。
- `MutationObserver`。
- 文本节点与可翻译属性遍历。
- `localStorage` 偏好保存。

它会跳过代码、链接、路径、SVG 和明确标记为不翻译的区域，尽量保护技术内容。

我加入这套能力，是为了在不复制全部内容数据的前提下，让中文访客可以选择更熟悉的字形体系。它是一种面向当前站点规模的轻量方案，不等同于完整多语言 CMS。

### 浅色、深色与跟随系统主题

主题支持：

- Light。
- Dark。
- System。

主题偏好保存在 `localStorage`。`ThemeScript` 会在 React 水合前尽早设置根元素 class，减少页面先亮后暗的闪烁。

深色主题不是简单反转颜色，而是重新定义纸张、墨色、分隔线与强调色，使前台在暗色环境下仍然保留“档案”而不是“霓虹控制台”的气质。

### IntersectionObserver

IntersectionObserver 被用于：

- 滚动显现卡片。
- 画廊视频进入视口播放。
- 画廊 Hero 动画可见性控制。

选择它是为了让动效和媒体播放与真实可见区域关联，避免持续监听滚动位置，也避免不可见内容一直运行动画。

### MutationObserver

MutationObserver 被用于：

- 简繁文字转换。
- 等待 Splash Screen 结束后启动部分页面动画。
- 处理动态插入的文本和属性。

它让语言切换与入场动效能够适应 React 后续渲染的节点，而不只处理首次加载时已经存在的 DOM。

### React Portal

画廊灯箱使用 `createPortal` 挂载到 `document.body`。

这样做可以绕开卡片层级、变换上下文和父级 overflow 对弹窗的限制，使灯箱真正覆盖整个页面，并更容易控制页面滚动锁定。

### 自定义光标与倾斜卡片

桌面端细指针设备会启用自定义光标。触屏、粗指针和小屏设备会自动回退到系统交互，不强行模拟桌面体验。

卡片会根据指针位置产生轻微倾斜，媒体层和文字层使用不同深度。加入这些效果，是为了让档案页面保持克制的同时，仍然拥有一点可被感知的物理反馈。

### Reduced Motion

项目为 `prefers-reduced-motion: reduce` 提供系统级降级。

在用户明确要求减少动态时，页面会关闭或简化：

- 页面进入动画。
- 滚动显现。
- CRT 扫描与闪烁。
- 打字效果。
- 画廊曝光与拼贴。
- Orask 手写与撕纸。
- 卡片倾斜。
- 标题书写动画。

加入这项支持不是附加装饰，而是承认动效对不同用户可能意味着不同负担。设计表达应当可以被关闭，而不影响内容访问。

### Vercel

项目面向 Vercel 部署：

- Next.js 原生运行。
- 环境变量管理。
- Vercel Blob。
- Prisma 构建前生成。
- PostgreSQL 外部连接。

`prebuild` 和 `postinstall` 都会执行 `prisma generate`，用于确保构建环境中 Prisma Client 可用。

## 审美设计理念

### 核心命题：一座仍在使用的档案室

DELEE 的视觉目标不是复刻某个现成的博客模板，也不是把页面做成精致但无生命的作品集。

我想要的是一种“仍在使用的档案室”：

- 内容已经被整理，但不是彻底封存。
- 页面有秩序，但保留手工痕迹。
- 视觉足够安静，可以阅读长文本。
- 交互偶尔显露陌生感，让网站不至于被迅速遗忘。
- 不同内容媒介拥有不同房间，但仍属于同一座建筑。

这种设计判断决定了网站的颜色、字体、留白、动效和页面隐喻。

### 纸张与墨色，而不是纯白与纯黑

浅色主题使用偏暖的纸张色和墨色，而不是高对比的纯白背景与纯黑文字。

原因有两个：

1. 文章、图片和便笺都需要一个接近实体载体的背景。
2. 长时间阅读时，略带温度的中性色比绝对白色更柔和。

辅助色也没有使用高饱和科技蓝作为唯一品牌色，而是选择陶土、苔绿、蓝灰和金色。它们分别承担不同内容类型和状态提示，又能保持一种来自印刷、旧器物和自然颜料的综合色感。

深色主题则把“纸”转化为不同层级的深灰表面，把“墨”转化为温和的浅灰，而不是进入纯黑加霓虹的赛博风格。

### 排版优先于装饰

网站的主要视觉重量来自：

- 大标题。
- 字体对比。
- 行长控制。
- 内容层级。
- 留白。
- 边框与分隔线。

正文使用更克制的无衬线字体保证中文可读性，标题和重要内容使用衬线字体建立出版物与档案感。Lab 的时间信息和终端内容再切换到等宽字体，让技术语境自然出现。

文章正文把最大阅读宽度控制在约 `720px`，代码块和图片进一步收窄。这样做是为了防止桌面宽屏把段落拉得过长，也让图片、引用和代码在长文中拥有明确节奏。

### 克制与陌生感并存

如果页面只有克制，它可能变成没有记忆点的极简模板；如果页面只有陌生感，它又会妨碍阅读。

所以全站采用“两层结构”：

- 基础层保持清楚、稳定和可阅读。
- 局部交互层允许出现手写、曝光、扫描线、轻微倾斜和撕纸。

这些效果只在合适的内容语境中出现，不把每个按钮都做成表演。

### 每个分区拥有自己的媒介隐喻

#### 首页：时间索引

首页不模拟书封或海报，而是强调日期和最近进入档案的内容。日期是档案最自然的索引方式，也能直接表达“这个网站最近是否仍在更新”。

#### 文章：书写与文档

文章区的标题使用逐步书写、轻微不稳定和双层下划线效果。它不是为了模拟真实钢笔，而是让文字在进入页面时显得“刚刚被写下”。

文章卡片和合集仍然保持规整，因为阅读入口需要比装饰更清楚。

#### 画廊：曝光、蓝图与拼贴

画廊 Hero 在照片、蓝图和拼贴之间建立变化：

- 曝光代表影像被显现。
- 蓝图代表设计过程和结构。
- 拼贴代表视觉素材被重新组合。

这三种状态共同说明画廊不是静态相册，而是视觉作品从构思到成像的过程。

#### Lab：CRT 实验终端

Lab 使用老式 CRT 显示器作为核心隐喻：

- 扫描线。
- 屏幕弧面。
- 轻微闪烁。
- 信号漂移。
- 逐字输入。
- 等宽时间信息。

我选择 CRT，不是为了怀旧本身，而是因为 Lab 中的内容通常处于原型、调试和未完成状态。旧终端天然带有“正在运行、正在测试”的语义，比普通作品卡片更适合实验空间。

#### Orask：便笺与寄出动作

Orask 把抽象的反馈表单变成纸张：

- 左侧是可勾选的备忘录。
- 右侧是有装订孔和手写感的表单。
- 提交成功后纸张会被撕下。

这套隐喻让“提交”不只是按钮状态变化，而像把一张写好的纸真正交出去。

### 品牌资产不是附属图标

网站使用多组独立 SVG：

- 主品牌 Logo。
- 各导航入口 Logo。
- 文章、画廊、Lab 与 Orask 的章节标题。
- 自定义光标。
- 水印。

这些资产不是单纯重复文字，而是建立全站识别度。导航入口还拥有不同的悬停动作，让每个分区在很小的空间内显露自己的性格。

### 圆角的使用逻辑

前台大量使用圆角，但它并不试图模仿手机系统组件。

圆角主要用于：

- 内容卡片。
- 媒体边界。
- 过滤标签。
- 交互按钮。
- 纸张和显示器外壳。

它的作用是柔化档案系统可能带来的僵硬感。后台则减少复杂装饰，把圆角作为分组和可点击区域的识别手段。

### 动效服务于状态，不服务于炫技

全站动效大多对应真实状态：

- 页面进入。
- 内容进入视口。
- 视频变为可见。
- 语言切换。
- 标题被写出。
- Lab 信号接通。
- Orask 纸张进入或寄出。
- 灯箱打开和图片切换。

动效持续时间普遍较短，并使用自然减速曲线。所有主要动效都考虑 Reduced Motion，确保视觉表达不会成为访问门槛。

### 前台与后台的视觉分工

前台是内容空间，允许隐喻、节奏和情绪。

后台是操作空间，强调：

- 深色背景。
- 高信息密度。
- 清晰的公开/草稿状态。
- 稳定的表格和列表。
- 搜索、筛选和批量操作。
- 上传与保存反馈。

两者共享项目结构和数据，但不共享同一套表面装饰。这种分工让设计更接近真实使用，而不是为了所谓“统一”牺牲工作效率。

## 内容与数据模型

Prisma Schema 当前包含以下核心模型。

### `Article`

保存：

- 标题与唯一 slug。
- 日期。
- 分类与标签。
- 摘要与封面。
- Markdown 正文。
- 公开状态。
- 置顶状态。
- 创建和更新时间。

### `ArticleCollection`

保存：

- 合集标题与唯一 slug。
- 摘要与封面。
- 公开状态与置顶状态。
- 排序值。
- 合集与文章的关系。

### `ArticleCollectionItem`

作为合集和文章之间的关联模型，负责：

- 防止同一文章在同一合集中重复。
- 保存合集内顺序。
- 在合集或文章删除时级联清理关系。

### `GalleryItem`

保存：

- 标题与唯一 slug。
- 图片或视频类型。
- 主媒体地址。
- 多媒体地址集合。
- 视频缩略图。
- 日期、描述、标签与分类。
- 公开和置顶状态。
- 水印显示偏好。

### `LabProject`

保存：

- 标题、slug、简介与详细说明。
- 分类键和显示名称。
- 项目状态。
- 封面。
- 打开模式。
- 嵌入地址、外部地址或内部路径。
- GitHub 仓库地址。
- 排序和公开状态。

### `OraskMessage`

保存：

- 访客名字与邮箱。
- 主题和正文。
- 来源页面。
- 已读状态。
- 最后回复时间。
- 创建时间。

### `OraskReply`

保存：

- 所属留言。
- 发件人与收件人。
- 邮件主题与正文。
- `pending`、`sent` 或 `failed` 状态。
- 错误原因。
- 发送时间。

### `SiteSetting`

保存小型站点级配置。当前用于保存 Orask 回复工作台的发件邮箱。

SMTP 用户名和授权码不会写入该表，仍由服务端环境变量管理。

### `DailyUpdate`

Schema 中仍保留 `DailyUpdate` 模型和相关迁移、Seed、管理 API。

但当前首页的主路径已经改为从已发布文章与画廊作品自动聚合更新，后台“每日更新”页面也以查看自动聚合结果为主。保留该模型是为了兼容已有数据和旧接口，不能把它误解为当前首页必须手工维护的内容来源。

## 内容生产工作流

### 手工创建文章

```txt
进入 /dashboard/articles
  -> 新建文章
  -> 填写标题、slug、分类、标签、摘要和封面
  -> 在 Markdown 编辑器中写作并实时预览
  -> 保存草稿或公开
  -> 前台文章列表与首页自动读取
```

### 导入 Markdown

单个 Markdown 文件适合：

- 图片已经是远程 URL。
- 图片已经位于公开上传路径。
- 内容不依赖本地相对图片。

系统会解析 front matter，并自动推断缺失标题、日期、分类和 slug。

### 导入 Markdown ZIP

ZIP 适合文章与本地图片一起迁移：

```txt
article.md
images/
  cover.png
  figure-1.jpg
```

系统会：

1. 找到主要 Markdown 文件。
2. 解析正文中的相对图片路径。
3. 在 ZIP 中找到对应图片。
4. 上传图片。
5. 重写 Markdown URL。
6. 创建文章。

### 导入 DOCX

DOCX 导入会读取文档内部结构并转换为 Markdown。图片会进入统一存储链路，分页符会保留为内部标记。

导入结果默认可以先作为草稿检查，再决定公开，避免复杂 Word 文档未经确认直接进入前台。

### 批量创建文章合集

文章后台支持为一个合集批量上传 `.md`、`.markdown`、`.zip` 和 `.docx`。

文件会依次处理，并显示每个文件的上传状态。成功导入的文章会自动加入当前合集，同时保留独立文章记录。

### 上传画廊媒体

后台根据存储配置选择 COS、Blob 或本地目录。图片和视频会经过扩展名、MIME 与大小限制校验。

画廊作品可以保存多个媒体地址，并单独决定是否显示展示层水印。

### 发布 Lab

Lab 可以先保存为隐藏项目，之后选择：

- 单独公开。
- 批量公开已选项目。
- 一次公开全部未公开项目。

如果填写 GitHub 仓库，前台会同步仓库时间信息。

### 处理 Orask

```txt
访客提交
  -> Zod 校验
  -> 保存 OraskMessage
  -> 尝试发送通知邮件
  -> 后台查看
  -> 回复工作台创建 pending 回复
  -> SMTP 发送
  -> 更新 sent / failed
  -> 写入 repliedAt
```

## 后台能力

后台入口：

```txt
/login
```

登录后：

```txt
/dashboard
```

回复工作台：

```txt
/login/ans
```

后台当前包括：

- 仪表盘统计。
- 已发布文章与草稿数量。
- 画廊和 Lab 数量。
- 未读 Orask 数量。
- 最近内容和最近留言。
- 文章搜索、新建、编辑、删除、置顶和公开。
- 文章合集创建、排序、批量导入和发布。
- Markdown 实时预览。
- Markdown、ZIP 与 DOCX 导入。
- 图片、视频和视频封面上传。
- 画廊分类、标签、多媒体、水印、置顶和公开管理。
- Lab 分类、状态、排序、GitHub 仓库和三种打开方式。
- 未公开内容批量发布。
- 默认封面配置。
- Orask 搜索、已读切换和删除。
- Orask 邮件回复与历史记录。
- 管理员密码修改。

## API 结构

### 公开 API

```txt
GET  /api/public/updates
GET  /api/public/articles
GET  /api/public/articles/[slug]
GET  /api/public/gallery
GET  /api/public/lab
POST /api/orask
```

公开读取只返回符合公开条件的内容。

### 认证 API

```txt
POST /api/admin/login
POST /api/admin/logout
GET  /api/admin/me
PATCH /api/admin/password
```

### 内容管理 API

```txt
/api/admin/articles
/api/admin/articles/[id]
/api/admin/articles/bulk

/api/admin/article-collections
/api/admin/article-collections/[id]

/api/admin/gallery
/api/admin/gallery/[id]
/api/admin/gallery/bulk

/api/admin/lab
/api/admin/lab/[id]
/api/admin/lab/bulk

/api/admin/updates
/api/admin/updates/[id]

/api/admin/default-covers
```

### 文章导入 API

```txt
POST /api/admin/articles/import
POST /api/admin/articles/import-markdown
POST /api/admin/articles/import-zip
POST /api/admin/articles/import-docx
```

### 上传 API

```txt
POST /api/admin/upload/image
POST /api/admin/upload/video
POST /api/admin/upload/cos
POST /api/admin/upload/blob
```

### Orask 管理 API

```txt
/api/admin/orask
/api/admin/orask/[id]
POST  /api/admin/orask/[id]/reply
/api/admin/orask-reply-settings
```

所有 `/api/admin/*` 接口都要求有效管理员 Session。

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 创建环境变量

Windows PowerShell：

```powershell
Copy-Item .env.example .env.local
```

macOS / Linux：

```bash
cp .env.example .env.local
```

根据实际数据库、后台账号、SMTP 和存储服务修改配置。

### 3. 生成 Prisma Client

```bash
npm run db:generate
```

### 4. 同步或迁移数据库

本地快速同步：

```bash
npm run db:push
```

使用迁移开发：

```bash
npm run db:migrate
```

### 5. 可选：写入示例数据

```bash
npm run db:seed
```

### 6. 启动开发服务器

```bash
npm run dev
```

访问：

```txt
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/login/ans
```

## 环境变量

### 数据库

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
```

### 管理员认证

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
```

修改密码后也可以使用：

```env
ADMIN_PASSWORD_HASH=pbkdf2_sha256$...
```

`ADMIN_PASSWORD_HASH` 存在时优先于 `ADMIN_PASSWORD`。

### 站点地址

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 上传限制

```env
MAX_IMAGE_UPLOAD_MB=20
MAX_VIDEO_UPLOAD_MB=100
```

允许的主要格式：

- 图片：JPG、JPEG、PNG、WebP、GIF、SVG。
- 视频：MP4、WebM、MOV。

### SMTP 与 Orask

```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@163.com
SMTP_PASS=your-smtp-authorization-code
ORASK_RECEIVER_EMAIL=receiver@example.com
```

`SMTP_USER` 和 `SMTP_PASS` 同时用于：

- 新 Orask 留言通知。
- 后台回复访客。

回复工作台的展示发件地址会保存到 `SiteSetting`。为提高 SMTP 服务商兼容性，建议它与 `SMTP_USER` 保持一致。

### GitHub

```env
GITHUB_TOKEN=
```

该变量可选，用于提高 GitHub API 请求限额。

### Vercel Blob

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token
```

### 腾讯云 COS

```env
TENCENT_COS_SECRET_ID=your-secret-id
TENCENT_COS_SECRET_KEY=your-secret-key
TENCENT_COS_BUCKET=your-bucket
TENCENT_COS_REGION=ap-shanghai
TENCENT_COS_PUBLIC_URL=https://your-cdn-or-bucket-domain
```

COS 需要为网站域名配置允许 `PUT` 的 CORS 规则，否则浏览器直传会被阻止。

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
npm run db:deploy
npm run db:seed
npm run db:studio
```

## 部署说明

推荐部署到 Vercel，并使用外部 PostgreSQL。

构建命令：

```bash
npm run build
```

生产环境至少需要：

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"

ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret

NEXT_PUBLIC_SITE_URL=https://your-domain.example

SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-authorization-code
ORASK_RECEIVER_EMAIL=receiver@example.com
```

媒体上传还需要配置以下至少一项：

- Vercel Blob。
- 腾讯云 COS。

部署新版本前执行数据库迁移：

```bash
npm run db:deploy
```

生产部署需要特别注意：

- 不要依赖 `public/uploads` 保存长期媒体。
- 不要依赖 Serverless 运行目录持久保存后台修改后的密码。
- PostgreSQL 连接需要允许部署环境访问。
- COS 浏览器直传需要正确 CORS。
- SMTP 服务商可能要求发件地址与认证账户一致。
- 使用 GitHub 元数据时建议配置 `GITHUB_TOKEN`。

## 项目结构

```txt
app/
  前台页面、后台页面与 Route Handlers

components/
  前台公共组件、动效组件、媒体组件

components/admin/
  后台管理器、上传控件、回复工作台

content/
  站点文案与仍保留的内容示例

data/
  分类定义、类型元数据与回退示例数据

lib/
  Prisma、认证、校验、存储、邮件、导入、序列化与工具函数

prisma/
  Schema、迁移与 Seed

public/
  Logo、章节标题、光标、水印、默认封面和开发资源

scripts/
  数据迁移与项目初始化脚本
```

关键文件：

```txt
app/globals.css
  全站主题、视觉系统与动效

lib/public-content.ts
  首页、画廊与 Lab 的公开数据读取

lib/articles.ts
  文章和合集公开查询

lib/storage.ts
  本地、Blob 与 COS 存储选择

lib/docx-import.ts
  DOCX / OOXML 转换

lib/zip-import.ts
  Markdown ZIP 与本地图片导入

lib/admin-auth.ts
  HMAC Session 与 Cookie

lib/mail.ts
  Orask 通知和回复邮件

prisma/schema.prisma
  数据模型
```

## 当前实现说明

### 数据库是当前公开内容的主来源

文章、画廊、Lab 和 Orask 的主要运行数据来自 PostgreSQL。

`content/articles` 与 `data/*` 中仍保留示例或早期内容结构，但当前公开文章列表和详情不会把这些静态文件作为主读取路径。

### 首页更新已经自动化

当前首页从公开文章和画廊作品自动生成更新，不需要手工为每次发布再创建一条首页动态。

`DailyUpdate` 数据表和 API 仍存在，主要用于兼容旧结构。

### 已安装但不是当前主链路的 Markdown 包

`remark` 与 `remark-html` 仍存在于依赖中，但当前公开文章渲染主链路是：

```txt
react-markdown
  + remark-gfm
  + rehype-slug
  + rehype-sanitize
```

后续清理依赖时可以重新确认旧脚本是否仍需要它们。

### 简繁转换是轻量站点方案

当前简繁切换基于 DOM 文本转换，不是完整的国际化路由，也不会为数据库保存两份正文。

如果未来加入英文、日文或需要人工校对的繁体文案，应迁移到真正的 i18n 内容模型，而不是继续扩大字符映射。

### 管理员系统面向单人使用

当前没有：

- 注册。
- 多管理员。
- 角色权限。
- 找回密码。
- OAuth。

这是有意控制范围的结果。如果网站以后进入团队协作阶段，认证和权限系统需要单独升级。

## 验证与维护

提交或部署前建议运行：

```bash
npm run typecheck
npm run build
```

数据库结构有变化时：

```bash
npm run db:migrate
```

部署已有迁移时：

```bash
npm run db:deploy
```

建议重点人工检查：

- 首页当天无内容时是否正确回退。
- 文章分类与合集是否只展示公开内容。
- Markdown 表格、任务列表、图片和外链。
- DOCX 分页与图片。
- 画廊多图切换和视频播放。
- 图片水印开关。
- Lab 三种打开方式。
- GitHub 时间同步失败时的降级。
- 简繁切换后的动态内容。
- Light、Dark、System 主题。
- Reduced Motion。
- Orask 邮件失败时留言是否仍保存。
- Orask 回复失败记录是否保留。
- COS 与 Blob 上传。
- 移动端导航、灯箱和后台表单。

---

DELEE 的目标不是在某个时间点“做完一个个人网站”，而是让网站本身成为创作习惯的一部分：内容可以进入、被组织、被观看、被回应，也可以继续修改和生长。
