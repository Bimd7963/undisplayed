import { useState, useMemo } from "react";

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
    csp: { cadres: 3866, artisans: 999, intermediaires: 4828, employes: 4809, ouvriers: 4109, retraites: 12527, inactifs: 9464 },
  },
  {
    id: "73179", nom: "La Motte-Servolex", pop: 11452, defaultOn: false,
    menagesTotal: 5461,
    csp: { cadres: 1100, artisans: 248, intermediaires: 1080, employes: 870, ouvriers: 600, retraites: 1220, inactifs: 343 },
  },
  {
    id: "73213", nom: "La Ravoire", pop: 8007, defaultOn: false,
    menagesTotal: 3762,
    csp: { cadres: 600, artisans: 140, intermediaires: 660, employes: 600, ouvriers: 500, retraites: 980, inactifs: 282 },
  },
  {
    id: "73087", nom: "Cognin", pop: 5920, defaultOn: false,
    menagesTotal: 2902,
    csp: { cadres: 390, artisans: 100, intermediaires: 530, employes: 490, ouvriers: 410, retraites: 780, inactifs: 202 },
  },
  {
    id: "73064", nom: "Challes-les-Eaux", pop: 5050, defaultOn: false,
    menagesTotal: 2416,
    csp: { cadres: 450, artisans: 90, intermediaires: 430, employes: 370, ouvriers: 240, retraites: 690, inactifs: 146 },
  },
  {
    id: "73249", nom: "Saint-Alban-Leysse", pop: 5663, defaultOn: false,
    menagesTotal: 2676,
    csp: { cadres: 350, artisans: 88, intermediaires: 465, employes: 420, ouvriers: 345, retraites: 780, inactifs: 228 },
  },
  {
    id: "73031", nom: "Barberaz", pop: 4572, defaultOn: false,
    menagesTotal: 2329,
    csp: { cadres: 370, artisans: 75, intermediaires: 410, employes: 345, ouvriers: 255, retraites: 670, inactifs: 204 },
  },
  {
    id: "73137", nom: "Jacob-Bellecombette", pop: 3870, defaultOn: false,
    menagesTotal: 2163,
    csp: { cadres: 420, artisans: 62, intermediaires: 365, employes: 260, ouvriers: 145, retraites: 720, inactifs: 191 },
  },
  {
    id: "73030", nom: "Bassens", pop: 3863, defaultOn: false,
    menagesTotal: 1878,
    csp: { cadres: 215, artisans: 58, intermediaires: 330, employes: 355, ouvriers: 360, retraites: 500, inactifs: 160 },
  },
  {
    id: "73029", nom: "Barby", pop: 3312, defaultOn: false,
    menagesTotal: 1421,
    csp: { cadres: 190, artisans: 55, intermediaires: 255, employes: 210, ouvriers: 195, retraites: 390, inactifs: 126 },
  },
  {
    id: "73228", nom: "Saint-Cassin", pop: 1100, defaultOn: false,
    menagesTotal: 490,
    csp: { cadres: 95, artisans: 18, intermediaires: 88, employes: 65, ouvriers: 45, retraites: 145, inactifs: 34 },
  },
  {
    id: "73160", nom: "Montagnole", pop: 844, defaultOn: false,
    menagesTotal: 403,
    csp: { cadres: 58, artisans: 14, intermediaires: 72, employes: 55, ouvriers: 40, retraites: 118, inactifs: 46 },
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

// Salaire net mensuel médian estimé par CSP (Chambéry, INSEE SAL G1 2023)
const SALAIRE_CSP = {
  cadres: 3800, artisans: 2800, intermediaires: 2300,
  employes: 1800, ouvriers: 1650, retraites: 1500, inactifs: 900,
};

const fmtEur = n =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const fmtN = n =>
  new Intl.NumberFormat("fr-FR").format(Math.round(n));

// ─────────────────────────────────────────
export default function App() {
  const [prixBien,     setPrixBien]     = useState(300000);
  const [apport,       setApport]       = useState(10);
  const [duree,        setDuree]        = useState(20);
  const [tauxCredit,   setTauxCredit]   = useState(3.5);
  const [coupleMode,   setCoupleMode]   = useState(false);
  const [fraisNotaire, setFraisNotaire] = useState(7.5);
  const [fraisAgence,  setFraisAgence]  = useState(4);

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
    const fa       = prixBien * fraisAgence  / 100;
    const total    = prixBien + fn + fa;
    const emprunte = total * (1 - apport / 100);
    const tm       = tauxCredit / 100 / 12;
    const n        = duree * 12;
    const mensualite = tm === 0 ? emprunte / n : (emprunte * tm) / (1 - Math.pow(1 + tm, -n));
    const revMin   = mensualite / 0.35;

    const totauxCSP = {};
    let totalMenages = 0;
    CSP_META.forEach(m => { totauxCSP[m.id] = 0; });
    COMMUNES.forEach(c => {
      if (!communesActives.has(c.id)) return;
      totalMenages += c.menagesTotal;
      CSP_META.forEach(m => { totauxCSP[m.id] += c.csp[m.id]; });
    });

    const csps = CSP_META.map(meta => {
      const menages = totauxCSP[meta.id];
      const pct     = totalMenages > 0 ? (menages / totalMenages) * 100 : 0;
      const salaire = SALAIRE_CSP[meta.id];
      const rev     = coupleMode ? salaire * 2 : salaire;
      return { ...meta, menages, pct, salaireMensuelNet: salaire, accessible: rev >= revMin, endettement: (mensualite / rev) * 100 };
    });

    const menagesOk = csps.filter(c => c.accessible).reduce((s, c) => s + c.menages, 0);
    const popActive = COMMUNES.filter(c => communesActives.has(c.id)).reduce((s, c) => s + c.pop, 0);
    return { fn, fa, total, mensualite, revMin, revMinCouple: revMin / 2, csps, menagesOk, totalMenages, pctOk: totalMenages > 0 ? (menagesOk / totalMenages) * 100 : 0, popActive };
  }, [prixBien, apport, duree, tauxCredit, coupleMode, fraisNotaire, fraisAgence, communesActives]);

  const statusColor = calc.pctOk < 15 ? C.danger : calc.pctOk < 35 ? C.gold : C.success;
  const nbCommunes  = communesActives.size;

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
              <Slider label="Prix affiché" value={prixBien} min={50000} max={800000} step={5000}
                display={fmtEur(prixBien)} onChange={setPrixBien} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                <Slider label={`Notaire ${fraisNotaire}%`} value={fraisNotaire} min={2} max={10} step={0.5}
                  display={fmtEur(calc.fn)} onChange={setFraisNotaire} compact />
                <Slider label={`Agence ${fraisAgence}%`} value={fraisAgence} min={0} max={8} step={0.5}
                  display={fmtEur(calc.fa)} onChange={setFraisAgence} compact />
              </div>
              <TotalRow label="Coût total" value={fmtEur(calc.total)} />
            </Panel>

            <Panel title="Crédit immobilier" icon="🏦">
              <Slider label={`Apport ${apport}%`} value={apport} min={0} max={40} step={1}
                display={fmtEur(calc.total * apport / 100)} onChange={setApport} />
              <Slider label="Durée" value={duree} min={10} max={25} step={1}
                display={`${duree} ans`} onChange={setDuree} />
              <Slider label="Taux" value={tauxCredit} min={1} max={6} step={0.1}
                display={`${tauxCredit.toFixed(1)} %`} onChange={setTauxCredit} />
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
                <MiniStat label="Min. seul"     value={fmtEur(calc.revMin)       + "/mois"} />
                <MiniStat label="Min. par pers." value={fmtEur(calc.revMinCouple) + "/mois"} />
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
              <SectionLabel text="Accessibilité par CSP — périmètre sélectionné (INSEE RP2022)" />
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 13 }}>
                {calc.csps.map(csp => <CSPRow key={csp.id} csp={csp} coupleMode={coupleMode} />)}
              </div>
              <div style={{ marginTop: 14, paddingTop: 11, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Legend color={C.success} label="Accessible (endettement < 35 %)" />
                <Legend color={C.danger}  label="Hors de portée (endettement > 35 %)" />
              </div>
            </div>

            {/* PopChart */}
            <div style={{ background: C.navy2, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 14, padding: "18px 22px" }}>
              <SectionLabel text="Répartition des ménages par CSP sur le périmètre" />
              <PopChart csps={calc.csps} />
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
  const { accessible, endettement, label, icon, salaireMensuelNet, pct, menages } = csp;
  const rev     = coupleMode ? salaireMensuelNet * 2 : salaireMensuelNet;
  const barW    = Math.min((pct / 28) * 100, 100);
  const statusC = accessible ? C.success : C.danger;
  return (
    <div style={{ opacity: accessible ? 1 : 0.48, transition: "opacity 0.3s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
        <span style={{ fontSize: 13, flexShrink: 0, width: 18 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 11, color: accessible ? C.cream : C.grey, fontWeight: accessible ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ fontSize: 10, color: C.grey, flexShrink: 0, marginRight: 5 }}>~{fmtEur(rev)}/mois</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: statusC, background: `${statusC}18`, border: `1px solid ${statusC}44`, padding: "2px 6px", borderRadius: 3, flexShrink: 0, minWidth: 60, textAlign: "center" }}>
          {endettement.toFixed(0)} % endetté
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${barW}%`, background: accessible ? `linear-gradient(90deg, ${C.gold}, ${C.gold}88)` : "rgba(255,255,255,0.12)", borderRadius: 3, transition: "all 0.4s" }} />
        </div>
        <span style={{ fontSize: 10, color: C.grey, minWidth: 36, textAlign: "right" }}>{pct.toFixed(1)} %</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", minWidth: 60, textAlign: "right" }}>{fmtN(menages)} mén.</span>
      </div>
    </div>
  );
}

function PopChart({ csps }) {
  const total = csps.reduce((s, c) => s + c.menages, 0);
  return (
    <div style={{ marginTop: 11, display: "flex", flexDirection: "column", gap: 4 }}>
      {csps.map(csp => {
        const w = total > 0 ? (csp.menages / total) * 100 : 0;
        return (
          <div key={csp.id} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 12, width: 18, flexShrink: 0 }}>{csp.icon}</span>
            <div style={{
              height: 18, width: `${Math.max(w * 3.2, 4)}%`, maxWidth: "60%",
              background: csp.accessible ? `linear-gradient(90deg, ${C.gold}cc, ${C.gold}55)` : "rgba(255,255,255,0.07)",
              borderRadius: 3, display: "flex", alignItems: "center", paddingLeft: 6,
              transition: "all 0.4s", overflow: "hidden",
            }}>
              {w > 4 && <span style={{ fontSize: 9, color: csp.accessible ? "rgba(255,255,255,0.85)" : C.grey, whiteSpace: "nowrap", fontWeight: 600 }}>{csp.label}</span>}
            </div>
            <span style={{ fontSize: 10, color: C.grey }}>{w.toFixed(1)} % · {fmtN(csp.menages)}</span>
          </div>
        );
      })}
    </div>
  );
}
