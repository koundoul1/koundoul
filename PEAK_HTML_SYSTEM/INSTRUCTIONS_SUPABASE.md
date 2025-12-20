# 📦 Instructions Supabase Storage - Upload HTML

## 🎯 Résumé rapide

Pour uploader les fichiers HTML dans Supabase, vous devez :

1. **Créer le bucket** `sites-html` (Public)
2. **Configurer les politiques** de sécurité
3. **Ajouter les variables d'environnement** dans votre projet Next.js
4. **Tester** l'upload

---

## 📋 Guide étape par étape

### ÉTAPE 1 : Créer le bucket (2 minutes)

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **"Storage"** dans le menu de gauche
4. Cliquez sur **"New bucket"**
5. Remplissez :
   - **Name** : `sites-html` ⚠️ **EXACTEMENT ce nom**
   - **Public bucket** : ✅ **COCHEZ** (très important !)
   - **File size limit** : `10 MB` (ou plus)
6. Cliquez sur **"Create bucket"**

### ÉTAPE 2 : Configurer les politiques (2 minutes)

1. Dans Supabase Dashboard → **Storage** → **sites-html**
2. Cliquez sur l'onglet **"Policies"**
3. Si aucune politique n'existe, créez-en deux :

**Via SQL Editor** (recommandé) :

1. Allez dans **SQL Editor** → **New query**
2. Collez ce code :

```sql
-- Politique pour permettre l'upload public
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'sites-html');

-- Politique pour permettre la lecture publique
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'sites-html');
```

3. Cliquez sur **"Run"**

### ÉTAPE 3 : Variables d'environnement (1 minute)

Dans votre projet Next.js, créez/modifiez `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://wnbkplyerizogmufatxb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

**Pour récupérer la clé** :
1. Supabase Dashboard → **Settings** → **API**
2. Copiez **"anon public"** key (pas service_role !)

### ÉTAPE 4 : Tester (1 minute)

1. Redémarrez votre serveur Next.js :
   ```bash
   npm run dev
   ```

2. Allez sur votre page de génération :
   ```
   http://localhost:3000/generer/PK-4358
   ```

3. Upload un fichier HTML de test

4. Vérifiez dans Supabase Dashboard → Storage → sites-html que le fichier apparaît

---

## ✅ Comment ça fonctionne ?

### Le code fait automatiquement :

1. **L'utilisateur upload un fichier HTML** via `HTMLUploadCard.tsx`
2. **Le fichier est envoyé** à `/api/upload-html`
3. **L'API route** (`route.ts`) appelle `uploadHTMLToStorage()`
4. **La fonction** (`supabase-html.ts`) :
   - Crée un Blob à partir du contenu HTML
   - Upload vers le bucket `sites-html`
   - Récupère l'URL publique
   - Retourne l'URL au frontend
5. **L'utilisateur voit l'URL** et peut ouvrir le site

### Exemple d'URL générée :

```
https://wnbkplyerizogmufatxb.supabase.co/storage/v1/object/public/sites-html/PK-4358.html
```

---

## 🔍 Vérification

### Checklist :

- [ ] Bucket `sites-html` créé et visible dans Storage
- [ ] Bucket marqué comme **Public**
- [ ] Politiques SQL exécutées avec succès
- [ ] Variables d'environnement dans `.env.local`
- [ ] Serveur Next.js redémarré
- [ ] Test d'upload réussi
- [ ] Fichier visible dans Supabase Dashboard
- [ ] URL publique accessible dans le navigateur

---

## 🐛 Problèmes courants

### "Bucket not found"
→ Vérifiez que le nom est exactement `sites-html` (sensible à la casse)

### "new row violates row-level security policy"
→ Les politiques ne sont pas créées. Exécutez le SQL de l'étape 2.

### "Invalid API key"
→ Vérifiez que vous utilisez la clé **anon**, pas **service_role**

### Le fichier s'upload mais l'URL ne fonctionne pas
→ Vérifiez que le bucket est **Public** dans les paramètres

---

## 📖 Documentation complète

- **Guide détaillé** : `GUIDE_SUPABASE_STORAGE.md`
- **Configuration rapide** : `CONFIGURATION_RAPIDE.md`
- **Code source** : `lib/supabase-html.ts`

---

**✅ Une fois configuré, l'upload fonctionnera automatiquement !**
