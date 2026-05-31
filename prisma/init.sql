CREATE TABLE IF NOT EXISTS "DailyUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "cover" TEXT,
    "link" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "summary" TEXT NOT NULL,
    "cover" TEXT,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "GalleryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "thumbnail" TEXT,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "OraskMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "DailyUpdate_published_date_idx" ON "DailyUpdate"("published", "date");
CREATE INDEX IF NOT EXISTS "DailyUpdate_type_date_idx" ON "DailyUpdate"("type", "date");

CREATE UNIQUE INDEX IF NOT EXISTS "Article_slug_key" ON "Article"("slug");
CREATE INDEX IF NOT EXISTS "Article_published_date_idx" ON "Article"("published", "date");
CREATE INDEX IF NOT EXISTS "Article_category_date_idx" ON "Article"("category", "date");

CREATE UNIQUE INDEX IF NOT EXISTS "GalleryItem_slug_key" ON "GalleryItem"("slug");
CREATE INDEX IF NOT EXISTS "GalleryItem_published_date_idx" ON "GalleryItem"("published", "date");
CREATE INDEX IF NOT EXISTS "GalleryItem_category_date_idx" ON "GalleryItem"("category", "date");
CREATE INDEX IF NOT EXISTS "GalleryItem_type_date_idx" ON "GalleryItem"("type", "date");

CREATE INDEX IF NOT EXISTS "OraskMessage_read_createdAt_idx" ON "OraskMessage"("read", "createdAt");
CREATE INDEX IF NOT EXISTS "OraskMessage_email_createdAt_idx" ON "OraskMessage"("email", "createdAt");
