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

    carte.appendChild(titre);
    carte.appendChild(description);
    carte.appendChild(lien);
    liste.appendChild(carte);
  });
})();
