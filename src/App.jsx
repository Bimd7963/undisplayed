import { useState, useMemo, useEffect } from "react";

// ── Charte Baptiste & Daphné Immobilier ──
const C = {
  navy:     "#1B2B4B",
  navy2:    "#162240",
  navyDark: "#0f1a30",
  gold:     "#c9a96e",
  goldLt:   "#d4b47a",
  cream:    "#F5F0E8",
  white:    "#FFFFFF",
  grey:     "#8A9AB5",
  success:  "#4a9e6b",
  danger:   "#c0392b",
};

const FONT_SERIF = "'Merriweather', Georgia, serif";
const FONT_SANS  = "'Montserrat', system-ui, sans-serif";

const SLIDER_CSS = `
  input[type=range] {
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    outline: none;
    cursor: pointer;
    display: block;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #c9a96e;
    cursor: pointer;
    border: 2px solid #0f1a30;
    box-shadow: 0 0 0 2px #c9a96e44;
    transition: box-shadow 0.2s;
  }
  input[type=range]::-moz-range-thumb {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #c9a96e;
    cursor: pointer;
    border: 2px solid #0f1a30;
    box-shadow: 0 0 0 2px #c9a96e44;
  }
  input[type=range]:hover::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px #c9a96e66;
  }
`;

// ─────────────────────────────────────────────────────────────
// Données INSEE RP2022 — ménages par CSP (personne de référence)
// Sources : INSEE RP2022 exploitations complémentaires + FAM T2
// Communes périphériques estimées à partir des données publiées
// Grand Chambéry, structure CSP et tailles de ménages RP2022
// ─────────────────────────────────────────────────────────────
const COMMUNES = [
  {
    id: "73065", nom: "Chambéry", pop: 60251, defaultOn: true,
    menagesTotal: 29545,
    csp: { cadres: 3866, artisans: 999, intermediaires: 4828, employes: 4809, ouvriers: 4109, retraites: 8118, inactifs: 2818 },
  },
  {
    id: "73179", nom: "La Motte-Servolex", pop: 12167, defaultOn: false,
    menagesTotal: 5750,
    csp: { cadres: 766, artisans: 230, intermediaires: 1028, employes: 847, ouvriers: 652, retraites: 2018, inactifs: 209 },
  },
  {
    id: "73213", nom: "La Ravoire", pop: 9154, defaultOn: false,
    menagesTotal: 4332,
    csp: { cadres: 512, artisans: 215, intermediaires: 903, employes: 693, ouvriers: 499, retraites: 1381, inactifs: 129 },
  },
  {
    id: "73087", nom: "Cognin", pop: 6729, defaultOn: false,
    menagesTotal: 3155,
    csp: { cadres: 314, artisans: 155, intermediaires: 601, employes: 444, ouvriers: 443, retraites: 1095, inactifs: 102 },
  },
  {
    id: "73064", nom: "Challes-les-Eaux", pop: 5626, defaultOn: false,
    menagesTotal: 2636,
    csp: { cadres: 402, artisans: 126, intermediaires: 478, employes: 372, ouvriers: 246, retraites: 895, inactifs: 116 },
  },
  {
    id: "73249", nom: "Saint-Alban-Leysse", pop: 1965, defaultOn: false,
    menagesTotal: 875,
    csp: { cadres: 122, artisans: 74, intermediaires: 191, employes: 117, ouvriers: 112, retraites: 230, inactifs: 29 },
  },
  {
    id: "73031", nom: "Barberaz", pop: 5118, defaultOn: false,
    menagesTotal: 2470,
    csp: { cadres: 210, artisans: 128, intermediaires: 490, employes: 573, ouvriers: 236, retraites: 767, inactifs: 66 },
  },
  {
    id: "73137", nom: "Jacob-Bellecombette", pop: 4340, defaultOn: false,
    menagesTotal: 2341,
    csp: { cadres: 327, artisans: 48, intermediaires: 444, employes: 363, ouvriers: 226, retraites: 461, inactifs: 472 },
  },
  {
    id: "73030", nom: "Bassens", pop: 3545, defaultOn: false,
    menagesTotal: 1533,
    csp: { cadres: 120, artisans: 36, intermediaires: 286, employes: 246, ouvriers: 235, retraites: 531, inactifs: 79 },
  },
  {
    id: "73029", nom: "Barby", pop: 5246, defaultOn: false,
    menagesTotal: 2550,
    csp: { cadres: 330, artisans: 66, intermediaires: 478, employes: 358, ouvriers: 311, retraites: 925, inactifs: 82 },
  },
  {
    id: "73228", nom: "Saint-Cassin", pop: 1009, defaultOn: false,
    menagesTotal: 395,
    csp: { cadres: 48, artisans: 33, intermediaires: 81, employes: 53, ouvriers: 67, retraites: 103, inactifs: 10 },
  },
  {
    id: "73160", nom: "Montagnole", pop: 1000, defaultOn: false,
    menagesTotal: 449,
    csp: { cadres: 80, artisans: 25, intermediaires: 107, employes: 30, ouvriers: 37, retraites: 170, inactifs: 0 },
  },
];

const CSP_META = [
  { id: "cadres",         label: "Cadres & Prof. Sup.",     icon: "💼", color: C.gold    },
  { id: "artisans",       label: "Artisans / Chefs d'ent.", icon: "🔧", color: "#b07d3a" },
  { id: "intermediaires", label: "Prof. Intermédiaires",    icon: "📋", color: C.grey    },
  { id: "employes",       label: "Employés",                icon: "🏢", color: "#6a85ab" },
  { id: "ouvriers",       label: "Ouvriers",                icon: "🏗️", color: "#4a6070" },
  { id: "retraites",      label: "Retraités",               icon: "🏖️", color: "#5a7a6a" },
  { id: "inactifs",       label: "Étudiants / Inactifs",    icon: "📚", color: "#3a4a5a" },
];

// ─────────────────────────────────────────────────────────────
// Revenus medians par CSP par commune
// Sources :
//   Cadres/Intermediaires/Employes/Ouvriers -> SNEMM_PCS_ESE 2023 (salaire net EQTP mensuel moyen local)
//   Artisans/Retraites/Inactifs -> ratio Figure 2 ERFS 2021 x MED21 communale / 12
// Sigma -> Figure 2 INSEE-DGFiP ERFS 2021 (D1/D9 par CSP, France entiere)
//   sigma = (ln(P90) - ln(P10)) / (2 x 1.2816) reconstruit par interpolation CDF
// ─────────────────────────────────────────────────────────────
// Sigma DADS 2022 — base Tous Salariés, INSEE Premiere n°1971
// sigma = ln(D9/D1) / (2 x 1.2816)
const CSP_SIGMA = {
  cadres:         0.376, // D1=2100€ D9=5500€
  artisans:       0.557, // D1=1200€ D9=5000€ (non-salaries)
  intermediaires: 0.270, // D1=1600€ D9=3200€
  employes:       0.223, // D1=1300€ D9=2300€
  ouvriers:       0.239, // D1=1300€ D9=2400€
  retraites:      0.470, // D1=900€  D9=3000€
  inactifs:       0.470, // D1=600€  D9=2000€
};

// Planchers maintenus (revenus minimaux legaux)
// P95 max avec sigma DADS : employes 2816€, ouvriers 3212€ — pas de plafond necessaire
const CSP_PLANCHER = {
  cadres:         null,
  artisans:       null,
  intermediaires: null,
  employes:       1383, // SMIC net 2024
  ouvriers:       1383, // SMIC net 2024
  retraites:       876, // minimum contributif
  inactifs:        635, // RSA socle
};

// Mediane mensuelle par CSP par commune (id INSEE -> { csp: montant })
// Cadres/Inter/Employes/Ouvriers : SNEMM local 2023
// Artisans/Retraites/Inactifs : ratio ERFS 2021 x mediane locale
const MEDIANE_CSP_COMMUNE = {
  "73065": { cadres: 4037, artisans: 1836, intermediaires: 2597, employes: 1951, ouvriers: 2168, retraites: 1734, inactifs: 1261 },
  "73179": { cadres: 4447, artisans: 2212, intermediaires: 2876, employes: 2063, ouvriers: 2113, retraites: 2089, inactifs: 1519 },
  "73213": { cadres: 4233, artisans: 2051, intermediaires: 2692, employes: 1938, ouvriers: 1991, retraites: 1937, inactifs: 1409 },
  "73087": { cadres: 3327, artisans: 1947, intermediaires: 2442, employes: 1857, ouvriers: 1676, retraites: 1839, inactifs: 1337 },
  "73064": { cadres: 4004, artisans: 2249, intermediaires: 2726, employes: 2110, ouvriers: 2026, retraites: 2124, inactifs: 1545 },
  "73249": { cadres: 3152, artisans: 2198, intermediaires: 2411, employes: 1973, ouvriers: 1916, retraites: 2076, inactifs: 1510 },
  "73031": { cadres: 3692, artisans: 2110, intermediaires: 2432, employes: 1955, ouvriers: 1968, retraites: 1993, inactifs: 1449 },
  "73137": { cadres: 3086, artisans: 2152, intermediaires: 2361, employes: 1932, ouvriers: 1876, retraites: 2032, inactifs: 1478 },
  "73030": { cadres: 3688, artisans: 1988, intermediaires: 2541, employes: 2167, ouvriers: 2145, retraites: 1877, inactifs: 1365 },
  "73029": { cadres: 3808, artisans: 2125, intermediaires: 2432, employes: 2040, ouvriers: 2116, retraites: 2007, inactifs: 1460 },
  "73228": { cadres: 3126, artisans: 2179, intermediaires: 2391, employes: 1957, ouvriers: 1900, retraites: 2058, inactifs: 1497 },
  "73160": { cadres: 3358, artisans: 2341, intermediaires: 2568, employes: 2102, ouvriers: 2041, retraites: 2211, inactifs: 1608 },
};

// Calcule le SALAIRE_CSP effectif = mediane ponderee par menages des communes actives
function getSalaireCsp(communesActives) {
  const csps = ["cadres","artisans","intermediaires","employes","ouvriers","retraites","inactifs"];
  const result = {};
  for (const csp of csps) {
    let sumPoids = 0, sumPonderee = 0;
    for (const c of communesActives) {
      const poids = c.csp[csp] || 0;
      const med   = MEDIANE_CSP_COMMUNE[c.id]?.[csp] ?? 1800;
      sumPonderee += poids * med;
      sumPoids    += poids;
    }
    result[csp] = {
      mediane:  sumPoids > 0 ? Math.round(sumPonderee / sumPoids) : 1800,
      sigma:    CSP_SIGMA[csp],
      plancher: CSP_PLANCHER[csp],
    };
  }
  return result;
}

// Approximation de Φ(x) — Abramowitz & Stegun 7.1.26, erreur < 1.5e-7
function phi(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422820 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  return x >= 0 ? 1 - p : p;
}

// Proportion de ménages dont le revenu >= seuil, avec plancher (distribution tronquée)
// P(X >= seuil | X >= plancher) = P(X >= seuil) / P(X >= plancher)
function proportionAuDessus(mediane, sigma, seuil, plancher) {
  if (seuil <= 0) return 1;
  const mu = Math.log(mediane);
  const pAuDessus = s => 1 - phi((Math.log(Math.max(s, 0.01)) - mu) / sigma);
  const pSeuil    = pAuDessus(seuil);
  if (!plancher) return pSeuil;
  // Distribution tronquée : on normalise par la masse au-dessus du plancher
  const pPlancher = pAuDessus(plancher);
  if (pPlancher < 0.001) return 0;
  return Math.min(pSeuil / pPlancher, 1);
}

const fmtEur = n =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const fmtN = n =>
  new Intl.NumberFormat("fr-FR").format(Math.round(n));

// ─────────────────────────────────────────
export default function App() {
  const [prixBien,     setPrixBien]     = useState(300000);
  const [prixInput,    setPrixInput]    = useState("300 000");
  const [prixFocus,    setPrixFocus]    = useState(false);
  const [apport,       setApport]       = useState(10);
  const [duree,        setDuree]        = useState(20);
  const [tauxCredit,   setTauxCredit]   = useState(3.5);
  const [tauxAssurance,setTauxAssurance]= useState(0.35);
  const [coupleMode,   setCoupleMode]   = useState(false);
  const [fraisNotaire, setFraisNotaire] = useState(8);
  const [showMethodo,  setShowMethodo]  = useState(false);

  const handlePrixChange = (raw) => {
    const cleaned = raw.replace(/\s/g, "").replace(/[^0-9]/g, "");
    const num = parseInt(cleaned, 10);
    if (!isNaN(num)) {
      setPrixBien(Math.min(Math.max(num, 50000), 800000));
      setPrixInput(new Intl.NumberFormat("fr-FR").format(num));
    } else {
      setPrixInput(raw);
    }
  };
  const handlePrixBlur = () => {
    setPrixFocus(false);
    setPrixInput(new Intl.NumberFormat("fr-FR").format(prixBien));
  };

  const [communesActives, setCommunesActives] = useState(
    () => new Set(COMMUNES.filter(c => c.defaultOn).map(c => c.id))
  );

  const toggleCommune = (id) => {
    setCommunesActives(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev;
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll  = () => setCommunesActives(new Set(COMMUNES.map(c => c.id)));
  const resetSel   = () => setCommunesActives(new Set(["73065"]));

  const calc = useMemo(() => {
    const fn       = prixBien * fraisNotaire / 100;
    const total    = prixBien + fn;
    const emprunte = total * (1 - apport / 100);
    const tm       = tauxCredit / 100 / 12;
    const n        = duree * 12;
    const mensCredit = tm === 0 ? emprunte / n : (emprunte * tm) / (1 - Math.pow(1 + tm, -n));
    const mensAssurance = emprunte * (tauxAssurance / 100) / 12;
    const mensualite = mensCredit + mensAssurance;
    const revMin   = mensualite / 0.35;

    const totauxCSP = {};
    let totalMenages = 0;
    CSP_META.forEach(m => { totauxCSP[m.id] = 0; });
    COMMUNES.forEach(c => {
      if (!communesActives.has(c.id)) return;
      totalMenages += c.menagesTotal;
      CSP_META.forEach(m => { totauxCSP[m.id] += c.csp[m.id]; });
    });

    const communesActivesList = COMMUNES.filter(c => communesActives.has(c.id));
    const salaireCsp = getSalaireCsp(communesActivesList);

    const csps = CSP_META.map(meta => {
      const menages  = totauxCSP[meta.id];
      const pct      = totalMenages > 0 ? (menages / totalMenages) * 100 : 0;
      const { mediane, sigma, plancher } = salaireCsp[meta.id];
      const medianeEff = coupleMode ? mediane * 2 : mediane;
      const sigmaEff   = coupleMode ? sigma / Math.sqrt(2) : sigma;
      const plancherEff = plancher ? (coupleMode ? plancher * 2 : plancher) : null;
      const propOk     = proportionAuDessus(medianeEff, sigmaEff, revMin, plancherEff);
      const endettement = (mensualite / medianeEff) * 100;
      return { ...meta, menages, pct, salaireMensuelNet: mediane, propOk, menagesOk: menages * propOk, endettement };
    });

    // Normalisation : la somme des ménages CSP peut différer de totalMenages (données INSEE)
    const sommeCsp = csps.reduce((s, c) => s + c.menages, 0);
    const norm = sommeCsp > 0 && totalMenages > 0 ? totalMenages / sommeCsp : 1;
    const cspsN = csps.map(c => ({
      ...c,
      menages:   Math.round(c.menages * norm),
      menagesOk: c.menages * norm * c.propOk,
      pct:       totalMenages > 0 ? (c.menages * norm / totalMenages) * 100 : 0,
    }));

    const menagesOk = Math.min(cspsN.reduce((s, c) => s + c.menagesOk, 0), totalMenages);
    const popActive = COMMUNES.filter(c => communesActives.has(c.id)).reduce((s, c) => s + c.pop, 0);
    const pctOk = totalMenages > 0 ? Math.min((menagesOk / totalMenages) * 100, 100) : 0;
    return { fn, total, mensualite, mensCredit, mensAssurance, revMin, revMinCouple: revMin / 2, csps: cspsN, menagesOk, totalMenages, pctOk, popActive };
  }, [prixBien, apport, duree, tauxCredit, tauxAssurance, coupleMode, fraisNotaire, communesActives]);

  const statusColor = calc.pctOk < 15 ? C.danger : calc.pctOk < 35 ? C.gold : C.success;
  const nbCommunes  = communesActives.size;

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = SLIDER_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.navyDark, fontFamily: FONT_SANS, color: C.white, overflowX: "hidden" }}>

      {/* ── HEADER ── */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy2} 0%, ${C.navyDark} 100%)`, borderBottom: `1px solid rgba(201,169,110,0.2)`, padding: "30px 5% 26px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 10, letterSpacing: "0.22em", color: C.gold, textTransform: "uppercase", fontWeight: 600, border: `1px solid rgba(201,169,110,0.35)`, padding: "3px 10px", borderRadius: 2 }}>
              Conseillers IAD · Chambéry &amp; alentours
            </span>
          </div>
          <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 900, fontSize: "clamp(22px,3.2vw,42px)", margin: 0, lineHeight: 1.1, color: C.white }}>
            Votre prix a des conséquences.<br />
            <em style={{ fontStyle: "normal", color: C.gold }}>Visualisez lesquelles.</em>
          </h1>
          <p style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.55)", fontSize: 13, maxWidth: 520, lineHeight: 1.7 }}>
            Simulez le coût réel de votre bien et découvrez combien de ménages peuvent se permettre de l'acheter sur le périmètre que vous choisissez.
          </p>
          <div style={{ marginTop: 8, fontSize: 11, color: C.grey }}>
            Baptiste <span style={{ color: C.gold }}>AUDOUIN</span> &amp; Daphné <span style={{ color: C.gold }}>MARTIN MARIN</span> · Mandataires IAD
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 5%" }}>

        {/* ── SÉLECTEUR DE COMMUNES ── */}
        <div style={{ background: C.navy2, border: `1px solid rgba(201,169,110,0.25)`, borderRadius: 14, padding: "16px 20px", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, fontWeight: 700, marginBottom: 3 }}>
                Périmètre de recherche
              </div>
              <div style={{ fontSize: 11, color: C.grey }}>
                {nbCommunes} commune{nbCommunes > 1 ? "s" : ""} active{nbCommunes > 1 ? "s" : ""}
                &nbsp;·&nbsp; {fmtN(calc.totalMenages)} ménages
                &nbsp;·&nbsp; {fmtN(calc.popActive)} hab.
              </div>
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <button onClick={selectAll} style={styleBtnSm(true)}>Tout sélectionner</button>
              <button onClick={resetSel}  style={styleBtnSm(false)}>Réinitialiser</button>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {COMMUNES.map(c => {
              const on = communesActives.has(c.id);
              return (
                <button key={c.id} onClick={() => toggleCommune(c.id)} style={{
                  cursor: "pointer", padding: "5px 13px", borderRadius: 20,
                  fontSize: 12, fontFamily: FONT_SANS, fontWeight: on ? 600 : 400,
                  border: `1px solid ${on ? C.gold : "rgba(255,255,255,0.14)"}`,
                  background: on ? "rgba(201,169,110,0.13)" : "rgba(255,255,255,0.02)",
                  color: on ? C.gold : "rgba(255,255,255,0.45)",
                  transition: "all 0.16s",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: on ? C.gold : "rgba(255,255,255,0.18)", flexShrink: 0, display: "inline-block", transition: "background 0.16s" }} />
                  {c.nom}
                  <span style={{ fontSize: 10, opacity: 0.55 }}>({fmtN(c.menagesTotal)})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── GRILLE PRINCIPALE ── */}
        <div className="sim-grid" style={{ display: "grid", gridTemplateColumns: "310px 1fr", gap: 22, alignItems: "start" }}>

          {/* LEFT : Contrôles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>

            <Panel title="Prix du bien" icon="💰">
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: C.grey, fontWeight: 500 }}>Prix affiché</span>
                  <input
                    type="text"
                    value={prixFocus ? prixInput.replace(/\s/g, "") : prixInput}
                    onFocus={() => { setPrixFocus(true); setPrixInput(String(prixBien)); }}
                    onBlur={handlePrixBlur}
                    onChange={e => handlePrixChange(e.target.value)}
                    style={{
                      background: "transparent", border: "none",
                      color: C.gold, fontWeight: 700, fontSize: 13, fontFamily: FONT_SANS,
                      textAlign: "right", width: 110, outline: "none", padding: "1px 2px",
                      textDecoration: "none", boxShadow: "none",
                    }}
                  />
                </div>
                <input type="range" min={50000} max={800000} step={5000} value={prixBien}
                  onChange={e => { const v = Number(e.target.value); setPrixBien(v); setPrixInput(new Intl.NumberFormat("fr-FR").format(v)); }}
                  style={{ width: "100%", background: `linear-gradient(to right, ${C.gold} ${((prixBien-50000)/(800000-50000))*100}%, rgba(255,255,255,0.1) ${((prixBien-50000)/(800000-50000))*100}%)` }}
                />
              </div>
              <Slider label={`Notaire ${fraisNotaire}%`} value={fraisNotaire} min={2} max={10} step={0.5}
                display={fmtEur(calc.fn)} onChange={setFraisNotaire} compact />
              <TotalRow label="Coût total (bien + notaire)" value={fmtEur(calc.total)} />
            </Panel>

            <Panel title="Crédit immobilier" icon="🏦">
              <Slider label={`Apport ${apport}%`} value={apport} min={0} max={40} step={1}
                display={fmtEur(calc.total * apport / 100)} onChange={setApport} />
              <Slider label="Durée" value={duree} min={10} max={25} step={1}
                display={`${duree} ans`} onChange={setDuree} />
              <Slider label="Taux crédit" value={tauxCredit} min={1} max={6} step={0.1}
                display={`${tauxCredit.toFixed(1)} %`} onChange={setTauxCredit} />
              <Slider label="Taux assurance" value={tauxAssurance} min={0} max={1} step={0.01}
                display={`${tauxAssurance.toFixed(2)} %`} onChange={setTauxAssurance} />
            </Panel>

            <Panel title="Profil acheteur" icon="👥">
              <Toggle active={coupleMode} onToggle={() => setCoupleMode(v => !v)}
                labelOn="Couple — 2 salaires cumulés" labelOff="Seul — 1 salaire" />
            </Panel>

            {/* Mensualité */}
            <div style={{ background: `linear-gradient(135deg, ${C.navy2}, ${C.navyDark})`, border: `1px solid rgba(201,169,110,0.3)`, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.grey, fontWeight: 600, marginBottom: 8 }}>Mensualité de crédit</div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 32, fontWeight: 900, color: C.gold, lineHeight: 1 }}>
                {fmtEur(calc.mensualite)}
                <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.grey, marginLeft: 5, fontWeight: 400 }}>/mois</span>
              </div>
              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                <MiniStat label="Dont crédit"     value={fmtEur(calc.mensCredit) + "/mois"} />
                <MiniStat label="Dont assurance"  value={fmtEur(calc.mensAssurance) + "/mois"} />
                <MiniStat label="Min. seul"       value={fmtEur(calc.revMin)       + "/mois"} />
                <MiniStat label="Min. par pers."  value={fmtEur(calc.revMinCouple) + "/mois"} />
              </div>
              <div style={{ marginTop: 7, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Règle HCSF — endettement max 35 %</div>
            </div>

          </div>

          {/* RIGHT : Visualisations */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Hero stat */}
            <div style={{
              background: `linear-gradient(135deg, ${C.navy2}, ${C.navyDark})`,
              border: `1px solid ${statusColor}44`, borderRadius: 14, padding: "22px 26px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 80% at 80% 50%, ${statusColor}0a, transparent 70%)`, pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.grey, fontWeight: 600, marginBottom: 8 }}>
                  Ménages pouvant acheter · {nbCommunes} commune{nbCommunes > 1 ? "s" : ""}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontFamily: FONT_SERIF, fontSize: "clamp(42px,4.8vw,66px)", fontWeight: 900, color: statusColor, lineHeight: 1 }}>
                    {calc.pctOk.toFixed(1)} %
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 16 }}>du périmètre</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 13, color: C.grey }}>
                  soit <strong style={{ color: C.white }}>{fmtN(calc.menagesOk)} ménages</strong> sur {fmtN(calc.totalMenages)}
                </div>
                <div style={{ marginTop: 12 }}><StatusPill pct={calc.pctOk} /></div>
              </div>
              <AccessCircle pct={calc.pctOk} color={statusColor} />
            </div>

            {/* Barres CSP */}
            <div style={{ background: C.navy2, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 14, padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
                <SectionLabel text="Accessibilité par CSP — périmètre sélectionné (INSEE RP2022)" />
                <button
                  onClick={() => setShowMethodo(v => !v)}
                  title="Note méthodologique"
                  style={{
                    cursor: "pointer", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%",
                    width: 22, height: 22, fontSize: 12, color: "rgba(255,255,255,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontFamily: "serif", lineHeight: 1,
                    transition: "all 0.15s",
                  }}
                >ℹ</button>
              </div>
              {showMethodo && (
                <div style={{
                  background: "rgba(0,0,0,0.25)", border: "1px solid rgba(201,169,110,0.2)",
                  borderRadius: 10, padding: "14px 16px", marginBottom: 14,
                  fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.75,
                }}>
                  <div style={{ color: C.gold, fontWeight: 700, marginBottom: 6, fontSize: 12 }}>Note méthodologique</div>
                  <p style={{ margin: "0 0 8px" }}>
                    <strong style={{ color: "rgba(255,255,255,0.75)" }}>Données de population</strong> — Ménages par CSP (personne de référence) : INSEE RP2022, exploitation complémentaire. Communes Grand Chambéry.
                  </p>
                  <p style={{ margin: "0 0 8px" }}>
                    <strong style={{ color: "rgba(255,255,255,0.75)" }}>Revenus médians</strong> — Cadres, prof. intermédiaires, employés, ouvriers : salaire net EQTP mensuel moyen par commune (SNEMM, INSEE DADS 2023). Artisans, retraités, inactifs : ratio ERFS 2021 appliqué à la médiane de niveau de vie communale (MED21, Filosofi).
                  </p>
                  <p style={{ margin: "0 0 8px" }}>
                    <strong style={{ color: "rgba(255,255,255,0.75)" }}>Distribution des revenus</strong> — Modèle log-normal par CSP. Sigma calibré sur les déciles D1/D9 de la base Tous Salariés INSEE (DADS 2022). Planchers : SMIC net (employés, ouvriers), minimum contributif (retraités), RSA socle (inactifs).
                  </p>
                  <p style={{ margin: "0 0 8px" }}>
                    <strong style={{ color: "rgba(255,255,255,0.75)" }}>Seuil d'accessibilité</strong> — Règle HCSF : mensualité totale (crédit + assurance) ≤ 35 % des revenus nets mensuels du ménage.
                  </p>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
                    Outil indicatif. Les effectifs représentent des ménages théoriquement solvables, non des projets d'achat avérés. La comparaison entre prix (évolution relative) est plus fiable que la lecture des chiffres absolus.
                  </p>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 13 }}>
                {calc.csps.map(csp => <CSPRow key={csp.id} csp={csp} coupleMode={coupleMode} />)}
              </div>

            </div>



            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", lineHeight: 1.7 }}>
              Sources : INSEE RP2022 (communes Grand Chambéry — FAM T2 structure CSP ménages) · SAL G1 2023 (salaires nets EQTP) ·
              Données communes périphériques estimées à partir des publications INSEE Grand Chambéry ·
              Règle HCSF 35 % · Outil indicatif Baptiste &amp; Daphné Immobilier — IAD France
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Style helpers ──
const styleBtnSm = (primary) => ({
  cursor: "pointer", padding: "4px 11px", borderRadius: 6,
  fontSize: 11, fontFamily: FONT_SANS, fontWeight: 600,
  border: `1px solid ${primary ? "rgba(201,169,110,0.45)" : "rgba(255,255,255,0.1)"}`,
  background: primary ? "rgba(201,169,110,0.1)" : "transparent",
  color: primary ? C.gold : "rgba(255,255,255,0.35)",
});

// ─────────────────────────────────────────
// Composants réutilisables
// ─────────────────────────────────────────

function Panel({ title, icon, children }) {
  return (
    <div style={{ background: C.navy2, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 12, padding: "13px 15px" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, fontWeight: 700, marginBottom: 11, display: "flex", alignItems: "center", gap: 6 }}>
        <span>{icon}</span>{title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{children}</div>
    </div>
  );
}

function Slider({ label, value, min, max, step, display, onChange, compact }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: compact ? 10 : 11, color: C.grey, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: compact ? 11 : 12, color: C.gold, fontWeight: 700 }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", background: `linear-gradient(to right, ${C.gold} ${pct}%, rgba(255,255,255,0.1) ${pct}%)` }}
      />
    </div>
  );
}

function TotalRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: "rgba(0,0,0,0.2)", borderRadius: 6, marginTop: 1 }}>
      <span style={{ fontSize: 11, color: C.grey }}>{label}</span>
      <span style={{ fontSize: 13, color: C.white, fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 6, padding: "6px 8px" }}>
      <div style={{ fontSize: 9, color: C.grey, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: C.white, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Toggle({ active, onToggle, labelOn, labelOff }) {
  return (
    <div onClick={onToggle} style={{
      cursor: "pointer", display: "flex", alignItems: "center", gap: 11,
      padding: "9px 12px",
      background: active ? "rgba(201,169,110,0.1)" : "rgba(0,0,0,0.2)",
      border: `1px solid ${active ? "rgba(201,169,110,0.4)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 8, userSelect: "none", transition: "all 0.2s",
    }}>
      <div style={{ width: 32, height: 18, background: active ? C.gold : "rgba(255,255,255,0.12)", borderRadius: 9, position: "relative", flexShrink: 0, transition: "background 0.25s" }}>
        <div style={{ position: "absolute", top: 2, left: active ? 16 : 2, width: 14, height: 14, background: active ? C.navy : C.white, borderRadius: "50%", transition: "left 0.25s" }} />
      </div>
      <span style={{ fontSize: 12, color: active ? C.cream : "rgba(255,255,255,0.55)", fontWeight: active ? 600 : 400 }}>
        {active ? labelOn : labelOff}
      </span>
    </div>
  );
}

function SectionLabel({ text }) {
  return <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: C.grey, fontWeight: 600 }}>{text}</div>;
}

function Legend({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.grey }}>
      <div style={{ width: 9, height: 9, borderRadius: 2, background: color, flexShrink: 0 }} />{label}
    </div>
  );
}

function StatusPill({ pct }) {
  const cfg = pct < 15
    ? { bg: `${C.danger}22`,  border: `${C.danger}66`,  color: C.danger,  text: "Marché très restreint — peu d'acheteurs" }
    : pct < 35
    ? { bg: `${C.gold}22`,    border: `${C.gold}66`,    color: C.gold,    text: "Marché sélectif — positionnement crucial" }
    : { bg: `${C.success}22`, border: `${C.success}66`, color: C.success, text: "Bon potentiel — large bassin d'acheteurs" };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 4, padding: "3px 9px" }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>{cfg.text}</span>
    </div>
  );
}

function AccessCircle({ pct, color }) {
  const size = 86, r = 33, cx = 43, cy = 43;
  const circ   = 2 * Math.PI * r;
  const filled = Math.min(pct / 100, 1) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${filled} ${circ - filled}`} strokeDashoffset={circ / 4} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)" }}
      />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={13} fontFamily={FONT_SERIF} fontWeight="900">
        {pct.toFixed(0)}%
      </text>
    </svg>
  );
}

function CSPRow({ csp, coupleMode }) {
  const { propOk, label, icon, salaireMensuelNet, pct, menages } = csp;
  const menagesOk = Math.round(menages * propOk);
  const pctOkCsp  = (propOk * 100).toFixed(1);

  return (
    <div style={{
      background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "10px 14px",
      border: `1px solid rgba(255,255,255,0.05)`,
      opacity: propOk < 0.02 ? 0.45 : 1, transition: "opacity 0.3s",
    }}>
      {/* Ligne 1 : icône + nom + % accessibles */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 12, color: C.cream, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 11, color: C.grey, flexShrink: 0 }}>
          {pctOkCsp}% peuvent accéder
        </span>
      </div>

      {/* Ligne 2 : barre dorée + ménages */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct * 2}%`, maxWidth: "100%", background: "rgba(255,255,255,0.07)", borderRadius: 4 }} />
          <div style={{
            position: "absolute", left: 0, top: 0, height: "100%",
            width: `${pct * 2 * propOk}%`, maxWidth: "100%",
            background: `linear-gradient(90deg, ${C.gold}, ${C.gold}88)`,
            borderRadius: 4, transition: "width 0.5s cubic-bezier(.4,0,.2,1)"
          }} />
        </div>
        <div style={{ fontSize: 10, flexShrink: 0, textAlign: "right", lineHeight: 1.5 }}>
          <span style={{ color: C.gold, fontWeight: 700 }}>{fmtN(menagesOk)} acheteurs potentiels</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}> / {fmtN(menages)} ménages ({pct.toFixed(1)}% du périmètre)</span>
        </div>
      </div>
    </div>
  );
}

function PrixCourbe({ prixActuel, apport, duree, tauxCredit, tauxAssurance, fraisNotaire, coupleMode, communesActives }) {
  // Calculer le % acheteurs pour un prix donné
  const calcPct = (prix) => {
    const fn       = prix * fraisNotaire / 100;
    const total    = prix + fn;
    const emprunte = total * (1 - apport / 100);
    const tm       = tauxCredit / 100 / 12;
    const n        = duree * 12;
    const mensCredit     = tm === 0 ? emprunte / n : (emprunte * tm) / (1 - Math.pow(1 + tm, -n));
    const mensAssurance  = emprunte * (tauxAssurance / 100) / 12;
    const mensualite     = mensCredit + mensAssurance;
    const revMin         = mensualite / 0.35;

    const totauxCSP = {};
    let totalMenages = 0;
    CSP_META.forEach(m => { totauxCSP[m.id] = 0; });
    COMMUNES.forEach(c => {
      if (!communesActives.has(c.id)) return;
      totalMenages += c.menagesTotal;
      CSP_META.forEach(m => { totauxCSP[m.id] += c.csp[m.id]; });
    });
    if (totalMenages === 0) return 0;

    const communesActivesList2 = COMMUNES.filter(c => communesActives.has(c.id));
    const salaireCsp2 = getSalaireCsp(communesActivesList2);
    let menagesOk = 0;
    CSP_META.forEach(meta => {
      const menages = totauxCSP[meta.id];
      const { mediane, sigma, plancher } = salaireCsp2[meta.id];
      const medianeEff  = coupleMode ? mediane * 2 : mediane;
      const sigmaEff    = coupleMode ? sigma / Math.sqrt(2) : sigma;
      const plancherEff = plancher ? (coupleMode ? plancher * 2 : plancher) : null;
      menagesOk += menages * proportionAuDessus(medianeEff, sigmaEff, revMin, plancherEff);
    });
    return (menagesOk / totalMenages) * 100;
  };

  // 40 points de 50k à 800k
  const NB = 40;
  const PMIN = 50000, PMAX = 800000;
  const points = Array.from({ length: NB }, (_, i) => {
    const prix = PMIN + (i / (NB - 1)) * (PMAX - PMIN);
    return { prix, pct: calcPct(prix) };
  });

  // Dimensions SVG
  const W = 520, H = 220, PAD = { top: 16, right: 12, bottom: 32, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const xOf  = p => PAD.left + ((p - PMIN) / (PMAX - PMIN)) * innerW;
  const yOf  = p => PAD.top  + (1 - p / 100) * innerH;
  const path = points.map((pt, i) => `${i === 0 ? "M" : "L"}${xOf(pt.prix).toFixed(1)},${yOf(pt.pct).toFixed(1)}`).join(" ");
  const area = `${path} L${xOf(PMAX)},${(PAD.top + innerH).toFixed(1)} L${xOf(PMIN)},${(PAD.top + innerH).toFixed(1)} Z`;

  // Position du prix actuel
  const xActuel = xOf(prixActuel);
  const pctActuel = calcPct(prixActuel);
  const yActuel  = yOf(pctActuel);
  const couleur  = pctActuel < 15 ? C.danger : pctActuel < 35 ? C.gold : C.success;

  // Repères horizontaux
  const reperes = [10, 20, 30, 40, 50];
  // Repères verticaux (prix en k€)
  const reperesPrix = [100, 200, 300, 400, 500, 600, 700];

  return (
    <div style={{ marginTop: 10 }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.gold} stopOpacity="0.18" />
            <stop offset="100%" stopColor={C.gold} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grille horizontale */}
        {reperes.map(r => (
          <g key={r}>
            <line x1={PAD.left} x2={PAD.left + innerW} y1={yOf(r)} y2={yOf(r)}
              stroke="rgba(255,255,255,0.05)" strokeWidth={1} strokeDasharray="3 3" />
            <text x={PAD.left - 4} y={yOf(r) + 3.5} textAnchor="end"
              fill="rgba(255,255,255,0.35)" fontSize={10} fontFamily={FONT_SANS}>{r}%</text>
          </g>
        ))}

        {/* Grille verticale */}
        {reperesPrix.map(r => (
          <g key={r}>
            <line x1={xOf(r * 1000)} x2={xOf(r * 1000)} y1={PAD.top} y2={PAD.top + innerH}
              stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
            <text x={xOf(r * 1000)} y={PAD.top + innerH + 12} textAnchor="middle"
              fill="rgba(255,255,255,0.35)" fontSize={10} fontFamily={FONT_SANS}>{r}k</text>
          </g>
        ))}

        {/* Aire sous la courbe */}
        <path d={area} fill="url(#areaGrad)" />

        {/* Courbe principale */}
        <path d={path} fill="none" stroke={C.gold} strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Ligne verticale prix actuel */}
        <line x1={xActuel} x2={xActuel} y1={PAD.top} y2={PAD.top + innerH}
          stroke={couleur} strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Point prix actuel */}
        <circle cx={xActuel} cy={yActuel} r={7} fill={couleur} stroke={C.navyDark} strokeWidth={2} />

        {/* Label prix actuel */}
        <g>
          <rect x={xActuel - (xActuel > W * 0.7 ? 80 : -8)} y={yActuel - 26}
            width={72} height={18} rx={3}
            fill={couleur} opacity={0.92} />
          <text x={xActuel - (xActuel > W * 0.7 ? 80 : -8) + 36} y={yActuel - 14}
            textAnchor="middle" fill={C.navyDark} fontSize={10} fontWeight="700" fontFamily={FONT_SANS}>
            {pctActuel.toFixed(1)}% · {fmtEur(prixActuel)}
          </text>
        </g>

        {/* Axes */}
        <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + innerH}
          stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
        <line x1={PAD.left} x2={PAD.left + innerW} y1={PAD.top + innerH} y2={PAD.top + innerH}
          stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
      </svg>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>
        Le point doré suit votre prix actuel. Les autres paramètres (apport, durée, taux) sont ceux définis à gauche.
      </div>
    </div>
  );
}
