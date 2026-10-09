# 🌍 Quiz des capitales

Quiz web pour apprendre les capitales du monde, continent par continent.
HTML, CSS et JavaScript, sans framework ni dépendance.

## Fonctionnalités

- 197 pays : les 193 membres de l'ONU, plus le Vatican, la Palestine, le Kosovo et Taïwan
- 6 continents au choix (Amérique du Nord et Amérique du Sud séparées)
- 10, 20, 30, 40 questions ou toutes
- 3 modes : Pays ➜ Capitale, Capitale ➜ Pays, Mélangé
- Profils joueurs avec suivi des erreurs : un pays raté revient plus souvent
- Mode « Seulement les pays ratés » pour réviser
- Précisions après certaines réponses (capitales multiples, cas particuliers)

## Structure

```
index.html      Page
style.css       Mise en forme
script.js       Logique du quiz
capitales.csv   Données
```

## Données

Les pays sont dans `capitales.csv` (UTF-8, séparateur `;`) :

```
continent;pays;capitale;note
Amérique du Sud;Bolivie;La Paz;Siège du gouvernement. Sucre est la capitale constitutionnelle.
```

Pour ajouter ou corriger un pays, il suffit de modifier une ligne. La note est facultative et ne doit pas contenir de `;`.

## Lancer en local

Le CSV est chargé avec `fetch()` : ouvrir `index.html` directement ne fonctionne pas, il faut un serveur web.

```bash
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000 (ou utiliser l'extension Live Server de VS Code).

## Données personnelles

Les profils et les erreurs restent dans le navigateur (localStorage). Aucune donnée de jeu n'est envoyée à un serveur.

## Auteur

Romain Blanloeil — [romain.blanloeil.com](https://romain.blanloeil.com)
