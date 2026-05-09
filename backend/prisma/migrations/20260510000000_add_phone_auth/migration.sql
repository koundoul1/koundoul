-- Add phone authentication fields to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pinHash" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "loginAttemptsCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pendingParentPhone" TEXT;

-- Conditional unique index: allows multiple NULLs
CREATE UNIQUE INDEX IF NOT EXISTS "users_phoneNumber_key" ON "users"("phoneNumber") WHERE "phoneNumber" IS NOT NULL;

-- Index for family matching lookup
CREATE INDEX IF NOT EXISTS "users_pendingParentPhone_idx" ON "users"("pendingParentPhone") WHERE "pendingParentPhone" IS NOT NULL;
