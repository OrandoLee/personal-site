CREATE TABLE "LabProject" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "categoryKey" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "coverImage" TEXT,
    "openMode" TEXT NOT NULL,
    "embedUrl" TEXT,
    "externalUrl" TEXT,
    "internalPath" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabProject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LabProject_slug_key" ON "LabProject"("slug");
CREATE INDEX "LabProject_isPublished_sortOrder_idx" ON "LabProject"("isPublished", "sortOrder");
CREATE INDEX "LabProject_categoryKey_isPublished_idx" ON "LabProject"("categoryKey", "isPublished");
CREATE INDEX "LabProject_updatedAt_idx" ON "LabProject"("updatedAt");
