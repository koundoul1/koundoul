-- Add missing columns to subscription_plans (tables already exist)
SET search_path TO public;

ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS "displayName" TEXT NOT NULL DEFAULT '';
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS "interval" TEXT NOT NULL DEFAULT 'monthly';
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;
