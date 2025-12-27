-- ========================================
-- MIGRATION PARENT-CHILD SYSTEM
-- À exécuter dans Supabase SQL Editor
-- ========================================

-- 1. Ajouter colonne invitationCode à la table users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "invitationCode" TEXT UNIQUE;

-- 2. Créer la table parent_child_links
CREATE TABLE IF NOT EXISTS "parent_child_links" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "parent_child_links_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "parent_child_links_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "parent_child_links_childId_fkey" FOREIGN KEY ("childId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "parent_child_links_parentId_childId_key" UNIQUE ("parentId", "childId")
);

-- 3. Créer les index pour performances
CREATE INDEX IF NOT EXISTS "parent_child_links_parentId_idx" ON "parent_child_links"("parentId");
CREATE INDEX IF NOT EXISTS "parent_child_links_childId_idx" ON "parent_child_links"("childId");

-- 4. Ajouter les commentaires
COMMENT ON TABLE "parent_child_links" IS 'Liens entre comptes parents et enfants';
COMMENT ON COLUMN "users"."invitationCode" IS 'Code pour lier un compte parent';

-- ========================================
-- FIN DE LA MIGRATION
-- ========================================

-- Vérification (optionnel - pour tester que tout est OK)
SELECT 
    'Migration réussie!' as status,
    COUNT(*) as nombre_colonnes
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'invitationCode';

SELECT 
    'Table créée!' as status,
    COUNT(*) as nombre_tables
FROM information_schema.tables 
WHERE table_name = 'parent_child_links';









