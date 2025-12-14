-- ================================================
-- MIGRATION : SYSTÈME DE TRACKING POUR MICRO-LEÇONS
-- ================================================

-- Table de complétion (sans FK si auth pas encore configuré)
CREATE TABLE IF NOT EXISTS public.microlesson_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Sans contrainte FK pour l'instant
    microlesson_id VARCHAR(10) NOT NULL,
    completed BOOLEAN DEFAULT false,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    time_spent INTEGER DEFAULT 0, -- en secondes
    first_completed_at TIMESTAMPTZ,
    last_reviewed_at TIMESTAMPTZ,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Contraintes
    UNIQUE(user_id, microlesson_id)
    
    -- TODO: Ajouter FK quand auth configuré
    -- CONSTRAINT fk_microlesson FOREIGN KEY (microlesson_id) 
    --     REFERENCES public.microlessons(id) ON DELETE CASCADE
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_microlesson_completions_user_id 
    ON public.microlesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_microlesson_completions_microlesson_id 
    ON public.microlesson_completions(microlesson_id);
CREATE INDEX IF NOT EXISTS idx_microlesson_completions_user_microlesson 
    ON public.microlesson_completions(user_id, microlesson_id);
CREATE INDEX IF NOT EXISTS idx_microlesson_completions_completed 
    ON public.microlesson_completions(completed) WHERE completed = true;

-- RLS Policies
ALTER TABLE public.microlesson_completions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own completions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' 
    AND tablename='microlesson_completions' 
    AND policyname='Users view own completions'
  ) THEN
    CREATE POLICY "Users view own completions"
      ON public.microlesson_completions
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: Users can insert/update their own completions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' 
    AND tablename='microlesson_completions' 
    AND policyname='Users manage own completions'
  ) THEN
    CREATE POLICY "Users manage own completions"
      ON public.microlesson_completions
      FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_microlesson_completions_updated_at 
    ON public.microlesson_completions;
CREATE TRIGGER update_microlesson_completions_updated_at
BEFORE UPDATE ON public.microlesson_completions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour obtenir les statistiques d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_microlessons_stats(p_user_id UUID)
RETURNS TABLE (
    total_completed BIGINT,
    total_xp_earned BIGINT,
    average_score NUMERIC,
    total_time_spent BIGINT,
    lessons_completed_today BIGINT,
    current_streak INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE mc.completed = true) as total_completed,
        COALESCE(SUM(m.xp_reward) FILTER (WHERE mc.completed = true AND mc.score >= 80), 0) as total_xp_earned,
        ROUND(AVG(mc.score) FILTER (WHERE mc.completed = true), 1) as average_score,
        SUM(mc.time_spent) FILTER (WHERE mc.completed = true) as total_time_spent,
        COUNT(*) FILTER (WHERE mc.completed = true AND DATE(mc.first_completed_at) = CURRENT_DATE) as lessons_completed_today,
        0 as current_streak -- TODO: implémenter le calcul de streak
    FROM public.microlesson_completions mc
    JOIN public.microlessons m ON m.id = mc.microlesson_id
    WHERE mc.user_id = p_user_id;
END;
$$;

-- Fonction pour obtenir les leçons à réviser
CREATE OR REPLACE FUNCTION get_lessons_to_review(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    microlesson_id VARCHAR(10),
    title VARCHAR(200),
    chapter VARCHAR(100),
    days_since_review INTEGER,
    last_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mc.microlesson_id,
        m.title,
        m.chapter,
        EXTRACT(DAY FROM CURRENT_TIMESTAMP - mc.last_reviewed_at)::INTEGER as days_since_review,
        mc.score as last_score
    FROM public.microlesson_completions mc
    JOIN public.microlessons m ON m.id = mc.microlesson_id
    WHERE mc.user_id = p_user_id
        AND mc.completed = true
        AND (
            mc.last_reviewed_at IS NULL OR
            mc.last_reviewed_at < CURRENT_TIMESTAMP - INTERVAL '7 days'
        )
    ORDER BY mc.last_reviewed_at ASC NULLS FIRST, mc.score ASC
    LIMIT p_limit;
END;
$$;

-- Commentaires
COMMENT ON TABLE public.microlesson_completions IS 'Suivi de la progression des utilisateurs sur les micro-leçons';
COMMENT ON FUNCTION get_user_microlessons_stats IS 'Statistiques complètes d''un utilisateur sur les micro-leçons';
COMMENT ON FUNCTION get_lessons_to_review IS 'Leçons à réviser pour un utilisateur (répétition espacée)';

