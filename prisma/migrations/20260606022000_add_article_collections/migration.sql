-- CreateTable
CREATE TABLE "ArticleCollection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "cover" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCollectionItem" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleCollectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCollection_slug_key" ON "ArticleCollection"("slug");

-- CreateIndex
CREATE INDEX "ArticleCollection_published_featured_sortOrder_idx" ON "ArticleCollection"("published", "featured", "sortOrder");

-- CreateIndex
CREATE INDEX "ArticleCollection_published_updatedAt_idx" ON "ArticleCollection"("published", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCollectionItem_collectionId_articleId_key" ON "ArticleCollectionItem"("collectionId", "articleId");

-- CreateIndex
CREATE INDEX "ArticleCollectionItem_collectionId_sortOrder_idx" ON "ArticleCollectionItem"("collectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "ArticleCollectionItem_articleId_idx" ON "ArticleCollectionItem"("articleId");

-- AddForeignKey
ALTER TABLE "ArticleCollectionItem" ADD CONSTRAINT "ArticleCollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "ArticleCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCollectionItem" ADD CONSTRAINT "ArticleCollectionItem_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
