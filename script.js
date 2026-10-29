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

  apps.forEach(function (app) {
    var carte = document.createElement("article");
    carte.className = "carte";

    var titre = document.createElement("h3");
    titre.textContent = app.nom;

    var description = document.createElement("p");
    description.textContent = app.description;

    var lien = document.createElement("a");
    lien.className = "bouton";
    lien.href = app.url;
    lien.rel = "noopener";
    lien.appendChild(document.createTextNode("Ouvrir"));
    var precision = document.createElement("span");
    precision.className = "visually-hidden";
    precision.textContent = " " + app.nom;
    lien.appendChild(precision);

    var texte = document.createElement("div");
    texte.appendChild(titre);
    texte.appendChild(description);
    carte.appendChild(texte);
    carte.appendChild(lien);
    liste.appendChild(carte);
  });

  var libre = document.createElement("div");
  libre.className = "carte libre";
  libre.textContent = "Lame libre : la prochaine app s'ouvrira ici.";
  liste.appendChild(libre);
})();
