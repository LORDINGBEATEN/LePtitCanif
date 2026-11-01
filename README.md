# Le p'tit Canif

Site « chapeau » de la suite d'applications **Le p'tit Canif** : de petites applications web gratuites, indépendantes côté code et données, qui partagent un même compte (un seul projet Supabase). Ce site donne un lieu et une explication à cette marque.

Site statique : HTML, CSS et JavaScript vanilla, sans build, sans dépendance, sans base de données, sans cookie ni traceur.

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | Accueil : cartes des apps (tableau JSON en tête de fichier), explication du compte unique |
| `compte.html` | « Votre compte Le p'tit Canif » : partagé / séparé, mot de passe, suppression, FAQ |
| `confidentialite.html` | Confidentialité et mentions légales communes |
| `404.html` | Page d'erreur (liens absolus depuis la racine) |
| `style.css` | Feuille de style unique (variables CSS, mode sombre automatique) |
| `script.js` | Affiche les cartes à partir du JSON de `index.html` |
| `logo.svg`, `icon-192.png`, `icon-512.png`, `manifest.webmanifest` | Identité visuelle |
| `fonts/` | Nunito et Newsreader (woff2 locaux) et leurs licences OFL (`OFL-Nunito.txt`, `OFL-Newsreader.txt`) |
| `vercel.json` | `cleanUrls`, en-têtes de sécurité, CSP stricte |
| `version.txt`, `scripts/version.js` | Numéro de version affiché sous le titre, dans l'en-tête de chaque page ; `npm run version` l'incrémente |
| `tests/` | Tests `node --test` (structure, liens, nom, secrets, URL des apps, contrastes) |

## Ajouter une app

Dans `index.html`, ajouter une ligne au tableau JSON `#apps-data` :

```json
{ "nom": "Nouvelle app", "description": "Une ligne de description.", "url": "https://exemple.vercel.app" }
```

L'URL doit être en **https**. La carte apparaît toute seule. Pensez aussi à ajouter l'URL de l'app dans Supabase (Authentication → URL Configuration) pour que les liens de confirmation d'e-mail y reviennent.

## Tests

Node 20 ou plus, aucune dépendance :

```bash
node --test
```

Le workflow `.github/workflows/tests.yml` lance les mêmes tests à chaque push.

## Déployer sur Vercel

1. Pousser le dossier dans un dépôt Git (ou utiliser la CLI Vercel).
2. Dans Vercel : **Add New → Project**, importer le dépôt.
3. Framework Preset : **Other** ; laisser vides la commande de build et le dossier de sortie (la racine est servie telle quelle).
4. Déployer, puis (facultatif) ajouter votre domaine dans **Settings → Domains**.

## Reste à faire avant la mise en ligne

Remplacer les URL provisoires (`a-completer.invalid`) dans `index.html`, puis traiter chaque marqueur `À COMPLÉTER` (`grep -rn "À COMPLÉTER" *.html`). Si l'e-mail de contact est ajouté au code, l'ajouter aussi à `EMAILS_AUTORISES` dans `tests/site.test.js`.

## Licences

Polices Nunito et Newsreader : SIL Open Font License 1.1, voir `fonts/OFL-Nunito.txt` et `fonts/OFL-Newsreader.txt`.
