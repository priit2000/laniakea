import React, { useState, useMemo, useRef, useEffect } from "react";

// ============================================================
//  COSMIC COLONIZATION EXPLORER
//  A what-if tool for no-FTL galactic expansion over deep time
// ============================================================

const HORIZON_GLY = 16.5; // comoving event horizon, billion ly
const STARS_PER_GALAXY = 1e11;

// Destinations: distance from Milky Way in million light-years (Mly)
const PLACES = [
  { name: "Milky Way", dist: 0.05, gal: 1, note: "Home. ~100,000 ly across.", tier: "home" },
  { name: "Magellanic Clouds", dist: 0.16, gal: 2, note: "LMC + SMC, our closest companions.", tier: "local" },
  { name: "Andromeda (M31)", dist: 2.5, gal: 1, note: "The Local Group's giant.", tier: "local" },
  { name: "Triangulum (M33)", dist: 2.7, gal: 1, note: "Third-largest in the Local Group.", tier: "local" },
  { name: "Local Group", dist: 5, gal: 80, note: "~80 galaxies, mostly dwarfs.", tier: "local" },
  { name: "M81 Group", dist: 11.8, gal: 34, note: "Bode's Galaxy and friends.", tier: "group" },
  { name: "Sculptor Group", dist: 12.7, gal: 13, note: "Nearest group beyond our own.", tier: "group" },
  { name: "Centaurus A / M83", dist: 13, gal: 30, note: "Bright peculiar galaxy group.", tier: "group" },
  { name: "Canes Venatici Groups", dist: 26, gal: 25, note: "Loose nearby filament groups.", tier: "group" },
  { name: "Leo Groups", dist: 35, gal: 20, note: "Leo I / Leo II groupings.", tier: "group" },
  { name: "Virgo Cluster", dist: 59, gal: 1500, note: "~1,300-2,000 galaxies. M87 lives here.", tier: "cluster" },
  { name: "Fornax Cluster", dist: 62, gal: 60, note: "Compact southern cluster.", tier: "cluster" },
  { name: "Eridanus Group", dist: 75, gal: 200, note: "Sprawling galaxy concentration.", tier: "cluster" },
  { name: "Antlia Cluster", dist: 132, gal: 234, note: "Third-nearest galaxy cluster.", tier: "cluster" },
  { name: "Great Attractor / Norma", dist: 200, gal: 600, note: "Gravitational anomaly pulling the Local Group.", tier: "super" },
  { name: "Perseus-Pisces Supercluster", dist: 250, gal: 3000, note: "Vast filament of galaxies.", tier: "super" },
  { name: "Coma Cluster", dist: 320, gal: 1000, note: "Over 1,000 galaxies, very dense.", tier: "super" },
  { name: "Shapley Supercluster", dist: 650, gal: 8000, note: "Most massive nearby concentration.", tier: "super" },
  { name: "Vela Supercluster", dist: 850, gal: 30000, note: "Hidden behind the galactic plane.", tier: "super" },
  { name: "Sloan Great Wall", dist: 1000, gal: 6000, note: "Galaxy filament ~1.37 billion ly long; thousands of galaxies.", tier: "wall" },
  { name: "BOSS Great Wall", dist: 4500, gal: 10000, note: "Supercluster complex spanning ~1 billion ly.", tier: "wall" },
  { name: "Huge-LQG", dist: 9000, gal: 73, note: "Large quasar group ~4 billion ly across.", tier: "wall" },
  { name: "Clowes-Campusano LQG", dist: 9500, gal: 34, note: "One of the earliest huge quasar groups found.", tier: "wall" },
  { name: "Hercules-Corona Borealis Wall", dist: 15000, gal: 100000, note: "Largest known structure; ~10 billion ly long. Near the reachable edge.", tier: "wall" },
  { name: "Event horizon (dark-energy wall)", dist: 16500, gal: 0, note: "Beyond this comoving distance nothing is reachable at any speed - expansion outruns light.", tier: "wall" },
];

const STAR_TYPES = [
  { type: "M dwarfs", frac: 0.73, life: "trillions of yr", verdict: "Best long-term", color: "#c0392b",
    why: "Most abundant by far, trillion-year lifetimes. Flares & tidal locking hurt biology, but vanish for machine settlement." },
  { type: "K dwarfs", frac: 0.13, life: "15-45 B yr", verdict: "Best overall", color: "#e67e22",
    why: "The sweet spot - stable, long-lived, wide habitable zones, far calmer than M dwarfs." },
  { type: "G dwarfs", frac: 0.06, life: "~10 B yr", verdict: "Good", color: "#d4a017",
    why: "Sun-like. Fine for a billion-year project, just rarer and shorter-lived." },
  { type: "F dwarfs", frac: 0.03, life: "2-4 B yr", verdict: "Marginal", color: "#c9a24b",
    why: "Shorter lifetimes and more UV. Usable but not ideal." },
  { type: "A / B / O", frac: 0.05, life: "Myr-2 B yr", verdict: "Industry only", color: "#5b9bd5",
    why: "Burn out fast, flood neighbors with UV. Temporary industrial sites at best." },
];

function fmtBig(n) {
  if (n >= 1e24) return (n / 1e24).toFixed(1).replace(/\.0$/, "") + " septillion";
  if (n >= 1e21) return (n / 1e21).toFixed(1).replace(/\.0$/, "") + " sextillion";
  if (n >= 1e18) return (n / 1e18).toFixed(1).replace(/\.0$/, "") + " quintillion";
  if (n >= 1e15) return (n / 1e15).toFixed(1).replace(/\.0$/, "") + " quadrillion";
  if (n >= 1e12) return (n / 1e12).toFixed(1).replace(/\.0$/, "") + " trillion";
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + " billion";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + " million";
  if (n >= 1e3) return Math.round(n / 1e3) + ",000";
  return Math.round(n).toLocaleString();
}

function fmtDist(mly) {
  if (mly >= 1000) return (mly / 1000).toFixed(2) + " billion ly";
  if (mly >= 1) return mly.toFixed(0) + " million ly";
  return (mly * 1000).toFixed(0) + ",000 ly";
}

function lorentz(v) {
  if (v >= 1) return Infinity;
  return 1 / Math.sqrt(1 - v * v);
}

export default function CosmicColonizationExplorer() {
  const [speed, setSpeed] = useState(0.1);
  const [years, setYears] = useState(1.0);
  const [showVoids, setShowVoids] = useState(true);
  const [scaleMode, setScaleMode] = useState("log"); // "log" | "linear"
  const [hoverPlace, setHoverPlace] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [includeDecel, setIncludeDecel] = useState(true);
  const [openStat, setOpenStat] = useState(null);
  const [holdMode, setHoldMode] = useState("time"); // "time" | "speed" - which stays fixed on place-click
  const canvasRef = useRef(null);

  const rawRadiusMly = useMemo(() => speed * years * 1000, [speed, years]);
  const horizonMly = HORIZON_GLY * 1000;
  // The frontier can never exceed the dark-energy event horizon, no matter how long you wait.
  const radiusMly = Math.min(rawRadiusMly, horizonMly);
  const atWall = rawRadiusMly >= horizonMly;

  const { galaxies, stars, reachedPlaces } = useMemo(() => {
    const reached = PLACES.filter((p) => p.dist <= radiusMly);
    const r = radiusMly;
    let galModel;
    if (r < 0.1) galModel = 1;
    else galModel = Math.max(reached.reduce((s, p) => s + p.gal, 0), Math.pow(r, 2.15) * 0.9);
    return { galaxies: galModel, stars: galModel * STARS_PER_GALAXY, reachedPlaces: reached };
  }, [radiusMly]);

  const gamma = lorentz(speed);
  const energyPerKg = (gamma - 1) * 9e16 * (includeDecel ? 2 : 1);
  const megatonsPerKg = energyPerKg / 4.184e15;
  const horizonFrac = Math.min(1, (radiusMly / 1000) / HORIZON_GLY);

  // Live values for the canvas without re-seeding the scene.
  const live = useRef({ radiusMly, showVoids, scaleMode, hoverPlace, selectedPlace });
  live.current = { radiusMly, showVoids, scaleMode, hoverPlace, selectedPlace };

  // Click a place -> select it and adjust whichever variable is NOT held so the frontier just reaches it.
  const goToPlace = (p) => {
    setSelectedPlace(p.name);
    const targetGly = p.dist / 1000; // distance in billion ly
    if (holdMode === "time") {
      // hold the current time, solve for the speed needed
      const needSpeed = Math.min(0.95, Math.max(0.005, p.dist / (years * 1000)));
      setSpeed(+needSpeed.toFixed(3));
    } else {
      // hold the current speed, solve for the time needed (capped at the slider max of 18 Gyr)
      const needYears = Math.min(18, Math.max(0.05, targetGly / speed));
      setYears(+needYears.toFixed(2));
    }
  };

  // ---- Canvas: seed geometry ONCE, animate by reading refs ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf;
    let stars = [];
    let placePts = [];
    let cx = 0, cy = 0, maxR = 0;
    const maxMly = 16500; // out to the dark-energy event horizon
    let clickTargets = [];
    let resizeObserver;
    let resizeRetry;

    const scaleFns = {
      log: (mly) => (Math.log10(mly + 1) / Math.log10(maxMly + 1)) * maxR,
      linear: (mly) => (mly / maxMly) * maxR,
    };

    function seed() {
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (!cssW || !cssH) {
        window.clearTimeout(resizeRetry);
        resizeRetry = window.setTimeout(seed, 50);
        return;
      }
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = cssW / 2; cy = cssH / 2;
      maxR = Math.min(cssW, cssH) * 0.46;

      stars = [];
      for (let i = 0; i < 520; i++) {
        const ang = (i * 2.399963) % (Math.PI * 2); // golden-angle, stable
        const fil = Math.sin(ang * 3 + i) * 0.5 + 0.5;
        const frac = Math.pow((i % 97) / 97, 0.6);
        stars.push({
          ang,
          frac, // 0..1 of maxMly, converted per-frame by current scale
          mly: frac * maxMly,
          size: ((i * 13) % 16) / 10 + 0.4,
          tw: (i % 31) / 31 * Math.PI * 2,
          inVoid: fil < 0.45,
          hue: ["#ffd9a0", "#fff4dd", "#ffb86b", "#d6e6ff", "#ffffff"][i % 5],
        });
      }
      placePts = PLACES.map((p, idx) => {
        const ang = (idx / PLACES.length) * Math.PI * 2 + 0.4;
        return { ...p, ang };
      });
    }

    function pos(ang, mly) {
      const sc = scaleFns[live.current.scaleMode] || scaleFns.log;
      const r = sc(mly);
      return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
    }

    let t0 = performance.now();
    function draw(now) {
      const { radiusMly: R, showVoids: voids, hoverPlace: hov, selectedPlace: sel } = live.current;
      const dt = (now - t0) / 1000;
      const cssW = cx * 2, cssH = cy * 2;
      ctx.clearRect(0, 0, cssW, cssH);

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 1.3);
      g.addColorStop(0, "#0a0f2c");
      g.addColorStop(0.5, "#070b22");
      g.addColorStop(1, "#03040f");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cssW, cssH);

      const sc = scaleFns[live.current.scaleMode] || scaleFns.log;
      const reachR = sc(R);

      if (voids) {
        ctx.globalAlpha = 0.25;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + 0.7;
          const vr = maxR * (0.55 + (i % 3) * 0.12);
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * vr, cy + Math.sin(a) * vr, maxR * 0.16, 0, Math.PI * 2);
          ctx.fillStyle = "#000008";
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      stars.forEach((s) => {
        if (voids && s.inVoid && s.mly > R) return;
        const [x, y] = pos(s.ang, s.mly);
        const tw = 0.6 + 0.4 * Math.sin(dt * 1.5 + s.tw);
        const reached = s.mly <= R;
        ctx.beginPath();
        ctx.arc(x, y, s.size * (reached ? 1.2 : 1), 0, Math.PI * 2);
        ctx.fillStyle = reached ? "#7CFFB2" : s.hue;
        ctx.globalAlpha = reached ? 0.9 : tw * 0.85;
        ctx.shadowBlur = reached ? 6 : 0;
        ctx.shadowColor = reached ? "#7CFFB2" : "transparent";
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      const pulse = 1 + Math.sin(dt * 2) * 0.012;
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, reachR) * pulse);
      bg.addColorStop(0, "rgba(124,255,178,0.16)");
      bg.addColorStop(0.7, "rgba(124,255,178,0.06)");
      bg.addColorStop(1, "rgba(124,255,178,0.0)");
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1, reachR) * pulse, 0, Math.PI * 2);
      ctx.fillStyle = bg;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1, reachR) * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(124,255,178,0.85)";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#7CFFB2";
      ctx.stroke();
      ctx.shadowBlur = 0;

      for (let k = 0; k < 3; k++) {
        const wr = Math.max(1, reachR) * (((dt * 0.25 + k / 3) % 1));
        ctx.beginPath();
        ctx.arc(cx, cy, wr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(124,255,178,${0.18 * (1 - wr / Math.max(1, reachR))})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      clickTargets = [];
      placePts.forEach((p) => {
        const [x, y] = pos(p.ang, p.dist);
        const reached = p.dist <= R;
        const isHover = hov === p.name;
        const isSel = sel === p.name;
        clickTargets.push({ name: p.name, x, y, r: 14 });
        ctx.beginPath();
        ctx.arc(x, y, isSel ? 7 : isHover ? 6 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = reached ? "#7CFFB2" : "#ff8a8a";
        ctx.shadowBlur = isSel ? 16 : isHover ? 12 : 4;
        ctx.shadowColor = reached ? "#7CFFB2" : "#ff8a8a";
        ctx.fill();
        if (isSel) {
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        if (isHover || isSel || p.tier !== "wall") {
          ctx.font = `${isHover || isSel ? "16px" : "14px"} ui-monospace, monospace`;
          ctx.fillStyle = isHover || isSel ? "#ffffff" : reached ? "rgba(255,255,255,0.78)" : "rgba(255,210,210,0.7)";
          ctx.textAlign = x < cx ? "right" : "left";
          ctx.fillText(p.name, x + (x < cx ? -9 : 9), y + 3);
        }
      });

      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.shadowBlur = 16;
      ctx.shadowColor = "#bcd4ff";
      ctx.fill();
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    }

    seed();
    raf = requestAnimationFrame(draw);

    const onResize = () => seed();
    window.addEventListener("resize", onResize);
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(seed);
      resizeObserver.observe(canvas);
    }

    // interactive: click / hover the map
    const rectOf = () => canvas.getBoundingClientRect();
    const hitTest = (mx, my) => {
      const rect = rectOf();
      const x = mx - rect.left, y = my - rect.top;
      let best = null, bestD = 1e9;
      clickTargets.forEach((t) => {
        const d = Math.hypot(t.x - x, t.y - y);
        if (d < t.r && d < bestD) { best = t.name; bestD = d; }
      });
      return best;
    };
    const onMove = (e) => {
      const hit = hitTest(e.clientX, e.clientY);
      setHoverPlace(hit);
      canvas.style.cursor = hit ? "pointer" : "default";
    };
    const onClick = (e) => {
      const hit = hitTest(e.clientX, e.clientY);
      if (hit) {
        const p = PLACES.find((q) => q.name === hit);
        if (p) goToPlaceRef.current(p);
      }
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeRetry);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click", onClick);
    };
  }, []); // seed once, then redraw from live refs

  // keep latest goToPlace reachable from the canvas listeners
  const goToPlaceRef = useRef(goToPlace);
  goToPlaceRef.current = goToPlace;

  const presets = [
    { label: "Conservative", v: 0.01 },
    { label: "Realistic", v: 0.1 },
    { label: "Aggressive", v: 0.2 },
    { label: "Relativistic probes", v: 0.9 },
  ];

  const speedVerdict =
    speed <= 0.02 ? "Conservative - slow steady interstellar creep." :
    speed <= 0.12 ? "Realistic - the physically sane central estimate." :
    speed <= 0.25 ? "Aggressive - extreme but possible for probe swarms." :
    speed <= 0.55 ? "Borderline absurd - staggering energy & logistics." :
    "Tiny hardened seed probes only - not bulk colonization.";

  const sel = selectedPlace ? PLACES.find((p) => p.name === selectedPlace) : null;

  // Interactive stat cards: each expands a detail panel on click.
  const statDetails = {
    galaxies: `At ${fmtDist(radiusMly)} the frontier-weighted count is ~${fmtBig(galaxies)} galaxies. The model scales with radius^2.15 (filaments fill faster than a solid sphere but skip the voids). Doubling your speed roughly quadruples this.`,
    stars: `Using ~100 billion stars per galaxy, that is ~${fmtBig(stars)} stars. Most are red dwarfs - the long-lived real estate. See the star table below for which ones are worth settling.`,
    places: `${reachedPlaces.length} of ${PLACES.length} mapped destinations are inside the frontier: ${reachedPlaces.map((p) => p.name).slice(0, 6).join(", ")}${reachedPlaces.length > 6 ? "..." : ""}. Click any name on the map or in the list to jump there.`,
    gamma: gamma === Infinity ? "At light speed gamma is infinite - physically impossible for matter." : `At ${speed.toFixed(2)}c, time dilation factor gamma = ${gamma.toFixed(3)}. A clock on the ship runs ${gamma.toFixed(2)}x slower than home. Energy cost scales with (gamma - 1).`,
  };

  const stats = [
    { key: "galaxies", label: "Galaxies claimed", value: fmtBig(galaxies), accent: "#1a7a4c" },
    { key: "stars", label: "Stars claimed", value: fmtBig(stars), accent: "#9c5d0f" },
    { key: "places", label: "Places reached", value: `${reachedPlaces.length} / ${PLACES.length}`, accent: "#2f5fb0" },
    { key: "gamma", label: "Lorentz factor gamma", value: gamma === Infinity ? "infinity" : gamma.toFixed(2), accent: "#a82f70" },
  ];

  return (
    <div style={styles.root}>
      <style>{css}</style>

      <header style={styles.header}>
        <div style={styles.kicker}>No-FTL · Real Physics · Deep Time</div>
        <h1 style={styles.h1}>The Colonization Horizon</h1>
        <p style={styles.sub}>
          How far could a self-replicating wave of settlements spread across the
          cosmic web? Pull the levers, click the stars, and watch the frontier breathe.
        </p>
      </header>

      <div className="gridcollapse" style={styles.grid}>
        {/* CONTROLS */}
        <section style={styles.panel}>
          <h2 style={styles.h2}>Set the scenario</h2>

          <div style={styles.presetRow}>
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => setSpeed(p.v)}
                className="preset-btn"
                style={{
                  ...styles.presetBtn,
                  ...(Math.abs(speed - p.v) < 1e-9 ? styles.presetBtnActive : {}),
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div style={styles.sliderBlock}>
            <div style={styles.sliderLabel}>
              <span>Effective front speed</span>
              <span style={styles.sliderVal}>{speed.toFixed(2)}c</span>
            </div>
            <input
              type="range" min="0.005" max="0.95" step="0.005"
              value={speed} onChange={(e) => setSpeed(+e.target.value)}
              className="slider"
              aria-label="Effective front speed as a fraction of light speed"
              aria-valuetext={`${speed.toFixed(2)} times light speed`}
            />
            <div style={styles.hint}>{speedVerdict}</div>
          </div>

          <div style={styles.sliderBlock}>
            <div style={styles.sliderLabel}>
              <span>Time elapsed</span>
              <span style={styles.sliderVal}>{years.toFixed(2)} billion yr</span>
            </div>
            <input
              type="range" min="0.05" max="18" step="0.1"
              value={years} onChange={(e) => setYears(+e.target.value)}
              className="slider"
              aria-label="Time elapsed in billions of years"
              aria-valuetext={`${years.toFixed(2)} billion years`}
            />
            <div style={styles.hint}>
              {atWall ? "Frontier has hit the dark-energy wall - expansion caps it here no matter how long you wait." :
               years < 1 ? "Less than the headline campaign." :
               years <= 1.05 ? "The classic 1-billion-year question." :
               years <= 5 ? "Long enough to start bumping the cosmic event horizon." :
               "Deep time - the frontier is pushing toward the reachable edge of everything."}
            </div>
          </div>

          <div style={styles.toggleRow}>
            <label style={styles.toggle}>
              <input type="checkbox" checked={showVoids} onChange={(e) => setShowVoids(e.target.checked)} />
              <span>Show cosmic voids (front threads filaments)</span>
            </label>
            <label style={styles.toggle}>
              <input type="checkbox" checked={includeDecel} onChange={(e) => setIncludeDecel(e.target.checked)} />
              <span>Count energy to stop, not just go</span>
            </label>
          </div>

          <div style={styles.bigResult}>
            <div style={styles.bigLabel}>{atWall ? "Frontier capped at the wall" : "Frontier radius reached"}</div>
            <div style={styles.bigNum}>{fmtDist(radiusMly)}</div>
            <div style={styles.bigSub}>
              {atWall
                ? "the dark-energy event horizon - the edge of everything reachable"
                : `diameter ~ ${fmtDist(radiusMly * 2)}`}
            </div>
          </div>
        </section>

        {/* MAP */}
        <section style={styles.mapPanel}>
          <div style={styles.mapHeader}>
            <span>The expanding frontier</span>
            <div style={styles.mapControls}>
              <div style={styles.scaleToggle}>
                <button
                  onClick={() => setScaleMode("log")}
                  className="scale-btn"
                  style={{ ...styles.scaleBtn, ...(scaleMode === "log" ? styles.scaleBtnActive : {}) }}
                  aria-pressed={scaleMode === "log"}
                >log</button>
                <button
                  onClick={() => setScaleMode("linear")}
                  className="scale-btn"
                  style={{ ...styles.scaleBtn, ...(scaleMode === "linear" ? styles.scaleBtnActive : {}) }}
                  aria-pressed={scaleMode === "linear"}
                >linear</button>
              </div>
              <span style={styles.mapLegend}>
                <i style={{ ...styles.dot, background: "#7CFFB2" }} /> reached
                <i style={{ ...styles.dot, background: "#ff8a8a", marginLeft: 12 }} /> beyond
              </span>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Interactive star map. At ${speed.toFixed(2)} times light speed over ${years.toFixed(2)} billion years the frontier reaches ${fmtDist(radiusMly)}, claiming ${reachedPlaces.length} of ${PLACES.length} mapped destinations. Click a destination to jump to it.`}
            style={styles.canvas}
          />
          <div style={styles.mapFoot}>
            {scaleMode === "log"
              ? "Logarithmic scale - the whole reachable universe out to the ~16.5 billion ly event horizon fits on screen. Click any dot to set the speed that just reaches it."
              : "Linear scale - true proportional distances. Nearby groups crowd the center; click a dot to jump."}
            {sel && <span style={styles.selNote}> Selected: <strong>{sel.name}</strong> ({fmtDist(sel.dist)})</span>}
          </div>
        </section>
      </div>

      {/* INTERACTIVE STAT CARDS */}
      <div style={styles.statsStrip}>
        {stats.map((s) => (
          <button
            key={s.key}
            className="stat-card"
            onClick={() => setOpenStat(openStat === s.key ? null : s.key)}
            aria-expanded={openStat === s.key}
            style={{ ...styles.stat, ...(openStat === s.key ? styles.statOpen : {}) }}
          >
            <div style={{ ...styles.statValue, color: s.accent }}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
            <div style={styles.statHintRow}>{openStat === s.key ? "tap to close" : "tap for detail"}</div>
          </button>
        ))}
      </div>
      {openStat && (
        <div style={styles.statDetail}>
          {statDetails[openStat]}
        </div>
      )}

      {/* ENERGY + HORIZON */}
      <div className="gridcollapse" style={styles.dualRow}>
        <div style={styles.subPanel}>
          <h3 style={styles.h3}>The energy bill</h3>
          <p style={styles.pSmall}>
            Kinetic energy to push <strong>one kilogram</strong> to {speed.toFixed(2)}c
            {includeDecel ? " and stop it again" : " (one way only)"}:
          </p>
          <div style={styles.energyNum}>
            {megatonsPerKg < 0.001 ? (megatonsPerKg * 1000).toFixed(2) + " kt"
              : megatonsPerKg.toFixed(megatonsPerKg < 10 ? 2 : 0) + " megatons"} <span style={styles.perKg}>/ kg</span>
          </div>
          <div style={styles.energyBarWrap}>
            <div style={{ ...styles.energyBar, width: `${Math.min(100, (megatonsPerKg / 120) * 100)}%` }} />
          </div>
          <p style={styles.pTiny}>
            {speed >= 0.85
              ? "This is why 0.9c is for tiny hardened probes only - and you still have to brake against the interstellar medium."
              : speed >= 0.4
              ? "Already brutal. The rocket equation makes carrying this much fuel nearly impossible."
              : "Manageable for self-replicating settlements that refuel at each stop."}
          </p>
        </div>

        <div style={styles.subPanel}>
          <h3 style={styles.h3}>The dark-energy wall</h3>
          <p style={styles.pSmall}>
            Anything beyond ~{HORIZON_GLY} billion ly comoving is unreachable at any
            speed - expansion outruns light. Your frontier vs. that wall:
          </p>
          <div style={styles.horizonWrap}>
            <div style={styles.horizonTrack}>
              <div style={{ ...styles.horizonFill, width: `${Math.max(1, horizonFrac * 100)}%` }} />
              <div style={styles.horizonMark}>event horizon</div>
            </div>
            <div style={styles.horizonPct}>
              {horizonFrac < 0.001 ? "<0.1" : (horizonFrac * 100).toFixed(horizonFrac < 0.1 ? 2 : 1)}% of the way to the wall
            </div>
          </div>
          <p style={styles.pTiny}>
            Over a single billion years you never come close - this is a local-universe
            problem, not a horizon problem. A trillion-year campaign would slam into it.
          </p>
        </div>
      </div>

      {/* PLACES */}
      <section style={styles.panelWide}>
        <h2 style={styles.h2}>What's inside the frontier</h2>
        <div style={styles.holdRow}>
          <span style={styles.holdLabel}>When you click a place, hold:</span>
          <div style={styles.holdToggle}>
            <button
              onClick={() => setHoldMode("time")}
              className="hold-btn"
              style={{ ...styles.holdBtn, ...(holdMode === "time" ? styles.holdBtnActive : {}) }}
              aria-pressed={holdMode === "time"}
            >time ({years.toFixed(2)} Byr)</button>
            <button
              onClick={() => setHoldMode("speed")}
              className="hold-btn"
              style={{ ...styles.holdBtn, ...(holdMode === "speed" ? styles.holdBtnActive : {}) }}
              aria-pressed={holdMode === "speed"}
            >speed ({speed.toFixed(2)}c)</button>
          </div>
        </div>
        <p style={styles.pSmall}>
          {holdMode === "time"
            ? `Clicking a place holds time at ${years.toFixed(2)} billion years and solves for the speed needed to just reach it.`
            : `Clicking a place holds speed at ${speed.toFixed(2)}c and solves for the time needed to just reach it.`}
        </p>
        <div style={styles.placeGrid}>
          {PLACES.map((p) => {
            const reached = p.dist <= radiusMly;
            const isSel = selectedPlace === p.name;
            return (
              <button
                key={p.name}
                className="place-card"
                onClick={() => goToPlace(p)}
                onMouseEnter={() => setHoverPlace(p.name)}
                onMouseLeave={() => setHoverPlace(null)}
                onFocus={() => setHoverPlace(p.name)}
                onBlur={() => setHoverPlace(null)}
                aria-label={`${p.name}, ${fmtDist(p.dist)} away, ${reached ? "reached" : "beyond the frontier"}. Click to jump.`}
                style={{
                  ...styles.placeCard,
                  borderColor: isSel ? "#166b46" : reached ? "rgba(31,122,74,0.45)" : "rgba(168,53,49,0.3)",
                  background: reached ? "rgba(124,255,178,0.10)" : "rgba(168,53,49,0.05)",
                  outline: isSel ? "2px solid #166b46" : "none",
                  opacity: reached ? 1 : 0.72,
                }}
              >
                <div style={styles.placeTop}>
                  <span style={{ ...styles.placeStatus, background: reached ? "#1f7a4a" : "#a83531" }}>
                    {reached ? "REACHED" : "BEYOND"}
                  </span>
                  <span style={styles.placeDist}>{fmtDist(p.dist)}</span>
                </div>
                <div style={styles.placeName}>{p.name}</div>
                <div style={styles.placeNote}>{p.note}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* STARS */}
      <section style={styles.panelWide}>
        <h2 style={styles.h2}>Which stars to settle</h2>
        <p style={styles.pSmall}>
          For a billion-year project you want longevity and stability. The hot, massive
          stars burn out fast and flood their neighbors with UV - skip them.
        </p>
        <div style={styles.starGrid}>
          {STAR_TYPES.map((s) => (
            <div key={s.type} style={styles.starCard}>
              <div style={styles.starHead}>
                <span style={{ ...styles.starSwatch, background: s.color }} />
                <span style={styles.starType}>{s.type}</span>
                <span style={styles.starVerdict}>{s.verdict}</span>
              </div>
              <div style={styles.starBarWrap}>
                <div style={{ ...styles.starBar, width: `${s.frac * 100}%`, background: s.color }} />
                <span style={styles.starFrac}>{(s.frac * 100).toFixed(0)}% of all stars</span>
              </div>
              <div style={styles.starLife}>Lifespan: {s.life}</div>
              <div style={styles.starWhy}>{s.why}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={styles.footer}>
        A toy model for intuition, not a research instrument. Galaxy/star counts use a
        filament-weighted scaling fit anchored to real catalog distances; treat orders
        of magnitude as the meaningful signal.
      </footer>
    </div>
  );
}

// ============================================================
//  STYLES
// ============================================================
const ACCENT = "#166b46";

const styles = {
  root: {
    fontFamily: "'Spectral', Georgia, serif",
    background: "linear-gradient(160deg, #fbf7ef 0%, #f3ece0 100%)",
    color: "#23211c", minHeight: "100vh",
    padding: "clamp(20px, 4vw, 56px)", maxWidth: 1180, margin: "0 auto",
  },
  header: { marginBottom: 36, maxWidth: 720 },
  kicker: { fontFamily: "'Space Mono', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: ACCENT, marginBottom: 14 },
  h1: { fontSize: "clamp(42px, 7vw, 78px)", lineHeight: 0.95, margin: 0, fontWeight: 800, letterSpacing: "-0.02em", color: "#1a1813" },
  sub: { fontSize: 20, lineHeight: 1.55, color: "#4a4538", marginTop: 18 },
  grid: { display: "grid", gridTemplateColumns: "minmax(280px, 360px) 1fr", gap: 22, marginBottom: 22, alignItems: "start" },
  panel: { background: "#fffdf8", borderRadius: 18, padding: 26, border: "1px solid #e8e0d0", boxShadow: "0 8px 30px rgba(120,100,60,0.07)" },
  panelWide: { background: "#fffdf8", borderRadius: 18, padding: "30px clamp(20px,3vw,34px)", border: "1px solid #e8e0d0", boxShadow: "0 8px 30px rgba(120,100,60,0.07)", marginBottom: 22 },
  subPanel: { background: "#fffdf8", borderRadius: 18, padding: 26, border: "1px solid #e8e0d0", boxShadow: "0 8px 30px rgba(120,100,60,0.07)" },
  h2: { fontSize: 24, fontWeight: 700, margin: "0 0 18px", color: "#1a1813" },
  h3: { fontSize: 19, fontWeight: 700, margin: "0 0 10px", color: "#1a1813", fontFamily: "'Space Mono', monospace", letterSpacing: "-0.01em" },
  presetRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  presetBtn: { fontFamily: "'Space Mono', monospace", fontSize: 15, padding: "8px 12px", borderRadius: 10, border: "1px solid #d8cfba", background: "#f6f0e4", color: "#4a4538", cursor: "pointer", transition: "all .18s ease" },
  presetBtnActive: { background: ACCENT, color: "#fff", borderColor: ACCENT, boxShadow: "0 4px 14px rgba(22,107,70,0.3)" },
  sliderBlock: { marginBottom: 22 },
  sliderLabel: { display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#3a352b" },
  sliderVal: { fontFamily: "'Space Mono', monospace", fontSize: 20, color: ACCENT, fontWeight: 700 },
  hint: { fontSize: 16, color: "#5f5848", marginTop: 8, fontStyle: "italic", lineHeight: 1.4 },
  toggleRow: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 },
  toggle: { display: "flex", alignItems: "center", gap: 9, fontSize: 16, color: "#4a4538", cursor: "pointer" },
  bigResult: { background: "linear-gradient(135deg, #0a0f2c, #1a2350)", borderRadius: 14, padding: "20px 22px", color: "#fff", textAlign: "center" },
  bigLabel: { fontFamily: "'Space Mono', monospace", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: "#7CFFB2", marginBottom: 6 },
  bigNum: { fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 },
  bigSub: { fontSize: 16, color: "#b8c4e8", marginTop: 8 },
  mapPanel: { background: "#070b22", borderRadius: 18, padding: 16, border: "1px solid #1a2350", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(10,15,44,0.25)" },
  mapHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", color: "#dde6fb", fontSize: 16, fontFamily: "'Space Mono', monospace", padding: "4px 8px 12px", flexWrap: "wrap", gap: 8 },
  mapControls: { display: "flex", alignItems: "center", gap: 14 },
  scaleToggle: { display: "flex", border: "1px solid #2a3568", borderRadius: 8, overflow: "hidden" },
  scaleBtn: { fontFamily: "'Space Mono', monospace", fontSize: 15, padding: "5px 12px", background: "transparent", color: "#9aa6cc", border: "none", cursor: "pointer", transition: "all .15s ease" },
  scaleBtnActive: { background: "#7CFFB2", color: "#062315", fontWeight: 700 },
  mapLegend: { display: "flex", alignItems: "center", fontSize: 15, color: "#aab4d8" },
  dot: { display: "inline-block", width: 8, height: 8, borderRadius: "50%", marginRight: 5 },
  canvas: { width: "100%", height: 440, borderRadius: 12, display: "block" },
  mapFoot: { color: "#9aa6cc", fontSize: 16, padding: "12px 8px 4px", lineHeight: 1.45 },
  selNote: { color: "#7CFFB2" },
  statsStrip: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 },
  stat: { background: "#fffdf8", borderRadius: 14, padding: "18px 20px", border: "1px solid #e8e0d0", textAlign: "center", boxShadow: "0 6px 22px rgba(120,100,60,0.06)", cursor: "pointer", transition: "all .18s ease", fontFamily: "inherit" },
  statOpen: { borderColor: ACCENT, boxShadow: "0 8px 26px rgba(22,107,70,0.18)", transform: "translateY(-2px)" },
  statValue: { fontSize: 28, fontWeight: 800, fontFamily: "'Space Mono', monospace", lineHeight: 1 },
  statLabel: { fontSize: 16, color: "#4a4538", marginTop: 8, letterSpacing: 0.3 },
  statHintRow: { fontSize: 14, color: ACCENT, marginTop: 8, fontFamily: "'Space Mono', monospace", letterSpacing: 0.5 },
  statDetail: { background: "#fff8e8", border: "1px solid #e4d9b8", borderRadius: 12, padding: "16px 20px", marginBottom: 22, fontSize: 16, lineHeight: 1.55, color: "#3a352b" },
  dualRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: 22 },
  pSmall: { fontSize: 16, lineHeight: 1.55, color: "#4a4538", margin: "0 0 12px" },
  pTiny: { fontSize: 16, lineHeight: 1.5, color: "#5f5848", margin: "12px 0 0", fontStyle: "italic" },
  energyNum: { fontSize: 34, fontWeight: 800, color: "#a23a0d", fontFamily: "'Space Mono', monospace" },
  perKg: { fontSize: 17, color: "#6b6453", fontWeight: 400 },
  energyBarWrap: { height: 8, background: "#efe7d6", borderRadius: 6, marginTop: 12, overflow: "hidden" },
  energyBar: { height: "100%", background: "linear-gradient(90deg, #e8a020, #b8430f)", borderRadius: 6, transition: "width .3s ease" },
  horizonWrap: { marginTop: 8 },
  horizonTrack: { position: "relative", height: 30, background: "#0a0f2c", borderRadius: 8, overflow: "hidden", border: "1px solid #1a2350" },
  horizonFill: { height: "100%", background: "linear-gradient(90deg, #7CFFB2, #2ea06e)", borderRadius: 8, transition: "width .3s ease", minWidth: 3 },
  horizonMark: { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#a8b4d8", fontFamily: "'Space Mono', monospace" },
  horizonPct: { fontSize: 16, color: "#5f5848", marginTop: 8, fontFamily: "'Space Mono', monospace" },
  holdRow: { display: "flex", alignItems: "center", gap: 14, marginBottom: 12, flexWrap: "wrap" },
  holdLabel: { fontSize: 14, color: "#4a4538", fontWeight: 600 },
  holdToggle: { display: "flex", border: "1px solid #d8cfba", borderRadius: 9, overflow: "hidden" },
  holdBtn: { fontFamily: "'Space Mono', monospace", fontSize: 13, padding: "7px 14px", background: "#f6f0e4", color: "#4a4538", border: "none", cursor: "pointer", transition: "all .15s ease" },
  holdBtnActive: { background: ACCENT, color: "#fff", fontWeight: 700 },
  placeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 },
  placeCard: { borderRadius: 12, padding: "14px 16px", border: "1px solid", transition: "all .2s ease", cursor: "pointer", textAlign: "left", fontFamily: "inherit", width: "100%" },
  placeTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  placeStatus: { fontFamily: "'Space Mono', monospace", fontSize: 14, letterSpacing: 1, color: "#fff", padding: "3px 8px", borderRadius: 5 },
  placeDist: { fontFamily: "'Space Mono', monospace", fontSize: 15, color: "#5f5848" },
  placeName: { fontSize: 17, fontWeight: 700, color: "#1a1813", marginBottom: 4 },
  placeNote: { fontSize: 16, color: "#5f5848", lineHeight: 1.4 },
  starGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginTop: 18 },
  starCard: { background: "#faf5ea", borderRadius: 12, padding: 18, border: "1px solid #e8e0d0" },
  starHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  starSwatch: { width: 16, height: 16, borderRadius: "50%", flexShrink: 0, boxShadow: "0 0 8px rgba(0,0,0,0.15)" },
  starType: { fontSize: 18, fontWeight: 700, color: "#1a1813", flex: 1 },
  starVerdict: { fontFamily: "'Space Mono', monospace", fontSize: 14, color: ACCENT, background: "rgba(22,107,70,0.1)", padding: "3px 8px", borderRadius: 6 },
  starBarWrap: { position: "relative", height: 22, background: "#efe7d6", borderRadius: 6, overflow: "hidden", marginBottom: 10 },
  starBar: { height: "100%", borderRadius: 6, transition: "width .4s ease", opacity: 0.85 },
  starFrac: { position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 15, fontFamily: "'Space Mono', monospace", color: "#2a261d", fontWeight: 700 },
  starLife: { fontSize: 16, fontFamily: "'Space Mono', monospace", color: ACCENT, marginBottom: 8 },
  starWhy: { fontSize: 16, lineHeight: 1.5, color: "#4a4538" },
  footer: { fontSize: 16, color: "#5f5848", textAlign: "center", marginTop: 10, lineHeight: 1.5, maxWidth: 640, marginLeft: "auto", marginRight: "auto", fontStyle: "italic" },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Spectral:wght@400;600;800&family=Space+Mono:wght@400;700&display=swap');
* { box-sizing: border-box; }
.slider { -webkit-appearance: none; width: 100%; height: 6px; border-radius: 6px; background: #e3dac6; outline: none; }
.slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: ${ACCENT}; cursor: pointer; border: 3px solid #fffdf8; box-shadow: 0 2px 8px rgba(22,107,70,0.4); transition: transform .15s ease; }
.slider::-webkit-slider-thumb:hover { transform: scale(1.18); }
.slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: ${ACCENT}; cursor: pointer; border: 3px solid #fffdf8; box-shadow: 0 2px 8px rgba(22,107,70,0.4); }
.preset-btn:hover { background: #ece3d2; transform: translateY(-1px); }
.scale-btn:hover { background: rgba(124,255,178,0.15); }
.hold-btn:hover { background: #ece3d2; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(120,100,60,0.14); }
.place-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(120,100,60,0.12); }
input[type="checkbox"] { accent-color: ${ACCENT}; width: 16px; height: 16px; cursor: pointer; }
.preset-btn:focus-visible, .slider:focus-visible, .scale-btn:focus-visible, .hold-btn:focus-visible, .stat-card:focus-visible, input[type="checkbox"]:focus-visible, .place-card:focus-visible { outline: 3px solid #0b3d28; outline-offset: 2px; border-radius: 8px; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
@media (max-width: 860px) { .gridcollapse { grid-template-columns: 1fr !important; } }
`;
