# 🧩 LinkedIn Post Generator API

Une API **Next.js** permettant de **générer dynamiquement une image PNG** simulant un post LinkedIn.  
Elle supporte le markdown simple (**gras**, *italique*, [liens](#)), l’affichage du nom, prénom, photo de profil, intitulé, nombre de réactions/commentaires et tout le **cadre visuel d’un post LinkedIn**.

Cette API peut être utilisée pour :
- Créer des aperçus d’articles LinkedIn pour un site web ou un blog,
- Générer des visuels dynamiques (Open Graph images),
- Simuler des posts pour des mockups ou présentations.

---

## ⚙️ Technologies utilisées

- **Next.js App Router** (API route `/api/linkedin-image`)
- **Satori** → rendu SVG depuis un arbre React-like
- **@resvg/resvg-js** → conversion SVG → PNG haute qualité
- **Node.js runtime**
- **TypeScript**
- **Fonts locales (Inter)**

---

## 🚀 Lancer le projet en local

### 1. Installation

```bash
git clone https://github.com/<ton_repo>/linkedin-post-generator-api.git
cd linkedin-post-generator-api
npm install
```

## 2. Structure minimale

```bash
src/
  app/
    api/
      linkedin-image/
        route.ts     ← API principale
public/
  fonts/
    Inter-Regular.ttf
    Inter-Bold.ttf
next.config.mjs
```

⚠️ Les fichiers de police sont obligatoires.
Télécharge les polices Inter depuis https://fonts.google.com/specimen/Inter et place-les dans public/fonts/.

## 3. Lancer le serveur

```bash
npm run dev
```

L’API sera disponible sur :
👉 [http://localhost:3000/api/linkedin-image](http://localhost:3000/api/linkedin-image)

## 4. 🧪 Tester l’API

### ✅ Vérifier le healthcheck

curl [http://localhost:3000/api/linkedin-image](http://localhost:3000/api/linkedin-image)

Réponse attendue :

```bash
{"ok":true,"message":"POST an object to get a PNG back."}
```

### 🖼️ Générer un post LinkedIn (exemple)

```bash
curl -sS -X POST http://localhost:3000/api/linkedin-image \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alex",
    "lastName": "Martin",
    "headline": "Software Engineer @Example",
    "timeAgo": "2 h",
    "textMarkdown": "Hello **LinkedIn**! This is *awesome* 🚀",
    "reactions": 123,
    "comments": 45,
    "reposts": 12
  }' \
  --output linkedin-post.png
  ```

🔹 Cette commande génère un fichier linkedin-post.png dans le dossier courant.
🔹 Ne pas utiliser -i avec --output, sinon les en-têtes HTTP seront écrits dans le fichier.

### 🖼️ Exemple 2 – Avec photo de profil distante

```bash
curl -sS -X POST http://localhost:3000/api/linkedin-image \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Nina",
    "lastName": "Robert",
    "headline": "Product Designer",
    "textMarkdown": "New **UI Kit** ready for launch ✨",
    "reactions": 120,
    "comments": 18,
    "reposts": 5,
    "profileImageUrl": "https://picsum.photos/200"
  }' \
  --output linkedin-post-photo.png
```

### 🧩 Exemple 3 – Avatar via SVG inline

```bash
curl -sS -X POST http://localhost:3000/api/linkedin-image \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Nina",
    "lastName": "Robert",
    "headline": "Product Designer",
    "textMarkdown": "Avatar via **inline SVG**",
    "profileSvgMarkup": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"64\" height=\"64\" viewBox=\"0 0 64 64\"><circle cx=\"32\" cy=\"32\" r=\"32\" fill=\"#E5E7EB\"/><text x=\"50%\" y=\"52%\" dominant-baseline=\"middle\" text-anchor=\"middle\" font-family=\"Inter,Arial\" font-size=\"28\" fill=\"#374151\">NR</text></svg>"
  }' \
  --output linkedin-post-svg.png
```

### 🧩 Exemple 4 – Avatar depuis un fichier public

```bash
curl -sS -X POST http://localhost:3000/api/linkedin-image \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Nina",
    "lastName": "Robert",
    "headline": "Product Designer",
    "textMarkdown": "Avatar depuis **/public/icons/avatar-default.svg**",
    "profileSvgPublicPath": "icons/avatar-default.svg"
  }' \
  --output linkedin-post-public.png
```

### 🧩 Paramètres de l’API

Champ	Type	Obligatoire	Description
firstName	string	✅	Prénom de l’auteur
lastName	string	✅	Nom de l’auteur
headline	string	❌	Intitulé de poste
profileImageUrl	string (URL)	❌	Photo de profil (optionnelle)
timeAgo	string	❌	Ex. "1 h", "2 j", etc.
textMarkdown	string	✅	Corps du post (markdown léger supporté)
reactions	number	❌	Nombre de réactions
comments	number	❌	Nombre de commentaires
theme	object	❌	Personnalisation des couleurs
size	object	❌	Largeur/hauteur personnalisées

Exemple :

```bash
    {
    "theme": {
        "background": "#F3F2EF",
        "card": "#FFFFFF",
        "text": "#1D2226"
    },
    "size": {
        "width": 1080,
        "height": 1350
    }
    }
```

## 🧠 Notes techniques

L’API utilise Satori pour générer du SVG en mémoire.

Puis Resvg (via @resvg/resvg-js) convertit ce SVG en PNG haute résolution.

Fonctionne uniquement côté runtime Node.js (export const runtime = 'nodejs').

Aucune dépendance externe ni accès à une API distante : tout est calculé localement.