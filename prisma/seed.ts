import { prisma } from "../lib/db";

const asDate = (date: string) => new Date(`${date}T00:00:00.000+08:00`);
const tags = (items: string[]) => JSON.stringify(items);

async function seedDailyUpdates() {
  await prisma.dailyUpdate.upsert({
    where: { id: "daily-2026-05-30-article" },
    update: {
      title: "个人档案的第一则札记",
      type: "article",
      date: asDate("2026-05-30"),
      description:
        "关于为什么需要一个能同时容纳文章、视觉、视频和未完成想法的个人创作档案。",
      cover: "/images/archive-fragment.svg",
      link: "/articles/first-article",
      published: true
    },
    create: {
      id: "daily-2026-05-30-article",
      title: "个人档案的第一则札记",
      type: "article",
      date: asDate("2026-05-30"),
      description:
        "关于为什么需要一个能同时容纳文章、视觉、视频和未完成想法的个人创作档案。",
      cover: "/images/archive-fragment.svg",
      link: "/articles/first-article",
      published: true
    }
  });

  await prisma.dailyUpdate.upsert({
    where: { id: "daily-2026-05-30-image" },
    update: {
      title: "铬色花园海报",
      type: "image",
      date: asDate("2026-05-30"),
      description:
        "一次用硬边框、暖色块和版式秩序搭建的视觉练习，作为画廊第一组占位作品。",
      cover: "/images/chrome-garden.svg",
      link: "/gallery#chrome-garden",
      published: true
    },
    create: {
      id: "daily-2026-05-30-image",
      title: "铬色花园海报",
      type: "image",
      date: asDate("2026-05-30"),
      description:
        "一次用硬边框、暖色块和版式秩序搭建的视觉练习，作为画廊第一组占位作品。",
      cover: "/images/chrome-garden.svg",
      link: "/gallery#chrome-garden",
      published: true
    }
  });

  await prisma.dailyUpdate.upsert({
    where: { id: "daily-2026-05-30-video" },
    update: {
      title: "静音循环测试",
      type: "video",
      date: asDate("2026-05-30"),
      description:
        "让视频作品直接在画廊网格中动起来，同时保留轻量加载策略。",
      cover: "/images/video-poster.svg",
      link: "/gallery#silent-motion",
      published: true
    },
    create: {
      id: "daily-2026-05-30-video",
      title: "静音循环测试",
      type: "video",
      date: asDate("2026-05-30"),
      description:
        "让视频作品直接在画廊网格中动起来，同时保留轻量加载策略。",
      cover: "/images/video-poster.svg",
      link: "/gallery#silent-motion",
      published: true
    }
  });
}

async function seedArticles() {
  await prisma.article.upsert({
    where: { slug: "first-article" },
    update: {
      title: "个人档案的第一则札记",
      date: asDate("2026-05-30"),
      category: "随笔",
      tags: tags(["个人", "档案", "创作"]),
      summary:
        "关于为什么需要一个能同时容纳文章、视觉、视频和未完成想法的个人创作档案。",
      cover: "/images/archive-fragment.svg",
      content:
        "这里是从数据库 seed 进入的第一篇文章。后续 Creator Admin 会把这类内容写入 Article 表，前台再逐步从数据库读取。",
      published: true
    },
    create: {
      title: "个人档案的第一则札记",
      slug: "first-article",
      date: asDate("2026-05-30"),
      category: "随笔",
      tags: tags(["个人", "档案", "创作"]),
      summary:
        "关于为什么需要一个能同时容纳文章、视觉、视频和未完成想法的个人创作档案。",
      cover: "/images/archive-fragment.svg",
      content:
        "这里是从数据库 seed 进入的第一篇文章。后续 Creator Admin 会把这类内容写入 Article 表，前台再逐步从数据库读取。",
      published: true
    }
  });

  await prisma.article.upsert({
    where: { slug: "second-article" },
    update: {
      title: "关于克制和陌生感",
      date: asDate("2026-05-29"),
      category: "观察",
      tags: tags(["排版", "日常", "视觉"]),
      summary:
        "页面需要足够安静，才能让内容被读完；也需要一点不寻常，才能被记住。",
      cover: "/images/layout-experiment.svg",
      content:
        "这是一条用于数据库初始化的示例文本。它不会替换现有 MDX 文件，只是为后台数据流预留内容。",
      published: true
    },
    create: {
      title: "关于克制和陌生感",
      slug: "second-article",
      date: asDate("2026-05-29"),
      category: "观察",
      tags: tags(["排版", "日常", "视觉"]),
      summary:
        "页面需要足够安静，才能让内容被读完；也需要一点不寻常，才能被记住。",
      cover: "/images/layout-experiment.svg",
      content:
        "这是一条用于数据库初始化的示例文本。它不会替换现有 MDX 文件，只是为后台数据流预留内容。",
      published: true
    }
  });
}

async function seedGalleryItems() {
  await prisma.galleryItem.upsert({
    where: { slug: "chrome-garden" },
    update: {
      title: "铬色花园海报",
      type: "image",
      src: "/images/chrome-garden.svg",
      thumbnail: null,
      date: asDate("2026-05-30"),
      description:
        "以暖色块、细线网格和强排版构成的海报系统，用作个人档案的视觉起点。",
      tags: tags(["海报", "档案", "视觉"]),
      category: "poster",
      published: true
    },
    create: {
      title: "铬色花园海报",
      slug: "chrome-garden",
      type: "image",
      src: "/images/chrome-garden.svg",
      date: asDate("2026-05-30"),
      description:
        "以暖色块、细线网格和强排版构成的海报系统，用作个人档案的视觉起点。",
      tags: tags(["海报", "档案", "视觉"]),
      category: "poster",
      published: true
    }
  });

  await prisma.galleryItem.upsert({
    where: { slug: "silent-motion" },
    update: {
      title: "静音循环测试",
      type: "video",
      src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      thumbnail: "/images/video-poster.svg",
      date: asDate("2026-05-30"),
      description:
        "一个用于验证画廊视频体验的轻量示例：静音、循环、进入视口后播放。",
      tags: tags(["视频", "循环", "动态"]),
      category: "video",
      published: true
    },
    create: {
      title: "静音循环测试",
      slug: "silent-motion",
      type: "video",
      src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      thumbnail: "/images/video-poster.svg",
      date: asDate("2026-05-30"),
      description:
        "一个用于验证画廊视频体验的轻量示例：静音、循环、进入视口后播放。",
      tags: tags(["视频", "循环", "动态"]),
      category: "video",
      published: true
    }
  });
}

async function seedOraskMessage() {
  await prisma.oraskMessage.upsert({
    where: { id: "orask-seed-message" },
    update: {
      name: "示例访客",
      email: "visitor@example.com",
      subject: "Creator Admin 初始化留言",
      message:
        "这是一条 seed 留言，用来确认 OraskMessage 表可以保存访客提交内容。",
      source: "/orask",
      read: false
    },
    create: {
      id: "orask-seed-message",
      name: "示例访客",
      email: "visitor@example.com",
      subject: "Creator Admin 初始化留言",
      message:
        "这是一条 seed 留言，用来确认 OraskMessage 表可以保存访客提交内容。",
      source: "/orask",
      read: false
    }
  });
}

async function seedLabProjects() {
  await prisma.labProject.upsert({
    where: { slug: "numeric-tower" },
    update: {
      title: "数值高塔",
      summary:
        "一个由攻击、防御、暴击、吸血和随机奖励构成的极简数值爬塔实验。",
      description: null,
      categoryKey: "game",
      category: "游戏原型",
      status: "原型",
      coverImage: null,
      openMode: "embed",
      embedUrl: null,
      externalUrl: null,
      internalPath: null,
      sortOrder: 1,
      isPublished: true
    },
    create: {
      title: "数值高塔",
      slug: "numeric-tower",
      summary:
        "一个由攻击、防御、暴击、吸血和随机奖励构成的极简数值爬塔实验。",
      description: null,
      categoryKey: "game",
      category: "游戏原型",
      status: "原型",
      coverImage: null,
      openMode: "embed",
      embedUrl: null,
      externalUrl: null,
      internalPath: null,
      sortOrder: 1,
      isPublished: true
    }
  });
}

async function main() {
  await seedDailyUpdates();
  await seedArticles();
  await seedGalleryItems();
  await seedOraskMessage();
  await seedLabProjects();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
