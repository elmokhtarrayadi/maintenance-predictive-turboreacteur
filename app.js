(() => {
  const $ = (s) => document.querySelector(s);
  const fmt = (v, d = 1) => v.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });

  /* ---------- Causes critiques (Pareto) ---------- */
  const CRIT = [
    ['Détérioration de la chambre de combustion', 'MM02 · Cœur'],
    ['Usure des bagues (bushing)', 'MM01 · Fan & Booster'],
    ['Fuite d’huile', 'MM02 · Cœur'],
    ['Problème MCD', 'MM02 · Cœur'],
    ['Détérioration des aubes de turbine HP', 'MM02 · Cœur'],
    ['Ingestion de corps étrangers (FOD)', 'MM02 · Cœur'],
    ['Fissure du compresseur HP', 'MM02 · Cœur']
  ];
  $('#critList').innerHTML = CRIT.map(([c, m]) => `<div class="${m.startsWith('MM01') ? 'mm1' : ''}"><span>${m}</span><b>${c}</b></div>`).join('');

  /* ---------- AMDEC ---------- */
  const SCALE = {
    G: ['Aucun impact : effet négligeable', 'Léger : dégradation mineure, sans impact sur la mission', 'Modéré : baisse de performance, moteur encore exploitable',
        'Significatif : réduction de capacité, inspection ou intervention requise', 'Sévère : altération fonctionnelle importante, mise en maintenance', 'Critique : arrêt moteur, risque sécurité, impact immédiat'],
    O: ['Très rare : 1 cas isolé en plusieurs années', 'Rare : 1 à 2 cas sur une flotte complète', 'Occasionnel : quelques cas connus, non récurrents',
        'Fréquent : observé régulièrement sur plusieurs moteurs', 'Très fréquent : apparition annuelle dans la flotte', 'Systématique : panne quasi certaine selon le profil moteur'],
    D: ['Très facile : détection immédiate par capteurs', 'Facile : contrôle de routine (EGT, vibrations…)', 'Moyenne : inspection approfondie ou expertise',
        'Difficile : visible seulement en atelier ou après démontage', 'Très difficile : rarement identifiée avant défaillance', 'Impossible : aucune détection avant le défaut réel']
  };
  const cat = (c) => c >= 100 ? [4, 'Très critique', 'Action immédiate et surveillance prédictive prioritaire.']
    : c >= 80 ? [3, 'Critique', 'Surveillance renforcée et actions préventives à planifier.']
    : c >= 60 ? [2, 'Modérée', 'Suivi périodique, actions à programmer.']
    : [1, 'Faible', 'Maintenance standard suffisante.'];
  function amdec() {
    const v = Object.fromEntries(['G', 'O', 'D'].map((k) => [k, +$('#' + k).value]));
    ['G', 'O', 'D'].forEach((k) => { $('#o' + k).textContent = v[k]; $('#d' + k).textContent = SCALE[k][v[k] - 1]; });
    const c = v.G * v.O * v.D, [lvl, name, txt] = cat(c);
    $('#rC').textContent = c;
    const p = $('#rCat'); p.className = 'pill lvl' + lvl; p.textContent = name;
    $('#rTxt').textContent = txt;
  }
  ['G', 'O', 'D'].forEach((k) => $('#' + k).addEventListener('input', amdec));
  amdec();

  /* ---------- Seuils de surveillance ---------- */
  const RED = '#f4a3a3', ORA = '#f9d48b', GRN = '#a8dfc4';
  const seg = (parts) => parts.map(([w, c]) => `<i style="width:${w}%;background:${c}"></i>`).join('') + '<span class="marker"></span>';
  // EGT 5..35 : critique <10, alerte <15
  $('#tE').innerHTML = seg([[(10 - 5) / 30 * 100, RED], [(15 - 10) / 30 * 100, ORA], [(35 - 15) / 30 * 100, GRN]]);
  // Vibration 0.01..0.12 : alerte >0.080, critique >0.095
  $('#tV').innerHTML = seg([[(0.08 - 0.01) / 0.11 * 100, GRN], [(0.095 - 0.08) / 0.11 * 100, ORA], [(0.12 - 0.095) / 0.11 * 100, RED]]);
  function mon() {
    const e = +$('#E').value, v = +$('#V').value;
    $('#oE').textContent = fmt(e) + ' °C'; $('#oV').textContent = fmt(v, 3);
    $('#tE .marker').style.left = ((e - 5) / 30 * 100) + '%';
    $('#tV .marker').style.left = ((v - 0.01) / 0.11 * 100) + '%';
    const se = e < 10 ? 2 : e < 15 ? 1 : 0, sv = v > 0.095 ? 2 : v > 0.08 ? 1 : 0;
    const lab = ['normale', 'alerte', 'critique'];
    $('#gE').textContent = lab[se]; $('#gV').textContent = lab[sv];
    const s = Math.max(se, sv);
    const D = [['🟢 NORMAL : aucune intervention', '#d9f2e6', '#11603b'], ['🟠 PLANIFIER LA MAINTENANCE', '#fff1cc', '#7a5200'], ['🔴 INTERVENIR : seuil critique dépassé', '#ffd6d6', '#8f1010']][s];
    const d = $('#dec'); d.textContent = D[0]; d.style.background = D[1]; d.style.color = D[2];
  }
  ['E', 'V'].forEach((k) => $('#' + k).addEventListener('input', mon)); mon();

  /* ---------- Galerie ---------- */
  const IMGS = [
    ['pipeline-predictif', 'Pipeline de la solution prédictive'],
    ['pareto-defaillances', 'Pareto des causes de dépose'],
    ['egt-margin', 'Évolution de la marge EGT sur 260 vols'],
    ['vibration-coeur', 'Évolution des vibrations N2'],
    ['egt-vs-vibration', 'Croisement marge EGT et vibrations'],
    ['rul-construction', 'Construction du RUL (seuils 20 / 10 vols)'],
    ['xgboost-reel-vs-predit', 'Jeu de test : RUL réel contre prédit'],
    ['xgboost-vs-regression', 'XGBoost contre régression linéaire'],
    ['rul-historique', 'RUL réel et prédit sur l’historique'],
    ['egt-reel-vs-predit', 'Marge EGT réelle et reconstruite'],
    ['vibration-reel-vs-predit', 'Vibrations réelles et reconstruites'],
    ['rul-prevision-40-vols', 'Prévision du RUL sur 40 vols']
  ];
  $('#gallery').innerHTML = IMGS.map(([f, t]) => `<button data-f="${f}" data-t="${t}"><img src="assets/${f}.webp" alt="${t}" loading="lazy"><span>${t}</span></button>`).join('');
  const lb = $('#lightbox');
  const openLb = (f, t) => { lb.querySelector('img').src = `assets/${f}.webp`; lb.querySelector('img').alt = t; lb.querySelector('p').textContent = t; lb.hidden = false; };
  document.querySelectorAll('#gallery button').forEach((b) => b.addEventListener('click', () => openLb(b.dataset.f, b.dataset.t)));
  document.querySelectorAll('.two figure img, .hero-img img').forEach((img) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openLb(img.src.split('/').pop().replace('.webp', ''), img.alt));
  });
  lb.addEventListener('click', (e) => { if (e.target !== lb.querySelector('img')) lb.hidden = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lb.hidden = true; });

  /* ---------- Navigation active ---------- */
  const links = [...document.querySelectorAll('.side-nav a')];
  const obs = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-30% 0px -60% 0px' });
  links.forEach((a) => { const s = document.querySelector(a.getAttribute('href')); if (s) obs.observe(s); });
})();
