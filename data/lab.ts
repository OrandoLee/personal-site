export const labCategoryKeys = [
  "game",
  "interaction",
  "visual",
  "tech",
  "other"
] as const;

export type LabCategoryKey = (typeof labCategoryKeys)[number];
export type LabCategoryFilterKey = LabCategoryKey | "all";
export type LabOpenMode = "embed" | "external" | "internal";

export type LabCategory = {
  key: LabCategoryFilterKey;
  label: string;
  href: string;
  description: string;
};

export type LabProject = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description?: string;
  categoryKey: LabCategoryKey;
  category: string;
  status: string;
  coverImage?: string;
  openMode: LabOpenMode;
  embedUrl?: string;
  externalUrl?: string;
  internalPath?: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export const labCategories: LabCategory[] = [
  {
    key: "all",
    label: "全部项目",
    href: "/lab",
    description: "查看所有公开项目"
  },
  {
    key: "game",
    label: "游戏原型",
    href: "/lab?category=game",
    description: "数值系统、轻量玩法、互动规则"
  },
  {
    key: "interaction",
    label: "交互系统",
    href: "/lab?category=interaction",
    description: "网页交互、行为反馈、动态界面"
  },
  {
    key: "visual",
    label: "视觉系统",
    href: "/lab?category=visual",
    description: "图形实验、品牌变体、影像结构"
  },
  {
    key: "tech",
    label: "技术 Demo",
    href: "/lab?category=tech",
    description: "引擎、渲染、工具链与功能验证"
  },
  {
    key: "other",
    label: "其他项目",
    href: "/lab?category=other",
    description: "尚未归类的实验项目"
  }
];

export const labCategoryLabels = labCategories.reduce(
  (labels, category) => ({
    ...labels,
    [category.key]: category.label
  }),
  {} as Record<LabCategoryFilterKey, string>
);

export const fallbackLabProjects: LabProject[] = [
  {
    id: "lab-numeric-tower",
    title: "数值高塔",
    slug: "numeric-tower",
    summary: "一个由攻击、防御、暴击、吸血和随机奖励构成的极简数值爬塔实验。",
    description: undefined,
    categoryKey: "game",
    category: "游戏原型",
    status: "原型",
    coverImage: undefined,
    openMode: "embed",
    embedUrl: undefined,
    externalUrl: undefined,
    internalPath: undefined,
    sortOrder: 1,
    isPublished: true,
    createdAt: "2026-06-02T00:00:00.000Z",
    updatedAt: "2026-06-02T00:00:00.000Z"
  }
];

export function isLabCategoryKey(value: string): value is LabCategoryKey {
  return labCategoryKeys.includes(value as LabCategoryKey);
}

export function getLabCategory(key: string | undefined | null) {
  return labCategories.find((category) => category.key === key);
}
