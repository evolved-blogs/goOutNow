-- CreateTable
CREATE TABLE "feedbacks" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "activityRating" INTEGER NOT NULL,
    "organizerRating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feedbacks_postId_idx" ON "feedbacks"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "feedbacks_postId_fromUserId_key" ON "feedbacks"("postId", "fromUserId");

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
