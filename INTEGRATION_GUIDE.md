# Intégration Supabase - Micro-Leçons

## Prérequis
- Compte Supabase (projet créé)
- Node.js 18+
- Accès Service Role Key (SUPABASE_SERVICE_KEY)

## Installation
```bash
cd scripts
npm install
```

## Étapes
1. Exécuter le schéma SQL dans Supabase
   - Ouvrir Supabase SQL Editor
   - Coller `supabase/supabase_schema.sql`
   - Exécuter
   - Coller puis exécuter `supabase/supabase_functions.sql`
2. Générer les 450 micro-leçons
```bash
python scripts/generate_all_450_lessons.py
```
> Le fichier `data/all_450_microlessons.json` sera produit.

3. Configurer l'environnement
```bash
cp .env.example .env
# Renseigner SUPABASE_URL et SUPABASE_SERVICE_KEY
```

4. Importer dans Supabase
```bash
node scripts/import_to_supabase.js
```

5. Vérifier avec les requêtes de test
   - Coller et exécuter `supabase/test_queries.sql` dans le SQL Editor

## Notes
- RLS est activé (lecture publique, écriture admin via rôle dans le JWT)
- Les champs JSON utilisent JSONB et des indexes GIN
- Import par lots de 50 pour éviter les timeouts










