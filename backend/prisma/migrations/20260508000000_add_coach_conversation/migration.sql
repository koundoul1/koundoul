-- CreateTable (generated manually — prisma migrate dev broken by shadow DB issue)
CREATE TABLE IF NOT EXISTS "coach_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "coach_conversations_userId_updatedAt_idx" ON "coach_conversations"("userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "coach_conversations" ADD CONSTRAINT "coach_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
