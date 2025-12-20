# 🚀 Guide Upload PK-4358-DER-DESIGN.html

## 📋 Étapes rapides

### 1. Récupérer la clé Supabase (2 min)

1. Allez sur : https://supabase.com/dashboard/project/wnbkplyerizogmufatxb/settings/api
2. Copiez la clé **"anon public"** (pas service_role !)
3. Gardez-la sous la main

### 2. Exécuter le script d'upload

**Option A : Script PowerShell (Recommandé)**

```powershell
cd c:\Users\conta\koundoul\PEAK_HTML_SYSTEM
.\UPLOADER_SIMPLE.ps1
```

Le script vous demandera la clé Supabase si nécessaire.

**Option B : Commandes manuelles**

```powershell
cd c:\Users\conta\koundoul\PEAK_HTML_SYSTEM

# Définir la clé Supabase
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="votre_cle_ici"
$env:NEXT_PUBLIC_SUPABASE_URL="https://wnbkplyerizogmufatxb.supabase.co"

# Uploader le fichier
node scripts/upload-file-direct.cjs "C:\Users\conta\peak-1000\Fichiers Html\PK-4358-DER-DESIGN.html" "PK-4358"
```

### 3. Vérifier le résultat

Après l'upload réussi, vous obtiendrez une URL comme :
```
https://wnbkplyerizogmufatxb.supabase.co/storage/v1/object/public/sites-html/PK-4358.html
```

Ouvrez cette URL dans votre navigateur pour voir le site en ligne !

---

## ⚠️ Prérequis

Avant d'uploader, assurez-vous que :

- [ ] Le bucket `sites-html` existe dans Supabase Storage (Public)
- [ ] Les politiques SQL sont créées (voir `GUIDE_SUPABASE_STORAGE.md`)
- [ ] La clé Supabase anon est disponible

---

## 🐛 Si ça ne marche pas

### Erreur "Bucket not found"
→ Créez le bucket `sites-html` dans Supabase Dashboard → Storage

### Erreur "row-level security"
→ Exécutez les politiques SQL (voir `GUIDE_SUPABASE_STORAGE.md`)

### Erreur "Invalid API key"
→ Vérifiez que vous utilisez la clé **anon**, pas **service_role**

---

**✅ Une fois l'upload réussi, le site sera accessible via l'URL Supabase !**
