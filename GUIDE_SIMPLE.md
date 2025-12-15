# 🎯 Guide Simple - Pousser vers GitHub

## ✅ Ce que vous avez

- ✅ Votre code est prêt (5 commits locaux)
- ✅ Vous avez un dépôt GitHub : `koundoul` (chez koundoul1)
- ⚠️ Le dépôt GitHub n'est pas encore connecté à votre code local

## 🎯 Ce qu'il faut faire

**En 2 commandes simples :**

```powershell
# 1. Connecter votre code local au dépôt GitHub
git remote add origin https://github.com/koundoul1/koundoul.git

# 2. Envoyer votre code vers GitHub
git push -u origin main
```

C'est tout ! 🎉

## ⚠️ Si le dépôt GitHub n'est pas vide

Si GitHub vous dit que le dépôt n'est pas vide, utilisez cette commande à la place :

```powershell
git push -u origin main --force
```

⚠️ **Attention** : `--force` va écraser ce qui est sur GitHub. Utilisez-le seulement si vous êtes sûr.

## 📝 Résumé

1. Ouvrez PowerShell dans le dossier `c:\Users\conta\koundoul`
2. Copiez-collez les 2 commandes ci-dessus
3. C'est terminé !

## ❓ Questions fréquentes

**Q : Pourquoi ça ne marche pas ?**
- Vérifiez que vous êtes bien dans le dossier `c:\Users\conta\koundoul`
- Vérifiez que le dépôt GitHub existe : https://github.com/koundoul1/koundoul

**Q : J'ai une erreur d'authentification ?**
- GitHub vous demandera de vous connecter
- Suivez les instructions à l'écran

**Q : Le dépôt existe déjà sur GitHub ?**
- C'est normal, vous allez juste mettre à jour ce dépôt avec votre nouveau code
