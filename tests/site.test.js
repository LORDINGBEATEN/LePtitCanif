"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const PAGES = ["index.html", "compte.html", "confidentialite.html", "404.html"];
const NOM = "Le p'tit Canif";
// Seules adresses e-mail autorisées dans le dépôt (ajouter ici l'e-mail de contact une fois connu).
const EMAILS_AUTORISES = [];

const lire = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

function fichiersTexte(dir = ROOT, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "node_modules") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) fichiersTexte(p, acc);
    else if (/\.(html|css|js|json|svg|md|yml|webmanifest|txt)$/.test(e.name) && !p.includes(`${path.sep}fonts${path.sep}`)) {
      acc.push(p);
    }
  }
  return acc;
}

for (const page of PAGES) {
  test(`${page} : title, lang, un seul h1, lien d'évitement`, () => {
    assert.ok(fs.existsSync(path.join(ROOT, page)), "fichier manquant");
    const html = lire(page);
    assert.match(html, /<title>[^<]+<\/title>/, "title manquant");
    assert.match(html, /<html[^>]*\blang="fr"/, 'lang="fr" manquant');
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, "il faut exactement un h1");
    assert.match(html, /href="#contenu"/, "lien d'évitement manquant");
    assert.match(html, /id="contenu"/, "cible du lien d'évitement manquante");
  });

  test(`${page} : pas de style ni de script en ligne (compatible CSP stricte)`, () => {
    const html = lire(page);
    assert.doesNotMatch(html, /<style[\s>]/);
    assert.doesNotMatch(html, /\sstyle=/);
    assert.doesNotMatch(html, /\son[a-z]+=/i);
    for (const m of html.matchAll(/<script\b([^>]*)>/g)) {
      assert.ok(/\bsrc=/.test(m[1]) || /type="application\/json"/.test(m[1]), `script en ligne : ${m[0]}`);
    }
  });

  test(`${page} : titres dans un ordre logique et images avec alt`, () => {
    const html = lire(page);
    let precedent = 0;
    for (const m of html.matchAll(/<h([1-6])[\s>]/g)) {
      const n = Number(m[1]);
      assert.ok(n <= precedent + 1, `saut de niveau de titre : h${precedent} puis h${n}`);
      precedent = n;
    }
    for (const m of html.matchAll(/<img\b[^>]*>/g)) assert.match(m[0], /\balt=/, `img sans alt : ${m[0]}`);
  });
}

test("tous les liens internes pointent vers un fichier existant", () => {
  const sources = [...PAGES, "style.css", "manifest.webmanifest"];
  for (const f of sources) {
    const contenu = lire(f);
    const refs = [
      ...[...contenu.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]),
      ...[...contenu.matchAll(/url\("?([^")]+)"?\)/g)].map((m) => m[1]),
      ...[...contenu.matchAll(/"src":\s*"([^"]+)"/g)].map((m) => m[1]),
    ];
    for (const ref of refs) {
      if (/^(https?:|mailto:|tel:|data:)/.test(ref)) continue;
      if (ref.startsWith("#")) {
        assert.match(contenu, new RegExp(`id="${ref.slice(1)}"`), `${f} : ancre ${ref} introuvable`);
        continue;
      }
      const cible = ref.split(/[?#]/)[0];
      const base = f === "style.css" ? ROOT : ROOT;
      const chemin = cible === "/" || cible === "./" ? "index.html" : cible.replace(/^\//, "");
      assert.ok(fs.existsSync(path.join(base, chemin)), `${f} : lien cassé vers ${ref}`);
    }
  }
});

test(`le nom s'écrit toujours « ${NOM} »`, () => {
  const variante = /p['’‘`]?\s?tit\s+canif|petit\s+canif/gi;
  for (const f of fichiersTexte()) {
    const t = fs.readFileSync(f, "utf8");
    for (const m of t.matchAll(variante)) {
      const debut = t.slice(Math.max(0, m.index - 3), m.index);
      assert.equal(debut + m[0], NOM, `${path.relative(ROOT, f)} : variante « ${debut + m[0]} »`);
    }
  }
});

test("aucun marqueur de secret ou de clé", () => {
  const motifs = [
    /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/, // JWT (clés Supabase anon/service)
    /service_role/i,
    /sb_(publishable|secret)_/i,
    /sk_(live|test)_[A-Za-z0-9]+/,
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /[a-z0-9]{20}\.supabase\.co/i,
    /\b(api[_-]?key|secret|token|password|mot_de_passe)\s*[:=]\s*["'][^"']{6,}/i,
  ];
  for (const f of fichiersTexte()) {
    if (f.endsWith("site.test.js")) continue;
    const t = fs.readFileSync(f, "utf8");
    for (const re of motifs) assert.doesNotMatch(t, re, `${path.relative(ROOT, f)} : motif suspect ${re}`);
  }
});

test("aucune adresse e-mail hors liste autorisée", () => {
  for (const f of fichiersTexte()) {
    if (f.endsWith("site.test.js") || f.includes(`${path.sep}.github${path.sep}`)) continue;
    const t = fs.readFileSync(f, "utf8");
    for (const m of t.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) {
      assert.ok(EMAILS_AUTORISES.includes(m[0]), `${path.relative(ROOT, f)} : e-mail non autorisé ${m[0]}`);
    }
  }
});

test("le tableau des apps ne contient que des URL en https", (t) => {
  const html = lire("index.html");
  const m = html.match(/<script type="application\/json" id="apps-data">([\s\S]*?)<\/script>/);
  assert.ok(m, "bloc #apps-data introuvable");
  const apps = JSON.parse(m[1]);
  assert.ok(Array.isArray(apps) && apps.length > 0);
  for (const app of apps) {
    assert.ok(app.nom && app.description && app.url, `entrée incomplète : ${JSON.stringify(app)}`);
    const u = new URL(app.url);
    assert.equal(u.protocol, "https:", `${app.nom} : l'URL doit être en https`);
    if (u.hostname.endsWith(".invalid")) t.diagnostic(`ATTENTION : URL provisoire pour ${app.nom} (${app.url})`);
  }
});

test("les marqueurs « À COMPLÉTER » restants sont comptés (information)", (t) => {
  let n = 0;
  for (const f of [...PAGES, "README.md"]) n += (lire(f).match(/À COMPLÉTER/g) || []).length;
  t.diagnostic(`${n} marqueur(s) « À COMPLÉTER » à traiter avant la mise en ligne`);
});

test("la version affichée sur l'accueil correspond à version.txt", () => {
  const version = fs.readFileSync(path.join(__dirname, "..", "version.txt"), "utf8").trim();
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.match(version, /^\d+\.\d+\.\d+$/);
  assert.ok(html.includes(`<p class="version">Version ${version}</p>`), "index.html n'affiche pas la version de version.txt");
});
