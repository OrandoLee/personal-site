-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);
