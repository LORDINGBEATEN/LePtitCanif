// Affiche les cartes des apps à partir du bloc JSON #apps-data de index.html.
(function () {
  "use strict";
  var source = document.getElementById("apps-data");
  var liste = document.getElementById("apps-liste");
  if (!source || !liste) return;

  var apps;
  try {
    apps = JSON.parse(source.textContent);
  } catch (e) {
    return;
  }

  apps.forEach(function (app, i) {
    var carte = document.createElement("article");
    carte.className = "carte";
    carte.style.setProperty("--i", i);

    var titre = document.createElement("h3");
    titre.textContent = app.nom;

    var description = document.createElement("p");
    description.textContent = app.description;

    var lien = document.createElement("a");
    lien.className = "bouton";
    lien.href = app.url;
    lien.target = "_blank";
    lien.rel = "noopener noreferrer";
    lien.appendChild(document.createTextNode("Ouvrir"));
    var precision = document.createElement("span");
    precision.className = "visually-hidden";
    precision.textContent = " " + app.nom + " (s'ouvre dans un nouvel onglet)";
    lien.appendChild(precision);

    var numero = document.createElement("span");
    numero.className = "num";
    numero.textContent = "N° " + (i + 1);

    var texte = document.createElement("div");
    texte.appendChild(numero);
    texte.appendChild(titre);
    texte.appendChild(description);
    carte.appendChild(texte);
    carte.appendChild(lien);
    liste.appendChild(carte);
  });
})();
