# 📤 Comment Uploader les Fichiers HTML dans Supabase

## 🎯 En 3 étapes simples

---

## ✅ ÉTAPE 1 : Créer le bucket Supabase (2 min)

### Dans Supabase Dashboard :

1. **Allez sur** : https://supabase.com/dashboard
2. **Sélectionnez votre projet**
3. **Cliquez sur "Storage"** (menu de gauche)
4. **Cliquez sur "New bucket"**
5. **Remplissez** :
   ```
   Name: sites-html
   Public bucket: ✅ COCHER (très important !)
   ```
6. **Cliquez sur "Create bucket"**

✅ **Résultat** : Le bucket `sites-html` apparaît dans la liste

---

## ✅ ÉTAPE 2 : Configurer les permissions (1 min)

### Dans SQL Editor :

1. **Allez sur** : SQL Editor → New query
2. **Collez ce code** :

```sql
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'sites-html');

CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'sites-html');
```

3. **Cliquez sur "Run"**

✅ **Résultat** : Les politiques sont créées

---

## ✅ ÉTAPE 3 : Configurer Next.js (1 min)

### Dans votre projet Next.js :

1. **Créez/modifiez** `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=https://wnbkplyerizogmufatxb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

2. **Récupérez la clé** :
   - Supabase Dashboard → Settings → API
   - Copiez **"anon public"** key

3. **Redémarrez Next.js** :
   ```bash
   npm run dev
   ```

✅ **Résultat** : L'application peut maintenant uploader vers Supabase

---

## 🚀 Utilisation

Une fois configuré, l'upload se fait automatiquement :

1. **L'utilisateur** va sur `/generer/PK-4358`
2. **Il upload** un fichier HTML via le composant `HTMLUploadCard`
3. **Le fichier** est automatiquement uploadé dans Supabase Storage
4. **L'URL publique** est générée et affichée

### Exemple d'URL générée :

```
https://wnbkplyerizogmufatxb.supabase.co/storage/v1/object/public/sites-html/PK-4358.html
```

---

## 🔍 Vérification

### Test rapide :

1. Allez sur `/generer/PK-4358` dans votre app Next.js
2. Upload le fichier `test-upload.html` (fourni dans le dossier)
3. Vérifiez dans Supabase Dashboard → Storage → sites-html que le fichier apparaît
4. Cliquez sur le fichier pour voir l'URL publique
5. Ouvrez l'URL dans votre navigateur

✅ **Si vous voyez la page HTML, c'est bon !**

---

## 📝 Code utilisé

Le système utilise automatiquement :

- **`lib/supabase-html.ts`** : Fonction `uploadHTMLToStorage()`
- **`app/api/upload-html/route.ts`** : API route Next.js
- **`components/HTMLUploadCard.tsx`** : Interface utilisateur

**Vous n'avez rien à modifier dans le code**, juste configurer Supabase !

---

## 🐛 Si ça ne marche pas

### Erreur "Bucket not found"
→ Vérifiez que le bucket s'appelle exactement `sites-html`

### Erreur "row-level security"
→ Exécutez les politiques SQL de l'étape 2

### Erreur "Invalid API key"
→ Vérifiez que vous utilisez la clé **anon**, pas **service_role**

### Le fichier s'upload mais l'URL ne fonctionne pas
→ Vérifiez que le bucket est **Public**

---

## 📚 Documentation complète

- **Guide détaillé** : `GUIDE_SUPABASE_STORAGE.md`
- **Configuration rapide** : `CONFIGURATION_RAPIDE.md`
- **Instructions** : `INSTRUCTIONS_SUPABASE.md`

---

**✅ C'est tout ! Une fois configuré, l'upload fonctionne automatiquement.**
