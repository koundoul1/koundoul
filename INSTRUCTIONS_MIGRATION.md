# 🚀 INSTRUCTIONS POUR APPLIQUER LA MIGRATION

## ⚡ MÉTHODE SIMPLE (5 minutes)

### Étape 1 : Ouvrir Supabase
1. Va sur **https://supabase.com/dashboard**
2. Connecte-toi à ton compte
3. Sélectionne ton projet Koundoul

### Étape 2 : Ouvrir SQL Editor
1. Dans le menu de gauche, clique sur **"SQL Editor"**
2. Clique sur **"New query"** (ou le bouton **+**)

### Étape 3 : Copier le SQL
1. Ouvre le fichier **`MIGRATION_SQL_A_EXECUTER.sql`** (dans le dossier racine du projet)
2. **Copie TOUT le contenu** (Ctrl+A puis Ctrl+C)

### Étape 4 : Coller et Exécuter
1. **Colle** le SQL dans l'éditeur Supabase (Ctrl+V)
2. Clique sur le bouton **"Run"** (ou appuie sur Ctrl+Enter)

### Étape 5 : Vérifier
Tu devrais voir :
```
✅ Migration réussie!
✅ Table créée!
```

---

## 📋 CE QUE LA MIGRATION FAIT

1. **Ajoute une colonne `invitationCode`** dans la table `User`
   - Pour générer des codes d'invitation parents

2. **Crée la table `parent_child_links`**
   - Pour lier les comptes parents et enfants

3. **Crée des index**
   - Pour des performances optimales

---

## ✅ APRÈS LA MIGRATION

**Tout fonctionnera automatiquement !**

Les nouveaux endpoints seront actifs :
- `/api/user/generate-invitation-code` - Générer un code
- `/api/parent/add-child` - Lier un enfant
- `/api/parent/children` - Liste des enfants
- `/api/parent/dashboard/:childId` - Dashboard parent

---

## 🆘 EN CAS DE PROBLÈME

### Erreur : "column already exists"
✅ **C'est normal !** La migration a déjà été appliquée. Tout va bien.

### Erreur : "table already exists"
✅ **C'est normal !** La migration a déjà été appliquée. Tout va bien.

### Autre erreur
📧 Copie l'erreur et montre-la moi, je t'aiderai !

---

## 🎯 RÉSUMÉ RAPIDE

```
1. Supabase Dashboard → SQL Editor
2. New Query
3. Copier MIGRATION_SQL_A_EXECUTER.sql
4. Coller et Run
5. ✅ C'est fait !
```

**Temps estimé : 2 minutes** ⏱️

---

*Une fois fait, le système parent-enfant sera complètement fonctionnel !* 🎉









