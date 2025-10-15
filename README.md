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

```
npm run dev
```

L’API sera disponible sur :
👉 http://localhost:3000/api/linkedin-image

🧪 Tester l’API
✅ Vérifier le healthcheck
curl http://localhost:3000/api/linkedin-image

Réponse attendue :
```bash
{"ok":true,"message":"POST an object to get a PNG back."}
```

🖼️ Générer un post LinkedIn (exemple)
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
    "comments": 45
  }' \
  --output linkedin-post.png
  ```

🔹 Cette commande génère un fichier linkedin-post.png dans le dossier courant.
🔹 Ne pas utiliser -i avec --output, sinon les en-têtes HTTP seront écrits dans le fichier.

🧩 Paramètres de l’API
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

🧠 Notes techniques

L’API utilise Satori pour générer du SVG en mémoire.

Puis Resvg (via @resvg/resvg-js) convertit ce SVG en PNG haute résolution.

Fonctionne uniquement côté runtime Node.js (export const runtime = 'nodejs').

Aucune dépendance externe ni accès à une API distante : tout est calculé localement.