-- Migration: Ajouter invitationCode et table parent_child_links
-- Date: 2025-12-25

-- 1. Ajouter le champ invitationCode à la table users (si n'existe pas déjà)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'invitation_code'
  ) THEN
    ALTER TABLE users ADD COLUMN invitation_code VARCHAR(10) UNIQUE;
  END IF;
  
  -- Ajouter le champ streak s'il n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'streak'
  ) THEN
    ALTER TABLE users ADD COLUMN streak INTEGER DEFAULT 0;
  END IF;
END $$;

-- 2. Créer la table parent_child_links si elle n'existe pas
CREATE TABLE IF NOT EXISTS parent_child_links (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  parent_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- 3. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_parent_child_links_parent_id ON parent_child_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_links_child_id ON parent_child_links(child_id);

-- 4. Créer un index sur invitation_code si nécessaire
CREATE INDEX IF NOT EXISTS idx_users_invitation_code ON users(invitation_code) WHERE invitation_code IS NOT NULL;
