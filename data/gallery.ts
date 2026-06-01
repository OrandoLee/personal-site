import { uiText } from "@/content/uiText";

export type GalleryItemType = "image" | "video";

export type GalleryCategory =
  | "image"
  | "video"
  | "poster"
  | "animation"
  | "experiment";

export type GalleryItem = {
  id: string;
  title: string;
  type: GalleryItemType;
  src: string;
  images?: string[];
  thumbnail?: string;
  date: string;
  description: string;
  tags: string[];
  category: GalleryCategory;
  featured?: boolean;
  showWatermark?: boolean;
};

export const galleryCategoryLabels: Record<GalleryCategory | "all", string> = {
  all: uiText.galleryCategories.all,
  image: uiText.galleryCategories.image,
  video: uiText.galleryCategories.video,
  poster: uiText.galleryCategories.poster,
  animation: uiText.galleryCategories.animation,
  experiment: uiText.galleryCategories.experiment
};

export const galleryItems: GalleryItem[] = [
  {
    id: "chrome-garden",
    title: "铬色花园海报",
    type: "image",
    src: "/images/chrome-garden.svg",
    date: "2026-05-30",
    description:
      "以暖色块、细线网格和强排版构成的海报系统，用作个人档案的视觉起点。",
    tags: ["海报", "档案", "视觉"],
    category: "poster"
  },
  {
    id: "silent-motion",
    title: "静音循环测试",
    type: "video",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    thumbnail: "/images/video-poster.svg",
    date: "2026-05-30",
    description:
      "一个用于验证画廊视频体验的轻量示例：静音、循环、进入视口后播放。",
    tags: ["视频", "循环", "动态"],
    category: "video"
  },
  {
    id: "archive-fragment",
    title: "档案切片",
    type: "image",
    src: "/images/archive-fragment.svg",
    date: "2026-05-29",
    description:
      "为草稿、扫描、截图和未完成视觉实验准备的图像占位。",
    tags: ["图片", "日记", "纹理"],
    category: "image"
  },
  {
    id: "motion-room",
    title: "动态房间",
    type: "video",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
    thumbnail: "/images/motion-room.svg",
    date: "2026-05-28",
    description:
      "第二个动态样片，后续可以替换成 public/videos 目录中的真实视频作品。",
    tags: ["动画", "练习"],
    category: "animation"
  },
  {
    id: "layout-experiment",
    title: "版式实验 01",
    type: "image",
    src: "/images/layout-experiment.svg",
    date: "2026-05-27",
    description:
      "围绕卡片、标签、说明文字和画廊间距做的一次版式练习。",
    tags: ["实验", "网格", "排版"],
    category: "experiment"
  }
];
