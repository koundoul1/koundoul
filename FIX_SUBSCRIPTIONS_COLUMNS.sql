-- ========================================
-- FIX: Corriger les colonnes subscriptions et subscription_plans
-- À exécuter dans Supabase SQL Editor
-- ========================================

-- 1. Vérifier et corriger subscription_plans
-- Renommer created_at en createdAt si nécessaire, ou créer la colonne si elle n'existe pas
DO $$ 
BEGIN
  -- Vérifier si createdAt existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' AND column_name = 'createdAt'
  ) THEN
    -- Si created_at existe, le renommer
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'subscription_plans' AND column_name = 'created_at'
    ) THEN
      ALTER TABLE subscription_plans RENAME COLUMN created_at TO "createdAt";
      ALTER TABLE subscription_plans RENAME COLUMN updated_at TO "updatedAt";
      ALTER TABLE subscription_plans RENAME COLUMN is_active TO "isActive";
    ELSE
      -- Sinon, créer les colonnes
      ALTER TABLE subscription_plans ADD COLUMN "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE subscription_plans ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- 2. Vérifier et corriger subscriptions
-- Renommer user_id en userId si nécessaire
DO $$ 
BEGIN
  -- Vérifier si userId existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'userId'
  ) THEN
    -- Si user_id existe, le renommer
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'subscriptions' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE subscriptions RENAME COLUMN user_id TO "userId";
      ALTER TABLE subscriptions RENAME COLUMN plan_id TO "planId";
      ALTER TABLE subscriptions RENAME COLUMN start_date TO "startDate";
      ALTER TABLE subscriptions RENAME COLUMN end_date TO "endDate";
      ALTER TABLE subscriptions RENAME COLUMN auto_renew TO "autoRenew";
      ALTER TABLE subscriptions RENAME COLUMN cancelled_at TO "cancelledAt";
      ALTER TABLE subscriptions RENAME COLUMN created_at TO "createdAt";
      ALTER TABLE subscriptions RENAME COLUMN updated_at TO "updatedAt";
    ELSE
      -- Sinon, créer les colonnes (ne devrait pas arriver)
      ALTER TABLE subscriptions ADD COLUMN "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE;
      ALTER TABLE subscriptions ADD COLUMN "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE subscriptions ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- ========================================
-- FIN DE LA MIGRATION
-- ========================================

-- Vérification
SELECT 
    'subscription_plans columns' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'subscription_plans'
ORDER BY column_name;

SELECT 
    'subscriptions columns' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'subscriptions'
ORDER BY column_name;

