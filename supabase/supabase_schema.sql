-- ================================================
-- SCHÉMA SUPABASE POUR MICRO-LEÇONS
-- ================================================

-- Nettoyage
DROP TABLE IF EXISTS public.microlessons CASCADE;

-- Table principale
CREATE TABLE public.microlessons (
    id              VARCHAR(10) PRIMARY KEY,
    level           VARCHAR(20) NOT NULL CHECK (level IN ('Seconde', 'Première', 'Terminale')),
    subject         VARCHAR(50) NOT NULL CHECK (subject IN ('Mathématiques', 'Physique', 'Chimie')),
    chapter         VARCHAR(100) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    duration_min    INTEGER NOT NULL CHECK (duration_min > 0 AND duration_min <= 20),
    objectives      JSONB NOT NULL,
    prerequisites   JSONB NOT NULL,
    content_types   JSONB NOT NULL,
    difficulty      INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    xp_reward       INTEGER NOT NULL CHECK (xp_reward > 0),
    tags            JSONB NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_microlessons_level      ON public.microlessons(level);
CREATE INDEX idx_microlessons_subject    ON public.microlessons(subject);
CREATE INDEX idx_microlessons_chapter    ON public.microlessons(chapter);
CREATE INDEX idx_microlessons_difficulty ON public.microlessons(difficulty);
CREATE INDEX idx_microlessons_tags       ON public.microlessons USING GIN(tags);

-- Full-text
CREATE INDEX idx_microlessons_search ON public.microlessons 
USING GIN(to_tsvector('french', title || ' ' || chapter));

-- RLS
ALTER TABLE public.microlessons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='microlessons' AND policyname='Public read access'
  ) THEN
    CREATE POLICY "Public read access"
      ON public.microlessons
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='microlessons' AND policyname='Admin write access'
  ) THEN
    CREATE POLICY "Admin write access"
      ON public.microlessons
      FOR ALL
      USING (coalesce(auth.jwt()->>'role','') = 'admin');
  END IF;
END $$;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_microlessons_updated_at ON public.microlessons;
CREATE TRIGGER update_microlessons_updated_at
BEFORE UPDATE ON public.microlessons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Commentaires
COMMENT ON TABLE public.microlessons IS 'Micro-leçons pour ScientificApp - Lycée Général (Math, Physique, Chimie)';
COMMENT ON COLUMN public.microlessons.id IS 'Identifiant unique (ex: M2-01, P1-15, CT-23)';
COMMENT ON COLUMN public.microlessons.level IS 'Niveau scolaire: Seconde, Première, Terminale';
COMMENT ON COLUMN public.microlessons.subject IS 'Matière: Mathématiques, Physique, Chimie';
COMMENT ON COLUMN public.microlessons.objectives IS 'Liste des objectifs pédagogiques (array JSON)';
COMMENT ON COLUMN public.microlessons.xp_reward IS 'Points XP gagnés en complétant la leçon';










