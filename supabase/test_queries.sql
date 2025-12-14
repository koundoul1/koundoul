-- ================================================
-- REQUÊTES DE TEST POUR MICRO-LEÇONS
-- ================================================

-- 1. Compter le nombre total de leçons
SELECT COUNT(*) as total_lessons FROM public.microlessons;

-- 2. Répartition par niveau
SELECT level, COUNT(*) as count 
FROM public.microlessons 
GROUP BY level 
ORDER BY level;

-- 3. Répartition par matière
SELECT subject, COUNT(*) as count 
FROM public.microlessons 
GROUP BY subject 
ORDER BY subject;

-- 4. Répartition par niveau ET matière
SELECT level, subject, COUNT(*) as count 
FROM public.microlessons 
GROUP BY level, subject 
ORDER BY level, subject;

-- 5. Les 10 premières leçons de Seconde en Mathématiques
SELECT id, title, chapter, difficulty, xp_reward 
FROM public.microlessons 
WHERE level = 'Seconde' AND subject = 'Mathématiques' 
ORDER BY id 
LIMIT 10;

-- 6. Recherche par mot-clé
SELECT * FROM search_microlessons('dérivée', NULL, 'Mathématiques', NULL);

-- 7. Parcours du chapitre "Dérivation" en Première
SELECT * FROM get_chapter_path('Dérivation', 'Première');

-- 8. Statistiques par niveau
SELECT * FROM get_level_statistics();

-- 9. Statistiques pour la Terminale uniquement
SELECT * FROM get_level_statistics('Terminale');

-- 10. Recommandations après une leçon donnée
SELECT * FROM recommend_next_lessons('M1-13', 5);

-- 11. Leçons les plus difficiles (niveau 4-5)
SELECT id, title, subject, chapter, difficulty, xp_reward 
FROM public.microlessons 
WHERE difficulty >= 4 
ORDER BY difficulty DESC, xp_reward DESC 
LIMIT 20;

-- 12. Durée totale par matière
SELECT subject, SUM(duration_min) as total_minutes, 
       ROUND(SUM(duration_min) / 60.0, 2) as total_hours
FROM public.microlessons 
GROUP BY subject 
ORDER BY total_minutes DESC;

-- 13. Vérifier l'intégrité des tags
SELECT id, title, tags 
FROM public.microlessons 
WHERE jsonb_array_length(tags) = 0;

-- 14. Leçons sans prérequis (débutant)
SELECT id, title, chapter, prerequisites 
FROM public.microlessons 
WHERE prerequisites = '[]'::jsonb OR jsonb_array_length(prerequisites) = 0
ORDER BY id 
LIMIT 10;

-- 15. XP total disponible par niveau
SELECT level, SUM(xp_reward) as total_xp 
FROM public.microlessons 
GROUP BY level 
ORDER BY level;










