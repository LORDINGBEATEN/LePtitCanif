// Incrémente le dernier chiffre de version.txt et recopie la version dans index.html.
// Usage : npm run version   (à lancer avant chaque commit)
const fs = require("node:fs");
const path = require("node:path");

const racine = path.join(__dirname, "..");
const fichierVersion = path.join(racine, "version.txt");
const fichierAccueil = path.join(racine, "index.html");
const motif = /(<p class="version">Version )[\d.]+(<\/p>)/;

const actuelle = fs.readFileSync(fichierVersion, "utf8").trim();
const morceaux = actuelle.split(".").map(Number);
morceaux[morceaux.length - 1] += 1;
const suivante = morceaux.join(".");

const html = fs.readFileSync(fichierAccueil, "utf8");
if (!motif.test(html)) throw new Error('Balise <p class="version"> introuvable dans index.html');
fs.writeFileSync(fichierAccueil, html.replace(motif, `$1${suivante}$2`));
fs.writeFileSync(fichierVersion, suivante + "\n");
console.log(`Version ${actuelle} -> ${suivante}`);
