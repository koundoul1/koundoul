-- Migration: Ajout du système parent-enfant et code d'invitation
-- Date: 2025-11-09

-- Ajouter colonne invitationCode à la table User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "invitationCode" TEXT UNIQUE;

-- Créer la table parent_child_links
CREATE TABLE IF NOT EXISTS "parent_child_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "parent_child_links_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "parent_child_links_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "parent_child_links_parentId_childId_key" UNIQUE ("parentId", "childId")
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS "parent_child_links_parentId_idx" ON "parent_child_links"("parentId");
CREATE INDEX IF NOT EXISTS "parent_child_links_childId_idx" ON "parent_child_links"("childId");

-- Commentaires
COMMENT ON TABLE "parent_child_links" IS 'Liens entre comptes parents et enfants';
COMMENT ON COLUMN "User"."invitationCode" IS 'Code pour lier un compte parent';









