import { uiText } from "@/content/uiText";

export type UpdateType = "article" | "image" | "video" | "note" | "project";

export type UpdateItem = {
  id: string;
  title: string;
  type: UpdateType;
  date: string;
  description: string;
  cover?: string;
  link?: string;
};

export const updateTypeMeta: Record<
  UpdateType,
  { label: string; tone: string; dot: string }
> = {
  article: {
    label: uiText.updateTypes.article,
    tone: "border-archive-gold text-archive-gold",
    dot: "bg-archive-gold"
  },
  image: {
    label: uiText.updateTypes.image,
    tone: "border-archive-blue text-archive-blue",
    dot: "bg-archive-blue"
  },
  video: {
    label: uiText.updateTypes.video,
    tone: "border-archive-clay text-archive-clay",
    dot: "bg-archive-clay"
  },
  note: {
    label: uiText.updateTypes.note,
    tone: "border-archive-line text-archive-muted",
    dot: "bg-archive-muted"
  },
  project: {
    label: uiText.updateTypes.project,
    tone: "border-archive-moss text-archive-moss",
    dot: "bg-archive-moss"
  }
};

export const updates: UpdateItem[] = [
  {
    id: "daily-2026-05-30-article",
    title: "个人档案的第一则札记",
    type: "article",
    date: "2026-05-30",
    description:
      "关于为什么需要一个能同时容纳文章、视觉、视频和未完成想法的个人创作档案。",
    cover: "/images/archive-fragment.svg",
    link: "/articles/first-article"
  },
  {
    id: "daily-2026-05-30-image",
    title: "铬色花园海报",
    type: "image",
    date: "2026-05-30",
    description:
      "一次用硬边框、暖色块和版式秩序搭建的视觉练习，作为画廊第一组占位作品。",
    cover: "/images/chrome-garden.svg",
    link: "/gallery#chrome-garden"
  },
  {
    id: "daily-2026-05-30-video",
    title: "静音循环测试",
    type: "video",
    date: "2026-05-30",
    description:
      "让视频作品直接在画廊网格中动起来，同时保留轻量加载策略。",
    cover: "/images/video-poster.svg",
    link: "/gallery#silent-motion"
  },
  {
    id: "daily-2026-05-29-note",
    title: "关于克制和陌生感",
    type: "note",
    date: "2026-05-29",
    description:
      "页面需要足够安静，才能让内容被读完；也需要一点不寻常，才能被记住。",
    link: "/"
  },
  {
    id: "daily-2026-05-28-project",
    title: "Orask 访客入口",
    type: "project",
    date: "2026-05-28",
    description:
      "为建议、问题、合作想法和真实反馈保留一个独立入口。",
    link: "/orask"
  }
];
