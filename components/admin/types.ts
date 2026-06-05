import type { UpdateType } from "@/data/updates";
import type { GalleryCategory, GalleryItemType } from "@/data/gallery";
import type { LabCategoryKey, LabOpenMode } from "@/data/lab";

export type ApiResult<T> = {
  ok?: boolean;
  data?: T;
  message?: string;
};

export type AdminDailyUpdate = {
  id: string;
  title: string;
  type: UpdateType;
  date: string;
  description: string;
  cover?: string;
  link?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminArticle = {
  id: string;
  title: string;
  slug: string;
  date: string;
  category: string;
  tags: string[];
  summary: string;
  cover?: string;
  content: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminArticleCollection = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  cover?: string;
  published: boolean;
  featured: boolean;
  sortOrder: number;
  articles: AdminArticle[];
  articleIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type AdminGalleryItem = {
  id: string;
  title: string;
  slug: string;
  type: GalleryItemType;
  src: string;
  images: string[];
  thumbnail?: string;
  date: string;
  description: string;
  tags: string[];
  category: GalleryCategory;
  published: boolean;
  featured: boolean;
  showWatermark: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminLabProject = {
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

export type AdminOraskMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  source: string | null;
  read: boolean;
  createdAt: string;
};
