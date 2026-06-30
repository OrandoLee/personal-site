-- AlterTable
ALTER TABLE "OraskMessage"
ADD COLUMN "repliedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "OraskReply" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OraskReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OraskMessage_repliedAt_createdAt_idx" ON "OraskMessage"("repliedAt", "createdAt");

-- CreateIndex
CREATE INDEX "OraskReply_messageId_createdAt_idx" ON "OraskReply"("messageId", "createdAt");

-- CreateIndex
CREATE INDEX "OraskReply_status_createdAt_idx" ON "OraskReply"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "OraskReply"
ADD CONSTRAINT "OraskReply_messageId_fkey"
FOREIGN KEY ("messageId") REFERENCES "OraskMessage"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
