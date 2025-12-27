-- ========================================
-- MIGRATION PARENT-CHILD SYSTEM
-- À exécuter dans Supabase SQL Editor
-- ========================================

-- 1. Ajouter colonne invitationCode à la table users (minuscule - c'est le vrai nom dans Supabase)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "invitationCode" TEXT UNIQUE;

-- 2. Créer un index sur invitationCode pour améliorer les performances
CREATE INDEX IF NOT EXISTS "idx_users_invitation_code" ON "users"("invitationCode") WHERE "invitationCode" IS NOT NULL;

-- 3. Ajouter un commentaire
COMMENT ON COLUMN "users"."invitationCode" IS 'Code d''invitation pour permettre aux parents de se connecter et suivre la progression de l''enfant';

-- Note: La table parent_child_links existe déjà (créée par une migration précédente), donc on ne la modifie pas

-- ========================================
-- FIN DE LA MIGRATION
-- ========================================

-- Vérification (optionnel - pour tester que tout est OK)
SELECT 
    'Migration réussie!' as status,
    COUNT(*) as nombre_colonnes
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'invitationCode';

-- Vérification optionnelle pour la table parent_child_links (elle devrait déjà exister)
-- SELECT 
--     'Table parent_child_links existe!' as status,
--     COUNT(*) as nombre_tables
-- FROM information_schema.tables 
-- WHERE table_name = 'parent_child_links';









