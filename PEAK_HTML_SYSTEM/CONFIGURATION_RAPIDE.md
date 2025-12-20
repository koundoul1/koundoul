# ⚡ Configuration Rapide - Supabase Storage

## 🎯 En 5 minutes

### 1. Créer le bucket (2 min)

1. [supabase.com](https://supabase.com) → Votre projet → **Storage**
2. **New bucket** → Nom : `sites-html` → ✅ **Public** → Create

### 2. Configurer les politiques (1 min)

Dans **SQL Editor**, exécutez :

```sql
-- Permettre upload public
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'sites-html');

-- Permettre lecture publique  
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'sites-html');
```

### 3. Variables d'environnement (1 min)

Dans `.env.local` de votre projet Next.js :

```env
NEXT_PUBLIC_SUPABASE_URL=https://wnbkplyerizogmufatxb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

Récupérez la clé dans : **Settings** → **API** → **anon public**

### 4. Tester (1 min)

1. Redémarrez Next.js : `npm run dev`
2. Allez sur `/generer/PK-4358`
3. Upload un fichier HTML de test

✅ **C'est tout !**

---

## 🔍 Vérification rapide

- ✅ Bucket `sites-html` existe et est Public
- ✅ Politiques créées
- ✅ Variables d'environnement configurées
- ✅ Upload fonctionne

---

**📖 Guide détaillé** : Voir `GUIDE_SUPABASE_STORAGE.md`
