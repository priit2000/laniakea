import React, { useEffect, useMemo, useRef, useState } from "react";

const SUN_WATTS = 3.8e26;
const LANDAUER = 1.380649e-23 * Math.log(2);
const SECONDS_PER_YEAR = 31557600;

const POWER_CASES = {
  low: { stars: 1e14, luminosity: 0.03, label: "low" },
  middle: { stars: 3e14, luminosity: 0.05, label: "middle" },
  high: { stars: 1e15, luminosity: 0.1, label: "high" },
};

const THOUGHT_MODES = {
  local: {
    label: "local",
    radiusMly: 0.02,
    diameterLy: 20000,
    powerShare: 0.00003,
    verdict: "Fast local mind",
    description: "Star-system and neighborhood minds update quickly enough for normal culture, experiments, and local life.",
  },
  galactic: {
    label: "galactic",
    radiusMly: 0.09,
    diameterLy: 100000,
    powerShare: 0.16,
    verdict: "Galactic thought",
    description: "A whole galaxy can coordinate, but its update cycle is historical: plans unfold across tens of thousands of years.",
  },
  cluster: {
    label: "cluster",
    radiusMly: 100,
    diameterLy: 200000000,
    powerShare: 1,
    verdict: "Whole-cluster thought",
    description: "The full Laniakea Computation Cluster is asynchronous: one complete reflection takes hundreds of millions of years.",
  },
};

const COMPUTE_NODES = [
  { name: "Milky Way Core", dist: 0.03, angle: 0.1, tier: "home", power: 1.0 },
  { name: "Andromeda Archive", dist: 2.5, angle: 0.78, tier: "local", power: 0.7 },
  { name: "Triangulum Cache", dist: 2.7, angle: -0.45, tier: "local", power: 0.35 },
  { name: "Local Group Mesh", dist: 5, angle: 1.55, tier: "local", power: 0.55 },
  { name: "M81 Cold Stack", dist: 11.8, angle: 2.5, tier: "group", power: 0.45 },
  { name: "Centaurus A Engine", dist: 13, angle: -2.5, tier: "group", power: 0.5 },
  { name: "Leo Simulation Reef", dist: 35, angle: -1.35, tier: "group", power: 0.4 },
  { name: "Virgo Compute Mesh", dist: 59, angle: 0.25, tier: "cluster", power: 1.5 },
  { name: "Fornax Cold Shell", dist: 62, angle: 1.95, tier: "cluster", power: 0.9 },
  { name: "Eridanus Archive", dist: 75, angle: -0.9, tier: "cluster", power: 0.7 },
  { name: "Antlia Memory Reef", dist: 92, angle: -2.95, tier: "cluster", power: 0.8 },
  { name: "Laniakea Async Mind", dist: 100, angle: 2.95, tier: "edge", power: 2.0 },
];

function expText(exp, suffix = "") {
  return `10^${exp.toFixed(exp % 1 === 0 ? 0 : 1)}${suffix}`;
}

function compactYears(years) {
  if (years >= 1e6) return `${(years / 1e6).toFixed(0)} million yr`;
  if (years >= 1000) return `${(years / 1000).toFixed(0)} thousand yr`;
  return `${Math.round(years).toLocaleString()} yr`;
}

function Slider({ label, value, min, max, step, onChange, valueText }) {
  return (
    <label style={styles.controlBlock}>
      <span style={styles.controlLabel}>
        <span>{label}</span>
        <strong style={styles.controlValue}>{valueText}</strong>
      </span>
      <input
        className="slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        aria-valuetext={valueText}
      />
    </label>
  );
}

export default function LaniakeaComputeExplorer() {
  const [powerCase, setPowerCase] = useState("middle");
  const [temperature, setTemperature] = useState(30);
  const [efficiency, setEfficiency] = useState(12);
  const [mode, setMode] = useState("galactic");
  const [showMemory, setShowMemory] = useState(true);
  const [selectedNode, setSelectedNode] = useState("Virgo Compute Mesh");
  const canvasRef = useRef(null);

  const metrics = useMemo(() => {
    const power = POWER_CASES[powerCase];
    const thought = THOUGHT_MODES[mode];
    const totalPower = power.stars * power.luminosity * SUN_WATTS;
    const opsPerJoule = 1 / (LANDAUER * temperature);
    const efficiencyFactor = efficiency / 100;
    const opsPerSecond = totalPower * opsPerJoule * efficiencyFactor;
    const usableOpsPerSecond = opsPerSecond * thought.powerShare;
    const updateYears = thought.diameterLy;
    const opsPerThought = usableOpsPerSecond * updateYears * SECONDS_PER_YEAR;
    const kardashev = (Math.log10(totalPower) - 6) / 10;
    const memoryBits = Math.pow(10, 70 + efficiency / 20);
    return {
      totalPower,
      opsPerJoule,
      opsPerSecond,
      usableOpsPerSecond,
      opsPerThought,
      updateYears,
      kardashev,
      memoryBits,
      thought,
      selected: COMPUTE_NODES.find((node) => node.name === selectedNode) || COMPUTE_NODES[0],
    };
  }, [efficiency, mode, powerCase, selectedNode, temperature]);

  const live = useRef({ mode, showMemory, selectedNode, efficiency });
  live.current = { mode, showMemory, selectedNode, efficiency };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf;
    let cx = 0;
    let cy = 0;
    let maxR = 0;
    let particles = [];
    let resizeRetry;
    let resizeObserver;
    let clickTargets = [];

    function scale(dist) {
      return (Math.log10(dist + 1) / Math.log10(101)) * maxR;
    }

    function point(node) {
      const radius = scale(node.dist);
      return [
        cx + Math.cos(node.angle) * radius,
        cy + Math.sin(node.angle) * radius,
      ];
    }

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
      cx = cssW / 2;
      cy = cssH / 2;
      maxR = Math.min(cssW, cssH) * 0.44;

      particles = [];
      for (let i = 0; i < 620; i++) {
        const angle = (i * 2.399963) % (Math.PI * 2);
        const filament = Math.sin(angle * 3.1 + i * 0.11);
        const dist = Math.pow((i % 113) / 113, 0.64) * 100;
        particles.push({
          angle: angle + filament * 0.08,
          dist,
          size: 0.35 + (i % 13) / 12,
          phase: (i % 41) / 41,
          filament: Math.abs(filament) > 0.18,
        });
      }
    }

    function draw(now) {
      const { mode: liveMode, showMemory: memoryVisible, selectedNode: selected, efficiency: liveEfficiency } = live.current;
      const thought = THOUGHT_MODES[liveMode];
      const cssW = cx * 2;
      const cssH = cy * 2;
      const dt = now / 1000;
      clickTargets = [];

      ctx.clearRect(0, 0, cssW, cssH);
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 1.25);
      bg.addColorStop(0, "#08142d");
      bg.addColorStop(0.55, "#071022");
      bg.addColorStop(1, "#02040d");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, cssW, cssH);

      ctx.save();
      ctx.globalAlpha = 0.16;
      for (let i = 0; i < 7; i++) {
        const a = i * 0.9 + 0.2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * maxR * 0.55, cy + Math.sin(a) * maxR * 0.42, maxR * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = "#00000a";
        ctx.fill();
      }
      ctx.restore();

      particles.forEach((p) => {
        if (!p.filament && !memoryVisible) return;
        const radius = scale(p.dist);
        const x = cx + Math.cos(p.angle) * radius;
        const y = cy + Math.sin(p.angle) * radius;
        const reachable = p.dist <= thought.radiusMly;
        const pulse = 0.5 + Math.sin(dt * 2 + p.phase * Math.PI * 2) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = reachable
          ? `rgba(124,255,178,${0.35 + pulse * 0.35})`
          : memoryVisible
            ? "rgba(170,190,255,0.22)"
            : "rgba(170,190,255,0.08)";
        ctx.fill();
      });

      const thoughtR = Math.max(1, scale(thought.radiusMly));
      for (let i = 0; i < 3; i++) {
        const phase = ((dt * 0.16 + i / 3) % 1 + 1) % 1;
        const ring = thoughtR * phase;
        ctx.beginPath();
        ctx.arc(cx, cy, ring, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(124,255,178,${0.22 * (1 - ring / thoughtR)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, thoughtR, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(124,255,178,0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      COMPUTE_NODES.forEach((node, index) => {
        if (node.name === "Milky Way Core") return;
        const [x, y] = point(node);
        const lag = Math.min(1, node.dist / 100);
        const active = node.dist <= thought.radiusMly;
        const flow = ((dt * (0.25 + liveEfficiency / 120) + index * 0.13) % 1 + 1) % 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = active
          ? `rgba(124,255,178,${0.28 + (1 - lag) * 0.25})`
          : "rgba(130,160,220,0.14)";
        ctx.lineWidth = active ? 1.8 : 1;
        ctx.stroke();

        if (active) {
          const px = cx + (x - cx) * flow;
          const py = cy + (y - cy) * flow;
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,241,190,0.9)";
          ctx.fill();
        }
      });

      COMPUTE_NODES.forEach((node) => {
        const [x, y] = point(node);
        const active = node.dist <= thought.radiusMly;
        const isSelected = selected === node.name;
        const r = 4 + Math.sqrt(node.power) * 3 + (isSelected ? 3 : 0);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = active ? "#7CFFB2" : "#9eb6ff";
        ctx.shadowBlur = isSelected ? 18 : active ? 8 : 0;
        ctx.shadowColor = active ? "#7CFFB2" : "#9eb6ff";
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.strokeStyle = isSelected ? "#fff6c8" : "rgba(255,255,255,0.55)";
        ctx.stroke();

        if (isSelected || ["home", "cluster", "edge"].includes(node.tier)) {
          ctx.font = `${isSelected ? "16px" : "14px"} ui-monospace, monospace`;
          ctx.fillStyle = isSelected ? "#ffffff" : "rgba(255,255,255,0.72)";
          ctx.textAlign = x < cx ? "right" : "left";
          ctx.fillText(node.name, x + (x < cx ? -10 : 10), y + 4);
        }
        clickTargets.push({ node, x, y, r: r + 7 });
      });

      raf = requestAnimationFrame(draw);
    }

    function onClick(event) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const hit = clickTargets.find((target) => Math.hypot(target.x - x, target.y - y) <= target.r);
      if (hit) setSelectedNode(hit.node.name);
    }

    seed();
    canvas.addEventListener("click", onClick);
    window.addEventListener("resize", seed);
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(seed);
      resizeObserver.observe(canvas);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeRetry);
      resizeObserver?.disconnect();
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("resize", seed);
    };
  }, []);

  const opsExp = Math.log10(metrics.opsPerSecond);
  const usableExp = Math.log10(metrics.usableOpsPerSecond);
  const thoughtExp = Math.log10(metrics.opsPerThought);
  const memoryExp = Math.log10(metrics.memoryBits);

  return (
    <div style={styles.root}>
      <style>{computeCss}</style>
      <header style={styles.header}>
        <div style={styles.eyebrow}>Matrioshka brains - slow light - cold thought</div>
        <h1 style={styles.h1}>The Computation Cluster</h1>
        <p style={styles.lede}>
          Explore what the 100-million-light-year colonization region becomes when every useful star is wrapped in computation and every cluster is connected by slow light-speed beams.
        </p>
      </header>

      <div className="compute-grid" style={styles.grid}>
        <section style={styles.panel}>
          <h2 style={styles.h2}>Set the machine</h2>

          <div style={styles.segment}>
            {Object.keys(POWER_CASES).map((key) => (
              <button
                key={key}
                className="compute-btn"
                onClick={() => setPowerCase(key)}
                style={{ ...styles.smallBtn, ...(powerCase === key ? styles.smallBtnActive : {}) }}
                aria-pressed={powerCase === key}
              >
                {POWER_CASES[key].label}
              </button>
            ))}
          </div>

          <div style={styles.segment}>
            {Object.keys(THOUGHT_MODES).map((key) => (
              <button
                key={key}
                className="compute-btn"
                onClick={() => setMode(key)}
                style={{ ...styles.smallBtn, ...(mode === key ? styles.smallBtnActive : {}) }}
                aria-pressed={mode === key}
              >
                {THOUGHT_MODES[key].label}
              </button>
            ))}
          </div>

          <Slider
            label="Waste heat temperature"
            min={3}
            max={300}
            step={1}
            value={temperature}
            onChange={setTemperature}
            valueText={`${temperature} K`}
          />
          <Slider
            label="Thermodynamic efficiency"
            min={1}
            max={30}
            step={1}
            value={efficiency}
            onChange={setEfficiency}
            valueText={`${efficiency}% Landauer`}
          />

          <label style={styles.toggle}>
            <input
              type="checkbox"
              checked={showMemory}
              onChange={(event) => setShowMemory(event.target.checked)}
            />
            show dormant archive nodes
          </label>

          <div style={styles.verdict}>
            <div style={styles.bigLabel}>{metrics.thought.verdict}</div>
            <div style={styles.bigNum}>{compactYears(metrics.updateYears)}</div>
            <div style={styles.verdictText}>{metrics.thought.description}</div>
          </div>
        </section>

        <section style={styles.mapPanel}>
          <div style={styles.mapHead}>
            <div>
              <h2 style={styles.mapTitle}>Causal compute map</h2>
              <p style={styles.mapSub}>Click bright nodes. Green links are inside the current coherent thought scale.</p>
            </div>
            <div style={styles.kardashev}>K {metrics.kardashev.toFixed(2)}</div>
          </div>
          <canvas
            ref={canvasRef}
            style={styles.canvas}
            aria-label="Laniakea computation cluster visualization"
          />
          <div style={styles.mapFoot}>
            {mode === "cluster"
              ? "Whole-cluster thought is asynchronous: huge depth, almost no shared present moment."
              : mode === "galactic"
                ? "Galactic mode makes one galaxy-sized cognition visible while the wider cluster waits in slow links."
                : "Local mode shows why star systems are where fast life and experimentation remain possible."}
          </div>
        </section>
      </div>

      <section className="compute-stats" style={styles.stats}>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Total compute</div>
          <div style={styles.statValue}>{expText(opsExp, " ops/s")}</div>
          <p style={styles.statText}>Cluster-wide irreversible operations at the selected heat limit.</p>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Usable now</div>
          <div style={styles.statValue}>{expText(usableExp, " ops/s")}</div>
          <p style={styles.statText}>The fraction that can participate in this coherent update scale.</p>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>One thought</div>
          <div style={styles.statValue}>{expText(thoughtExp, " ops")}</div>
          <p style={styles.statText}>Work accumulated before the next causal synchronization.</p>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Long memory</div>
          <div style={styles.statValue}>{expText(memoryExp, " bits")}</div>
          <p style={styles.statText}>Ordinary robust computronium scale, not exotic black-hole storage.</p>
        </div>
      </section>

      <section style={styles.selectedPanel}>
        <div>
          <h2 style={styles.h2}>Selected node</h2>
          <p style={styles.selectedName}>{metrics.selected.name}</p>
        </div>
        <p style={styles.selectedCopy}>
          {metrics.selected.dist < 1
            ? "The home core runs fast control, local culture, and short-loop engineering."
            : metrics.selected.dist < 20
              ? "Nearby archives can still coordinate on civilizational timescales."
              : metrics.selected.dist < 80
                ? "Cluster nodes are powerful, but every decision arrives from deep history."
                : "Edge minds are part of the same civilization only through prediction, patience, and stable values."}
        </p>
      </section>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'Spectral', Georgia, serif",
    background: "linear-gradient(160deg, #fbf7ef 0%, #f3ece0 100%)",
    color: "#23211c",
    minHeight: "100vh",
    padding: "clamp(20px, 4vw, 56px)",
    maxWidth: 1180,
    margin: "0 auto",
  },
  header: { marginBottom: 34, maxWidth: 820 },
  eyebrow: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 15,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#166b46",
    marginBottom: 14,
  },
  h1: {
    fontSize: "clamp(42px, 7vw, 78px)",
    lineHeight: 0.95,
    margin: 0,
    fontWeight: 800,
    color: "#1a1813",
  },
  lede: { fontSize: 20, lineHeight: 1.55, color: "#4a4538", marginTop: 18 },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 360px) 1fr",
    gap: 22,
    marginBottom: 22,
    alignItems: "start",
  },
  panel: {
    background: "#fffdf8",
    borderRadius: 18,
    padding: 26,
    border: "1px solid #e8e0d0",
    boxShadow: "0 8px 30px rgba(120,100,60,0.07)",
  },
  h2: { fontSize: 24, fontWeight: 700, margin: "0 0 18px", color: "#1a1813" },
  segment: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  smallBtn: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 15,
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #d8cfba",
    background: "#f6f0e4",
    color: "#4a4538",
    cursor: "pointer",
    transition: "all .18s ease",
  },
  smallBtnActive: {
    background: "#166b46",
    color: "#fff",
    border: "1px solid #166b46",
    boxShadow: "0 4px 14px rgba(22,107,70,0.3)",
  },
  controlBlock: { display: "block", marginBottom: 20 },
  controlLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 10,
    fontSize: 16,
    fontWeight: 600,
    color: "#3a352b",
    marginBottom: 8,
  },
  controlValue: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 18,
    color: "#166b46",
  },
  toggle: {
    display: "flex",
    gap: 9,
    alignItems: "center",
    color: "#4a4538",
    fontSize: 16,
    margin: "4px 0 20px",
    cursor: "pointer",
  },
  verdict: {
    background: "linear-gradient(135deg, #0a0f2c, #1a2350)",
    borderRadius: 14,
    padding: "20px 22px",
    color: "#fff",
    textAlign: "center",
  },
  bigLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 14,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#7CFFB2",
    marginBottom: 6,
  },
  bigNum: { fontSize: 34, fontWeight: 800, lineHeight: 1 },
  verdictText: { fontSize: 15, color: "#d7ddf5", lineHeight: 1.45, marginTop: 12 },
  mapPanel: {
    background: "#070b22",
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid #172451",
    boxShadow: "0 12px 40px rgba(8,12,30,0.26)",
  },
  mapHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    padding: "18px 20px",
    color: "#fff",
    alignItems: "center",
  },
  mapTitle: { margin: 0, fontSize: 24 },
  mapSub: { margin: "6px 0 0", color: "#a8b4d8", fontSize: 15 },
  kardashev: {
    fontFamily: "'Space Mono', monospace",
    color: "#7CFFB2",
    border: "1px solid rgba(124,255,178,0.35)",
    borderRadius: 10,
    padding: "8px 10px",
    whiteSpace: "nowrap",
  },
  canvas: { display: "block", width: "100%", height: 440, background: "#03040f" },
  mapFoot: {
    color: "#a8b4d8",
    fontSize: 15,
    fontFamily: "'Space Mono', monospace",
    padding: "13px 20px 17px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
    marginBottom: 22,
  },
  stat: {
    background: "#fffdf8",
    border: "1px solid #e8e0d0",
    borderRadius: 14,
    padding: 18,
  },
  statLabel: {
    fontFamily: "'Space Mono', monospace",
    color: "#166b46",
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  statValue: { fontFamily: "'Space Mono', monospace", fontSize: 23, color: "#1a1813", fontWeight: 700 },
  statText: { margin: "8px 0 0", color: "#5f5848", lineHeight: 1.35, fontSize: 15 },
  selectedPanel: {
    background: "#fffdf8",
    border: "1px solid #e8e0d0",
    borderRadius: 18,
    padding: 24,
    display: "grid",
    gridTemplateColumns: "minmax(220px, 320px) 1fr",
    gap: 18,
    alignItems: "center",
  },
  selectedName: {
    margin: 0,
    fontFamily: "'Space Mono', monospace",
    color: "#166b46",
    fontSize: 19,
    fontWeight: 700,
  },
  selectedCopy: { margin: 0, color: "#4a4538", lineHeight: 1.5, fontSize: 18 },
};

const computeCss = `
.slider {
  width: 100%;
  accent-color: #166b46;
}

.compute-btn:hover {
  transform: translateY(-1px);
}

.compute-btn:focus-visible,
.slider:focus-visible {
  outline: 3px solid #0b3d28;
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .compute-grid,
  .compute-stats {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 640px) {
  .compute-stats,
  .compute-grid {
    gap: 12px !important;
  }
}
`;
