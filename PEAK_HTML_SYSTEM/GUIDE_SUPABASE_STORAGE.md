# 📦 Guide Supabase Storage - Upload HTML

## 🎯 Objectif

Configurer Supabase Storage pour stocker les fichiers HTML générés par Claude.

---

## 📋 ÉTAPE 1 : Créer le bucket dans Supabase

### 1.1 Accéder à Supabase Storage

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet (ou créez-en un)
4. Dans le menu de gauche, cliquez sur **"Storage"**

### 1.2 Créer un nouveau bucket

1. Cliquez sur **"New bucket"** ou **"Créer un bucket"**
2. Remplissez les informations :
   - **Name** : `sites-html` ⚠️ **EXACTEMENT ce nom**
   - **Public bucket** : ✅ **COCHEZ** (important pour accès direct aux fichiers)
   - **File size limit** : `10 MB` (ou plus selon vos besoins)
   - **Allowed MIME types** : Laissez vide ou ajoutez `text/html`
3. Cliquez sur **"Create bucket"**

### 1.3 Vérifier les permissions

1. Une fois le bucket créé, cliquez dessus
2. Allez dans l'onglet **"Policies"** ou **"Politiques"**
3. Vérifiez qu'il y a une politique pour permettre l'upload :
   - **Policy name** : `Allow public uploads` (ou similaire)
   - **Allowed operation** : `INSERT`, `SELECT`
   - **Target roles** : `authenticated`, `anon` (ou `public`)

Si aucune politique n'existe, créez-en une :

**SQL Policy (via SQL Editor)** :
```sql
-- Permettre l'upload public
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'sites-html');

-- Permettre la lecture publique
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'sites-html');
```

---

## 🔧 ÉTAPE 2 : Configurer les variables d'environnement

### 2.1 Dans votre projet Next.js

Créez ou modifiez le fichier `.env.local` à la racine de votre projet Next.js :

```env
NEXT_PUBLIC_SUPABASE_URL=https://wnbkplyerizogmufatxb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

### 2.2 Récupérer les clés Supabase

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

⚠️ **Important** : Utilisez la clé **anon**, pas la clé **service_role** (celle-ci est secrète).

---

## 🧪 ÉTAPE 3 : Tester l'upload

### 3.1 Vérifier que le bucket existe

Dans Supabase Dashboard → Storage → Vérifiez que `sites-html` apparaît dans la liste.

### 3.2 Test manuel via l'interface Supabase

1. Cliquez sur le bucket `sites-html`
2. Cliquez sur **"Upload file"**
3. Sélectionnez un fichier HTML de test
4. Vérifiez qu'il s'upload correctement

### 3.3 Test via l'application

1. Démarrez votre application Next.js :
   ```bash
   npm run dev
   ```

2. Accédez à la page de génération :
   ```
   http://localhost:3000/generer/PK-4358
   ```

3. Testez l'upload d'un fichier HTML

---

## 🔍 ÉTAPE 4 : Vérifier l'upload réussi

### 4.1 Dans Supabase Dashboard

1. Allez dans **Storage** → **sites-html**
2. Vérifiez que le fichier `PK-4358.html` (ou votre numéro de dossier) apparaît
3. Cliquez sur le fichier pour voir l'URL publique

### 4.2 URL publique

L'URL devrait ressembler à :
```
https://wnbkplyerizogmufatxb.supabase.co/storage/v1/object/public/sites-html/PK-4358.html
```

Vous pouvez ouvrir cette URL directement dans votre navigateur pour voir le site HTML.

---

## 🐛 Résolution de problèmes

### Erreur : "Bucket not found"

**Solution** :
- Vérifiez que le bucket s'appelle exactement `sites-html` (sensible à la casse)
- Vérifiez que vous êtes dans le bon projet Supabase

### Erreur : "new row violates row-level security policy"

**Solution** :
- Le bucket n'est pas public ou les politiques ne sont pas configurées
- Créez les politiques SQL mentionnées dans l'étape 1.3

### Erreur : "Invalid API key"

**Solution** :
- Vérifiez que `NEXT_PUBLIC_SUPABASE_ANON_KEY` est correcte
- Vérifiez que vous utilisez la clé **anon**, pas **service_role**
- Redémarrez votre serveur Next.js après modification de `.env.local`

### Erreur : "File size exceeds limit"

**Solution** :
- Augmentez la limite de taille dans les paramètres du bucket
- Ou réduisez la taille du fichier HTML

### Le fichier s'upload mais l'URL ne fonctionne pas

**Solution** :
- Vérifiez que le bucket est marqué comme **Public**
- Vérifiez que la politique de lecture publique existe
- Vérifiez l'URL dans Supabase Dashboard → Storage → fichier → "Copy URL"

---

## 📝 Checklist de configuration

- [ ] Bucket `sites-html` créé dans Supabase Storage
- [ ] Bucket marqué comme **Public**
- [ ] Politiques de sécurité configurées (INSERT + SELECT)
- [ ] Variables d'environnement configurées dans `.env.local`
- [ ] Clé Supabase **anon** récupérée et ajoutée
- [ ] Test d'upload réussi via l'interface Supabase
- [ ] Test d'upload réussi via l'application Next.js
- [ ] URL publique accessible dans le navigateur

---

## 🔗 Liens utiles

- **Supabase Dashboard** : https://supabase.com/dashboard
- **Documentation Storage** : https://supabase.com/docs/guides/storage
- **Politiques RLS** : https://supabase.com/docs/guides/storage/security/access-control

---

## 💡 Astuce

Pour tester rapidement si le bucket fonctionne, vous pouvez utiliser cette commande dans la console du navigateur (sur votre page Next.js) :

```javascript
// Test rapide d'upload
const testHTML = '<!DOCTYPE html><html><body><h1>Test</h1></body></html>'
const blob = new Blob([testHTML], { type: 'text/html' })

const formData = new FormData()
formData.append('file', blob, 'test.html')

fetch('https://wnbkplyerizogmufatxb.supabase.co/storage/v1/object/sites-html/test.html', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  },
  body: formData
})
```

---

**✅ Une fois configuré, le système d'upload fonctionnera automatiquement !**
