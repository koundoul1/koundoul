# Création des icônes PWA

## Instructions

Pour créer les icônes PWA, vous avez deux options :

### Option 1 : Utiliser un générateur en ligne (Recommandé)

1. Aller sur https://realfavicongenerator.net/ ou https://www.pwabuilder.com/imageGenerator
2. Uploader votre logo (format PNG, minimum 512x512px)
3. Générer les icônes
4. Télécharger et placer dans ce dossier `frontend/public/icons/`

### Option 2 : Créer manuellement avec un outil

Utiliser GIMP, Photoshop ou Figma pour créer :

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

### Option 3 : Utiliser le logo Koundoul par défaut

Créer un logo simple avec les initiales "K" sur fond bleu :

```
Background: Bleu (#2563eb)
Text: "K" blanc en gras
Tailles: 144x144, 192x192, 512x512
```

## Fichiers nécessaires

```
icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
└── icon-512x512.png
```

## Temporaire : Désactiver PWA

En attendant de créer les icônes, vous pouvez désactiver le PWA en commentant :

**Dans `frontend/src/App.jsx`** :
```javascript
// import OfflineIndicator from './components/OfflineIndicator'
// ...
// <OfflineIndicator />
```

**Dans `frontend/public/index.html`** :
```html
<!-- <link rel="manifest" href="/manifest.json"> -->
```


