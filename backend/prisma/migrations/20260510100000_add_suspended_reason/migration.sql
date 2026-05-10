-- Add suspended reason for admin user suspension
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "suspendedReason" TEXT;
