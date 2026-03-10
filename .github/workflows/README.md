# Simulateur Immobilier — Baptiste & Daphné Immobilier

Outil interactif de simulation d'accessibilité au marché immobilier chambérien.

---

## Installation & démarrage

### Prérequis
- [Node.js](https://nodejs.org/) version 18 ou supérieure

### Étapes

```bash
# 1. Décompressez le dossier, puis ouvrez un terminal dedans
cd simulateur-immo

# 2. Installez les dépendances
npm install

# 3. Lancez en mode développement (prévisualisation locale)
npm run dev
# → Ouvrez http://localhost:5173 dans votre navigateur

# 4. Construisez pour la production
npm run build
# → Génère un dossier "dist/" prêt à uploader
```

---

## Déploiement sur votre hébergeur

Après `npm run build`, uploadez **tout le contenu** du dossier `dist/` à la racine
de votre espace web (ou dans un sous-dossier de votre choix).

### Si vous hébergez dans un sous-dossier
Par exemple `https://baptistedaphneimmo.com/simulateur/` :

1. Ouvrez `vite.config.js`
2. Décommentez et adaptez la ligne :
   ```js
   base: '/simulateur/',
   ```
3. Relancez `npm run build`

### Hébergeurs compatibles
OVH, Infomaniak, o2switch, Ionos, Netlify, Vercel, GitHub Pages…
Il suffit d'uploader le dossier `dist/` via FTP ou l'interface de votre hébergeur.

---

## Structure du projet

```
simulateur-immo/
├── index.html          ← Point d'entrée HTML (polices, reset CSS)
├── vite.config.js      ← Configuration Vite
├── package.json        ← Dépendances
└── src/
    ├── main.jsx        ← Montage React
    └── App.jsx         ← Tout le simulateur (composant principal + sous-composants)
```

---

## Personnalisation rapide

Toutes les couleurs de la charte sont dans `src/App.jsx`, objet `C` en haut du fichier.
Les données CSP et salaires sont dans le tableau `CSP_DATA`.

---

Sources des données : INSEE RP2022 commune 73065 · SAL G1 2023 · Règle HCSF 35 %
