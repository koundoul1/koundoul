# 🗄️ Configuration Supabase - Koundoul

## Étapes pour configurer Supabase

### 1. Créer un compte Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Connectez-vous avec GitHub
4. Créez un nouveau projet

### 2. Configurer le projet
- **Nom du projet :** `koundoul`
- **Mot de passe de la base de données :** Choisissez un mot de passe fort
- **Région :** Choisissez la plus proche (Europe West pour la France)

### 3. Récupérer les informations de connexion
1. Allez dans **Settings** > **Database**
2. Copiez la **Connection string** (URI)
3. Allez dans **Settings** > **API**
4. Copiez la **anon public** key et **service_role** key

### 4. URL de connexion
L'URL ressemble à :
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 5. Variables d'environnement
Créez un fichier `.env` dans le dossier `backend/` avec :
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_KEY="[SERVICE-KEY]"
```

### 6. Synchroniser le schéma
```bash
npm run db:push
npm run db:seed
```

## ✅ Votre base de données est prête !


