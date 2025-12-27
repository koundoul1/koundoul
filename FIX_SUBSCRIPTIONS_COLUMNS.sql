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
-- Renommer user_id en userId si nécessaire, ou créer la colonne si elle n'existe pas
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
    ELSE
      -- Sinon, créer la colonne userId (obligatoire)
      ALTER TABLE subscriptions ADD COLUMN "userId" TEXT;
      -- Mettre à jour les lignes existantes si nécessaire (optionnel)
      -- UPDATE subscriptions SET "userId" = (SELECT id FROM users LIMIT 1) WHERE "userId" IS NULL;
    END IF;
  END IF;
  
  -- Vérifier et renommer les autres colonnes si nécessaire
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'plan_id'
  ) THEN
    ALTER TABLE subscriptions RENAME COLUMN plan_id TO "planId";
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE subscriptions RENAME COLUMN start_date TO "startDate";
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE subscriptions RENAME COLUMN end_date TO "endDate";
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'auto_renew'
  ) THEN
    ALTER TABLE subscriptions RENAME COLUMN auto_renew TO "autoRenew";
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'cancelled_at'
  ) THEN
    ALTER TABLE subscriptions RENAME COLUMN cancelled_at TO "cancelledAt";
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE subscriptions RENAME COLUMN created_at TO "createdAt";
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE subscriptions RENAME COLUMN updated_at TO "updatedAt";
  END IF;
  
  -- Ajouter la contrainte NOT NULL et la foreign key si userId est créé maintenant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'subscriptions' 
    AND constraint_name LIKE '%userId%'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    -- Vérifier que userId n'est pas null avant d'ajouter la contrainte
    -- ALTER TABLE subscriptions ALTER COLUMN "userId" SET NOT NULL;
    -- ALTER TABLE subscriptions ADD CONSTRAINT fk_subscriptions_user_id FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
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

