import type { UpdateType } from "@/data/updates";
import type { GalleryCategory, GalleryItemType } from "@/data/gallery";

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
