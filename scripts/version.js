// Incrémente le dernier chiffre de version.txt et recopie la version dans l'en-tête de chaque page.
// Usage : npm run version   (à lancer avant chaque commit)
const fs = require("node:fs");
const path = require("node:path");

const racine = path.join(__dirname, "..");
const fichierVersion = path.join(racine, "version.txt");
const pages = ["index.html", "compte.html", "confidentialite.html", "404.html"];
const motif = /(<span class="version"[^>]*>)[\d.]+(<\/span>)/;

const actuelle = fs.readFileSync(fichierVersion, "utf8").trim();
const morceaux = actuelle.split(".").map(Number);
morceaux[morceaux.length - 1] += 1;
const suivante = morceaux.join(".");

for (const page of pages) {
  const fichier = path.join(racine, page);
  const html = fs.readFileSync(fichier, "utf8");
  if (!motif.test(html)) throw new Error(`Balise version introuvable dans ${page}`);
  fs.writeFileSync(fichier, html.replace(motif, `$1${suivante}$2`));
}
fs.writeFileSync(fichierVersion, suivante + "\n");
console.log(`Version ${actuelle} -> ${suivante}`);
