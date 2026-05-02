-- CreateTable (generated manually — prisma migrate dev broken by shadow DB issue)
CREATE TABLE IF NOT EXISTS "solver_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "domain" TEXT,
    "solution" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "solver_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "solver_history_userId_createdAt_idx" ON "solver_history"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "solver_history" ADD CONSTRAINT "solver_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
