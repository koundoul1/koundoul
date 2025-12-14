-- ================================================
-- MIGRATION : SYSTÈME DE BANQUES DE QUESTIONS
-- QCM + EXERCICES : 1800 questions totales
-- ================================================

-- Table des banques de questions
CREATE TABLE IF NOT EXISTS public.question_banks (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    level VARCHAR(20) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'QCM' ou 'Exercices'
    total_questions INTEGER NOT NULL,
    chapters_covered JSONB,
    difficulty_distribution JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table des questions QCM
CREATE TABLE IF NOT EXISTS public.qcm_questions (
    id VARCHAR(30) PRIMARY KEY,
    bank_id VARCHAR(20) REFERENCES public.question_banks(id) ON DELETE CASCADE,
    chapter VARCHAR(100),
    difficulty INTEGER,
    points INTEGER DEFAULT 10,
    time_limit_seconds INTEGER,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    explanation TEXT,
    related_lesson VARCHAR(20),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_bank FOREIGN KEY (bank_id) 
        REFERENCES public.question_banks(id) ON DELETE CASCADE
);

-- Table des exercices-problèmes
CREATE TABLE IF NOT EXISTS public.exercise_problems (
    id VARCHAR(30) PRIMARY KEY,
    bank_id VARCHAR(20) REFERENCES public.question_banks(id) ON DELETE CASCADE,
    chapter VARCHAR(100),
    difficulty INTEGER,
    points INTEGER DEFAULT 10,
    time_limit_minutes INTEGER,
    problem TEXT NOT NULL,
    solution JSONB, -- {steps: [], final_answer: ""}
    hints JSONB,
    related_lesson VARCHAR(20),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_bank_ex FOREIGN KEY (bank_id) 
        REFERENCES public.question_banks(id) ON DELETE CASCADE
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_qcm_bank_id ON public.qcm_questions(bank_id);
CREATE INDEX IF NOT EXISTS idx_qcm_chapter ON public.qcm_questions(chapter);
CREATE INDEX IF NOT EXISTS idx_qcm_difficulty ON public.qcm_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_qcm_related_lesson ON public.qcm_questions(related_lesson);

CREATE INDEX IF NOT EXISTS idx_ex_bank_id ON public.exercise_problems(bank_id);
CREATE INDEX IF NOT EXISTS idx_ex_chapter ON public.exercise_problems(chapter);
CREATE INDEX IF NOT EXISTS idx_ex_difficulty ON public.exercise_problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_ex_related_lesson ON public.exercise_problems(related_lesson);

CREATE INDEX IF NOT EXISTS idx_banks_level_subject ON public.question_banks(level, subject);
CREATE INDEX IF NOT EXISTS idx_banks_type ON public.question_banks(type);

-- RLS Policies (read-only pour tous)
ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qcm_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_problems ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
CREATE POLICY "Everyone can view question banks"
    ON public.question_banks FOR SELECT USING (true);
    
CREATE POLICY "Everyone can view qcm questions"
    ON public.qcm_questions FOR SELECT USING (true);
    
CREATE POLICY "Everyone can view exercise problems"
    ON public.exercise_problems FOR SELECT USING (true);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_question_banks_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_question_banks_updated_at ON public.question_banks;
CREATE TRIGGER update_question_banks_updated_at
BEFORE UPDATE ON public.question_banks
FOR EACH ROW
EXECUTE FUNCTION update_question_banks_updated_at_column();

-- ================================================
-- FONCTIONS UTILITAIRES
-- ================================================

-- Fonction pour obtenir des QCM aléatoires
CREATE OR REPLACE FUNCTION get_random_qcm(
    p_bank_id VARCHAR,
    p_difficulty INTEGER DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id VARCHAR,
    bank_id VARCHAR,
    chapter VARCHAR,
    difficulty INTEGER,
    points INTEGER,
    time_limit_seconds INTEGER,
    question TEXT,
    options JSONB,
    explanation TEXT,
    related_lesson VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id, q.bank_id, q.chapter, q.difficulty, 
        q.points, q.time_limit_seconds, q.question,
        q.options, q.explanation, q.related_lesson
    FROM public.qcm_questions q
    WHERE q.bank_id = p_bank_id
      AND (p_difficulty IS NULL OR q.difficulty = p_difficulty)
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$;

-- Fonction pour obtenir des exercices aléatoires
CREATE OR REPLACE FUNCTION get_random_exercises(
    p_bank_id VARCHAR,
    p_difficulty INTEGER DEFAULT NULL,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    id VARCHAR,
    bank_id VARCHAR,
    chapter VARCHAR,
    difficulty INTEGER,
    points INTEGER,
    time_limit_minutes INTEGER,
    problem TEXT,
    solution JSONB,
    hints JSONB,
    related_lesson VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id, e.bank_id, e.chapter, e.difficulty,
        e.points, e.time_limit_minutes, e.problem,
        e.solution, e.hints, e.related_lesson
    FROM public.exercise_problems e
    WHERE e.bank_id = p_bank_id
      AND (p_difficulty IS NULL OR e.difficulty = p_difficulty)
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$;

-- Fonction pour stats d'une banque
CREATE OR REPLACE FUNCTION get_bank_stats(p_bank_id VARCHAR)
RETURNS TABLE (
    total_qcm BIGINT,
    total_exercises BIGINT,
    difficulty_distribution JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.qcm_questions WHERE bank_id = p_bank_id)::BIGINT,
        (SELECT COUNT(*) FROM public.exercise_problems WHERE bank_id = p_bank_id)::BIGINT,
        (SELECT qb.difficulty_distribution FROM public.question_banks qb WHERE qb.id = p_bank_id);
END;
$$;

