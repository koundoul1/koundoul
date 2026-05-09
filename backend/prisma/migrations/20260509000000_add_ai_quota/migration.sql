-- Add aiCallsPerDay and maxChildren columns to subscription_plans
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "aiCallsPerDay" INTEGER NOT NULL DEFAULT 6;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "maxChildren" INTEGER NOT NULL DEFAULT 0;

-- CreateTable daily_ai_usage
CREATE TABLE IF NOT EXISTS "daily_ai_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex unique on (userId, date)
CREATE UNIQUE INDEX IF NOT EXISTS "daily_ai_usage_userId_date_key" ON "daily_ai_usage"("userId", "date");

-- CreateIndex for query performance
CREATE INDEX IF NOT EXISTS "daily_ai_usage_userId_date_idx" ON "daily_ai_usage"("userId", "date");

-- AddForeignKey
ALTER TABLE "daily_ai_usage" ADD CONSTRAINT "daily_ai_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
