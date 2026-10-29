"use strict";
// Vérifie numériquement les contrastes WCAG (AA) des couples de couleurs définis dans style.css.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const css = fs.readFileSync(path.join(__dirname, "..", "style.css"), "utf8");

function variables(bloc) {
  const v = {};
  for (const m of bloc.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\b/g)) v[m[1]] = m[2];
  return v;
}

const clair = variables(css.match(/:root\s*{([^}]*)}/)[1]);
const sombre = { ...clair, ...variables(css.match(/prefers-color-scheme: dark\)\s*{\s*:root\s*{([^}]*)}/)[1]) };

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// [premier plan, arrière-plan, minimum] — 4,5 pour le texte, 3 pour les éléments graphiques.
const couples = [
  ["text", "bg", 4.5], ["text", "surface", 4.5],
  ["muted", "bg", 4.5], ["muted", "surface", 4.5],
  ["link", "bg", 4.5], ["link", "surface", 4.5],
  ["btn-fg", "btn-bg", 4.5],
  ["mark-fg", "mark-bg", 4.5],
  ["focus", "bg", 3], ["focus", "surface", 3],
  ["border", "bg", 1.5],
];

for (const [nom, theme] of [["clair", clair], ["sombre", sombre]]) {
  for (const [fg, bg, min] of couples) {
    test(`contraste ${nom} : ${fg} sur ${bg} ≥ ${min}`, (t) => {
      const r = ratio(theme[fg], theme[bg]);
      t.diagnostic(`${theme[fg]} sur ${theme[bg]} = ${r.toFixed(2)}:1`);
      assert.ok(r >= min, `${r.toFixed(2)}:1 < ${min}:1`);
    });
  }
}
