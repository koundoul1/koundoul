-- Ajouter un champ JSONB pour les sections de contenu rédigées
ALTER TABLE public.microlessons
ADD COLUMN IF NOT EXISTS content_sections JSONB DEFAULT NULL;

-- Exemple de structure attendue
-- {
--   "introduction": "...",
--   "objectives": ["...","..."],
--   "prerequisites": ["..."],
--   "method": ["Étape 1","Étape 2","Étape 3"],
--   "example": { "statement": "...", "solution": ["...","..."] },
--   "exercises": ["Ex1","Ex2","Ex3"],
--   "summary": ["Point 1","Point 2","Point 3"]
-- }

-- Index GIN optionnel si on souhaite filtrer sur des clés
-- CREATE INDEX IF NOT EXISTS idx_microlessons_content_sections ON public.microlessons USING GIN (content_sections);










