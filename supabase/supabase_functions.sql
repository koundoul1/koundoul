-- ================================================
-- FONCTIONS UTILITAIRES POUR MICRO-LEÇONS
-- ================================================

-- 1) Recherche avancée
CREATE OR REPLACE FUNCTION search_microlessons(
    search_term TEXT DEFAULT NULL,
    filter_level TEXT DEFAULT NULL,
    filter_subject TEXT DEFAULT NULL,
    filter_difficulty INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id VARCHAR(10),
    level VARCHAR(20),
    subject VARCHAR(50),
    chapter VARCHAR(100),
    title VARCHAR(200),
    duration_min INTEGER,
    difficulty INTEGER,
    xp_reward INTEGER,
    rank REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.level,
        m.subject,
        m.chapter,
        m.title,
        m.duration_min,
        m.difficulty,
        m.xp_reward,
        ts_rank(
            to_tsvector('french', m.title || ' ' || m.chapter),
            plainto_tsquery('french', COALESCE(search_term, ''))
        ) as rank
    FROM public.microlessons m
    WHERE 
        (search_term IS NULL OR 
         to_tsvector('french', m.title || ' ' || m.chapter) @@ plainto_tsquery('french', search_term))
        AND (filter_level IS NULL OR m.level = filter_level)
        AND (filter_subject IS NULL OR m.subject = filter_subject)
        AND (filter_difficulty IS NULL OR m.difficulty = filter_difficulty)
    ORDER BY rank DESC, m.id;
END;
$$;

-- 2) Parcours d'un chapitre
CREATE OR REPLACE FUNCTION get_chapter_path(chapter_name TEXT, student_level TEXT)
RETURNS TABLE (
    lesson_order INTEGER,
    id VARCHAR(10),
    title VARCHAR(200),
    duration_min INTEGER,
    difficulty INTEGER,
    prerequisites JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY m.id)::INTEGER as lesson_order,
        m.id,
        m.title,
        m.duration_min,
        m.difficulty,
        m.prerequisites
    FROM public.microlessons m
    WHERE m.chapter = chapter_name AND m.level = student_level
    ORDER BY m.id;
END;
$$;

-- 3) Statistiques par niveau
CREATE OR REPLACE FUNCTION get_level_statistics(student_level TEXT DEFAULT NULL)
RETURNS TABLE (
    level VARCHAR(20),
    subject VARCHAR(50),
    total_lessons BIGINT,
    total_duration_min BIGINT,
    avg_difficulty NUMERIC,
    total_xp BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.level,
        m.subject,
        COUNT(*) as total_lessons,
        SUM(m.duration_min) as total_duration_min,
        ROUND(AVG(m.difficulty), 2) as avg_difficulty,
        SUM(m.xp_reward) as total_xp
    FROM public.microlessons m
    WHERE student_level IS NULL OR m.level = student_level
    GROUP BY m.level, m.subject
    ORDER BY m.level, m.subject;
END;
$$;

-- 4) Recommandations
CREATE OR REPLACE FUNCTION recommend_next_lessons(
    current_lesson_id VARCHAR(10),
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    id VARCHAR(10),
    title VARCHAR(200),
    chapter VARCHAR(100),
    difficulty INTEGER,
    relevance_score INTEGER
) 
LANGUAGE plpgsql
AS $$
DECLARE
    current_subject VARCHAR(50);
    current_level VARCHAR(20);
    current_chapter VARCHAR(100);
    current_difficulty INTEGER;
BEGIN
    SELECT m.subject, m.level, m.chapter, m.difficulty 
    INTO current_subject, current_level, current_chapter, current_difficulty
    FROM public.microlessons m
    WHERE m.id = current_lesson_id;
    
    RETURN QUERY
    SELECT 
        m.id,
        m.title,
        m.chapter,
        m.difficulty,
        CASE 
            WHEN m.chapter = current_chapter THEN 100
            WHEN m.subject = current_subject THEN 75
            WHEN m.difficulty = current_difficulty THEN 50
            ELSE 25
        END as relevance_score
    FROM public.microlessons m
    WHERE 
        m.id != current_lesson_id
        AND m.level = current_level
        AND m.subject = current_subject
        AND m.difficulty <= current_difficulty + 1
    ORDER BY relevance_score DESC, m.id
    LIMIT limit_count;
END;
$$;

-- Commentaires
COMMENT ON FUNCTION search_microlessons IS 'Recherche full-text avec filtres sur les micro-leçons';
COMMENT ON FUNCTION get_chapter_path IS 'Parcours ordonné des leçons d\''un chapitre pour un niveau';
COMMENT ON FUNCTION get_level_statistics IS 'Statistiques par niveau et matière';
COMMENT ON FUNCTION recommend_next_lessons IS 'Recommandations de prochaines leçons';










