// Quiz des capitales
// Données : capitales.csv (continent;pays;capitale;note)
// Erreurs par joueur : stockées dans le navigateur (localStorage)

const SIZES = [10, 20, 30, 40, 0]; // 0 = tout
const MAX_ERR = 5;                 // plafond du compteur d'erreurs par pays
const PREFIX = "capitales:";

const $ = id => document.getElementById(id);
const shuffle = a => {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const checks = () => [...document.querySelectorAll("#continents input")];

let DATA = {}, errors = {}, players = [];
let questions, idx, score, total, mode, missed;

// --- Données ---
function parseCSV(txt) {
  const data = {};
  txt.replace(/^﻿/, "").split(/\r?\n/).slice(1).forEach(line => {
    if (!line.trim()) return;
    const [cont, pays, capitale, note = ""] = line.split(";").map(s => s.trim());
    (data[cont] ||= []).push({ pays, capitale, cont, note });
  });
  return data;
}

// --- Stockage navigateur ---
const store = {
  get(k, def) { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
  set(k, v)   { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const nameKey = n => PREFIX + (n.trim().toLowerCase() || "invité");
const playerKey = () => nameKey($("player").value);
const errOf = d => errors[d.pays] || 0;

// --- Joueurs ---
function loadPlayers() {
  let list = store.get(PREFIX + "players", null);
  if (!list) { // 1re ouverture : récupère d'éventuels profils existants
    list = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k.startsWith(PREFIX)) continue;
        const name = k.slice(PREFIX.length);
        if (name !== "last" && name !== "players") list.push(name.charAt(0).toUpperCase() + name.slice(1));
      }
    } catch {}
  }
  return list.length ? list : ["Invité"];
}
const savePlayers = () => store.set(PREFIX + "players", players);

function fillPlayers(selected) {
  $("player").innerHTML = "";
  players.forEach(p => $("player").add(new Option(p, p)));
  $("player").value = players.find(p => p.toLowerCase() === String(selected).toLowerCase()) || players[0];
  loadPlayer();
}

function loadPlayer() {
  errors = store.get(playerKey(), {});
  store.set(PREFIX + "last", $("player").value);
  refresh();
}

// --- Réglages ---
const basePool = () => checks().filter(c => c.checked).flatMap(c => DATA[c.value]);
const quizPool = () => $("errOnly").checked ? basePool().filter(d => errOf(d) > 0) : basePool();

function refresh() {
  const base = basePool(), n = quizPool().length, prev = $("nb").value;
  $("errCount").textContent = base.filter(d => errOf(d) > 0).length;
  $("nb").innerHTML = SIZES.filter(s => s === 0 || s < n)
    .map(s => `<option value="${s}">${s === 0 ? `Tout (${n})` : s}</option>`).join("");
  if ([...$("nb").options].some(o => o.value === prev)) $("nb").value = prev;
  else $("nb").value = n > 10 ? "10" : "0";

  if (!base.length)         $("pool").textContent = "Coche au moins un continent";
  else if (base.length < 4) $("pool").textContent = "Il faut au moins 4 pays dans la sélection";
  else if (!n)              $("pool").textContent = "Aucune erreur à revoir 🎉";
  else                      $("pool").textContent = `${n} capitale${n > 1 ? "s" : ""} dans la sélection`;
  $("go").disabled = base.length < 4 || n === 0;
}

// --- Partie ---
function start() {
  const p = quizPool(), nb = parseInt($("nb").value);
  total = nb === 0 ? p.length : Math.min(nb, p.length);
  // Tirage pondéré : chaque erreur ajoute 2 « billets » au pays, il sort donc plus souvent
  const bag = p.flatMap(d => Array(1 + 2 * errOf(d)).fill(d));
  questions = [...new Set(shuffle(bag))].slice(0, total);
  mode = $("mode").value; idx = 0; score = 0; missed = [];
  $("menu").classList.add("hidden");
  $("quiz").classList.remove("hidden");
  show();
}

function show() {
  const q = questions[idx];
  const dir = mode === "mix" ? (Math.random() < .5 ? "p2c" : "c2p") : mode;
  const askCapital = dir === "p2c";
  $("num").textContent = `Question ${idx + 1}/${total}`;
  $("score").textContent = `Score : ${score}`;
  $("question").textContent = askCapital
    ? `Quelle est la capitale de : ${q.pays} ?`
    : `${q.capitale} est la capitale de quel pays ?`;
  $("info").textContent = "";
  $("note").textContent = "";
  $("next").classList.add("hidden");

  // Fausses réponses tirées des continents cochés, sans doublon de libellé
  const key = askCapital ? "capitale" : "pays";
  const seen = new Set([q[key]]), wrong = [];
  for (const d of shuffle(basePool())) {
    if (!seen.has(d[key])) { seen.add(d[key]); wrong.push(d); }
    if (wrong.length === 3) break;
  }
  $("options").innerHTML = "";
  shuffle([q, ...wrong]).forEach(c => {
    const b = document.createElement("button");
    b.textContent = c[key];
    b.onclick = () => answer(b, c[key] === q[key], q, key);
    $("options").appendChild(b);
  });
}

function answer(btn, good, q, key) {
  document.querySelectorAll("#options button").forEach(b => {
    b.disabled = true;
    if (b.textContent === q[key]) b.classList.add("ok");
  });
  if (good) {
    score++;
    if (errors[q.pays] > 1) errors[q.pays]--; else delete errors[q.pays];
  } else {
    btn.classList.add("ko");
    errors[q.pays] = Math.min(errOf(q) + 1, MAX_ERR);
    missed.push(q);
  }
  store.set(playerKey(), errors);
  $("score").textContent = `Score : ${score}`;
  $("info").textContent = `${q.capitale} — ${q.pays} (${q.cont})`;
  $("note").textContent = q.note;
  $("next").textContent = idx === total - 1 ? "Voir le résultat" : "Suivant";
  $("next").classList.remove("hidden");
}

function next() {
  idx++;
  if (idx < total) return show();
  $("quiz").classList.add("hidden");
  $("end").classList.remove("hidden");
  $("final").textContent = `${score} / ${total}`;
  const r = score / total;
  $("comment").textContent = r >= .9 ? "Excellent 🔥" : r >= .6 ? "Bien joué, encore un tour !" : "On continue de s'entraîner 💪";
  $("missed").innerHTML = missed.length
    ? "<p>À revoir :</p><ul>" + missed.map(d => `<li>${d.pays} ➜ <b>${d.capitale}</b></li>`).join("") + "</ul>"
    : "";
}

// --- Évènements ---
$("go").onclick = start;
$("next").onclick = next;
$("again").onclick = () => {
  $("end").classList.add("hidden");
  $("menu").classList.remove("hidden");
  refresh();
};
$("errOnly").onchange = refresh;
$("all").onclick  = () => { checks().forEach(c => c.checked = true);  refresh(); };
$("none").onclick = () => { checks().forEach(c => c.checked = false); refresh(); };
$("player").onchange = loadPlayer;
$("newPlayer").onclick = () => {
  const n = (prompt("Prénom du nouveau joueur ?") || "").trim().slice(0, 20);
  if (!n) return;
  const existing = players.find(p => p.toLowerCase() === n.toLowerCase());
  if (!existing) { players.push(n); players.sort((a, b) => a.localeCompare(b, "fr")); savePlayers(); }
  fillPlayers(existing || n);
};
$("delPlayer").onclick = () => {
  const p = $("player").value;
  if (!confirm(`Supprimer le joueur « ${p} » et toutes ses erreurs ?`)) return;
  try { localStorage.removeItem(playerKey()); } catch {}
  players = players.filter(x => x !== p);
  if (!players.length) players = ["Invité"];
  savePlayers();
  fillPlayers(players[0]);
};
$("reset").onclick = () => {
  if (!confirm("Effacer toutes les erreurs de ce joueur ?")) return;
  errors = {};
  store.set(playerKey(), errors);
  refresh();
};

// --- Démarrage ---
async function init() {
  try {
    const res = await fetch("capitales.csv");
    if (!res.ok) throw new Error(res.status);
    DATA = parseCSV(await res.text());
  } catch {
    $("pool").textContent = "Impossible de charger capitales.csv : ouvre la page via un serveur web (Apache, Live Server…).";
    return;
  }
  $("continents").innerHTML = Object.keys(DATA).map(c =>
    `<label class="cb"><input type="checkbox" value="${c}" checked> ${c} <small>${DATA[c].length}</small></label>`).join("");
  checks().forEach(c => c.onchange = refresh);
  players = loadPlayers();
  savePlayers();
  fillPlayers(store.get(PREFIX + "last", ""));
}
init();
