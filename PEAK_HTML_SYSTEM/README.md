# 🎯 Système de Gestion HTML - Peak

Système complet pour générer et gérer des sites HTML via Claude AI et Supabase Storage.

## 📁 Structure des fichiers

```
PEAK_HTML_SYSTEM/
├── lib/
│   ├── prompt-builder.ts      # Génération de prompts pour Claude
│   └── supabase-html.ts       # Gestion Supabase Storage
├── components/
│   ├── PromptCopyCard.tsx     # Composant pour copier le prompt
│   └── HTMLUploadCard.tsx     # Composant pour uploader HTML
├── app/
│   ├── api/
│   │   └── upload-html/
│   │       └── route.ts        # API route pour upload
│   └── generer/
│       └── [numeroDossier]/
│           └── page.tsx       # Page principale de génération
└── README.md
```

## 🚀 Installation

### 1. Copier les fichiers dans votre projet Next.js 14

```bash
# Copier tous les fichiers dans votre projet Next.js
cp -r PEAK_HTML_SYSTEM/lib/* votre-projet/lib/
cp -r PEAK_HTML_SYSTEM/components/* votre-projet/components/
cp -r PEAK_HTML_SYSTEM/app/* votre-projet/app/
```

### 2. Installer les dépendances

```bash
npm install @supabase/supabase-js
```

### 3. Configurer Supabase

Ajoutez dans votre `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

### 4. Créer le bucket Supabase Storage

1. Allez sur [supabase.com](https://supabase.com) → votre projet
2. Allez dans **Storage**
3. Créez un nouveau bucket nommé `sites-html`
4. Rendez-le **Public** (pour accès direct aux fichiers HTML)

### 5. Adapter la fonction `getInscription()`

Dans `app/generer/[numeroDossier]/page.tsx`, remplacez la fonction `getInscription()` par votre vraie logique de récupération de données :

```typescript
async function getInscription(numeroDossier: string): Promise<InscriptionData> {
  // Exemple avec Supabase
  const { data, error } = await supabase
    .from('inscriptions')
    .select('*')
    .eq('numero_dossier', numeroDossier)
    .single()
  
  if (error) throw new Error('Inscription non trouvée')
  return data
}
```

## 📖 Utilisation

### Workflow complet

1. **Accéder à la page de génération**
   ```
   http://localhost:3000/generer/PK-4358
   ```

2. **Copier le prompt**
   - Cliquez sur "📋 Copier le prompt"
   - Le prompt est copié dans le presse-papier

3. **Générer avec Claude**
   - Ouvrez [claude.ai](https://claude.ai/new)
   - Collez le prompt
   - Attendez la génération du HTML
   - Téléchargez le fichier HTML

4. **Uploader le HTML**
   - Retournez sur la page `/generer/PK-4358`
   - Glissez-déposez le fichier HTML
   - Cliquez sur "🚀 Mettre en ligne maintenant"

5. **Site en ligne !**
   - Le site est accessible via l'URL Supabase Storage
   - Vous pouvez le prévisualiser directement

## 🔧 Configuration

### Personnaliser les couleurs par catégorie

Modifiez la fonction `getCategoryColors()` dans `lib/prompt-builder.ts` :

```typescript
function getCategoryColors(categorie: string): string {
  const colors: Record<string, string> = {
    'Votre catégorie': 'Description des couleurs',
    // ...
  }
  return colors[categorie] || colors['Services professionnels']
}
```

### Modifier la taille max des fichiers

Dans `components/HTMLUploadCard.tsx`, ligne 30 :

```typescript
if (file.size > 10 * 1024 * 1024) { // Modifier 10 pour changer la limite
```

## ✅ Checklist après installation

- [ ] Fichiers copiés dans le projet Next.js
- [ ] Dépendances installées (`@supabase/supabase-js`)
- [ ] Variables d'environnement configurées
- [ ] Bucket `sites-html` créé dans Supabase (Public)
- [ ] Fonction `getInscription()` adaptée à votre DB
- [ ] Test de la page `/generer/PK-4358`
- [ ] Test du workflow complet (copie → Claude → upload)

## 🐛 Résolution de problèmes

### Erreur "Bucket not found"
- Vérifiez que le bucket `sites-html` existe dans Supabase Storage
- Vérifiez qu'il est marqué comme **Public**

### Erreur d'upload
- Vérifiez les variables d'environnement Supabase
- Vérifiez les permissions du bucket (doit être public)

### Prompt ne se copie pas
- Vérifiez que vous êtes en HTTPS ou localhost
- Le clipboard API nécessite un contexte sécurisé

## 📝 Notes

- Les fichiers HTML sont stockés avec le nom `{numeroDossier}.html`
- Les fichiers existants sont écrasés (upsert: true)
- Taille max recommandée : 10MB par fichier HTML
- Les URLs Supabase Storage sont permanentes

---

**🎉 Système prêt à l'emploi !**
