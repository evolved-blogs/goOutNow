-- CreateTable
CREATE TABLE "global_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "global_messages_createdAt_idx" ON "global_messages"("createdAt");
