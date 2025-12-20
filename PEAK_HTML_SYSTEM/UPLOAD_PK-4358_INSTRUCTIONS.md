# 🚀 Instructions pour Uploader PK-4358-DER-DESIGN.html

## 📋 En 3 étapes

### ÉTAPE 1 : Récupérer la clé Supabase (2 min)

1. Allez sur : **https://supabase.com/dashboard/project/wnbkplyerizogmufatxb/settings/api**
2. Copiez la clé **"anon public"** (la première clé, pas service_role)
3. Gardez-la sous la main

### ÉTAPE 2 : Vérifier que le bucket existe

1. Allez sur : **https://supabase.com/dashboard/project/wnbkplyerizogmufatxb/storage**
2. Vérifiez que le bucket **`sites-html`** existe
3. Si non, créez-le :
   - Cliquez sur **"New bucket"**
   - Nom : `sites-html`
   - ✅ **Public bucket** → Create

### ÉTAPE 3 : Uploader le fichier

Ouvrez PowerShell et exécutez :

```powershell
cd c:\Users\conta\koundoul\PEAK_HTML_SYSTEM

# Définir la clé Supabase (remplacez VOTRE_CLE par la clé copiée)
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="VOTRE_CLE_ICI"
$env:NEXT_PUBLIC_SUPABASE_URL="https://wnbkplyerizogmufatxb.supabase.co"

# Uploader le fichier
node scripts/upload-file-direct.cjs "C:\Users\conta\peak-1000\Fichiers Html\PK-4358-DER-DESIGN.html" "PK-4358"
```

---

## ✅ Résultat attendu

Après l'upload réussi, vous verrez :

```
======================================================================
🎉 SUCCÈS ! Site mis en ligne
======================================================================

📄 Fichier: PK-4358.html
📊 Taille: XX.XX KB
🌐 URL publique:

   https://wnbkplyerizogmufatxb.supabase.co/storage/v1/object/public/sites-html/PK-4358.html

💡 Vous pouvez maintenant ouvrir cette URL dans votre navigateur
======================================================================
```

**Ouvrez cette URL dans votre navigateur pour voir le site en ligne !**

---

## 🐛 Si ça ne marche pas

### Erreur "Bucket not found"
→ Créez le bucket `sites-html` dans Supabase Dashboard → Storage (Public)

### Erreur "row-level security"
→ Exécutez ce SQL dans Supabase SQL Editor :

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

### Erreur "Invalid API key"
→ Vérifiez que vous utilisez la clé **anon**, pas **service_role**

---

**✅ Une fois l'upload réussi, le site sera accessible publiquement !**
