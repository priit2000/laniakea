import React, { useState, useMemo } from "react";

// ============================================================
//  BUILD YOUR COSMIC BRAIN
//  Turn a colonized supercluster into a galaxy-sized computer.
//  High-school-friendly: a few simple choices, instant relatable results.
// ============================================================

const LSUN = 3.8e26;          // Sun's power output, watts
const K_B = 1.380649e-23;     // Boltzmann constant
const LN2 = Math.LN2;
const BRAIN_OPS = 1e16;       // ~ops/sec of one human brain (common estimate)
const HUMANS_EVER = 1.17e11;  // ~117 billion humans who have ever lived
const BITS_PER_KG = 6e26;     // baryons per kg (atom-level storage bound)

// Slider stops the user actually moves. Each maps to friendly labels.
const STAR_STOPS = [
  { stars: 1e14, label: "100 trillion", desc: "the cautious low end" },
  { stars: 3e14, label: "300 trillion", desc: "a solid middle estimate" },
  { stars: 1e15, label: "1 quadrillion", desc: "nearly every useful star" },
];

const TEMP_STOPS = [
  { T: 300, label: "Warm (300 K)", desc: "room temperature - fast but wasteful", color: "#d9622b" },
  { T: 30, label: "Cold (30 K)", desc: "deep-freeze - far more efficient", color: "#2f7fc0" },
  { T: 3, label: "Near absolute zero (3 K)", desc: "as cold as deep space - the ultimate", color: "#5b6fd6" },
];

const MATTER_STOPS = [
  { kg: 1e44, label: "Stars & planets only" },
  { kg: 1e45, label: "Plus gas, dust & dead stars" },
];

// How the civilization spends its resources. Each moves a DIFFERENT ceiling.
const SEC_PER_YR = 3.15e7;
const SEC_PER_200MY = 200e6 * SEC_PER_YR;  // one whole-cluster thought = light-crossing time
const C2 = 9e16;                            // c^2, for mass-energy conversion (J per kg)
const SPEND_STOPS = [
  { key: "starlight", label: "Live on starlight",
    sub: "Sustainable. Runs on the steady income of starlight without ever touching the savings." },
  { key: "burn", label: "Burn the mass reserve",
    sub: "Convert matter to energy for far more power - but you're spending savings that won't come back." },
];

function kardashev(P) { return (Math.log10(P) - 6) / 10; }
function opsPerJoule(T) { return 1 / (K_B * T * LN2); }

// Turn a huge number into "10^NN" plus a friendly scale word.
function sci(n) {
  if (n === 0 || !isFinite(n)) return "0";
  const exp = Math.floor(Math.log10(n));
  const mant = n / Math.pow(10, exp);
  return `${mant.toFixed(1)} x 10^${exp}`;
}
function powerWord(exp) {
  const names = { 39: "a thousand trillion trillion", 40: "ten thousand trillion trillion" };
  return names[exp] || "";
}
function fmtYears(y) {
  if (y >= 1e15) return (y / 1e15).toFixed(y < 1e16 ? 1 : 0).replace(/\.0$/, "") + " quadrillion years";
  if (y >= 1e12) return (y / 1e12).toFixed(y < 1e13 ? 1 : 0).replace(/\.0$/, "") + " trillion years";
  if (y >= 1e9) return (y / 1e9).toFixed(y < 1e10 ? 1 : 0).replace(/\.0$/, "") + " billion years";
  if (y >= 1e6) return (y / 1e6).toFixed(y < 1e7 ? 1 : 0).replace(/\.0$/, "") + " million years";
  return Math.round(y).toLocaleString() + " years";
}
function fmtCount(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(1).replace(/\.0$/, "") + " trillion";
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + " billion";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + " million";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + " thousand";
  return Math.round(n).toLocaleString();
}

// Segmented pill picker for discrete choices (replaces fake sliders).
function PillGroup({ options, value, onChange, ariaLabel }) {
  return (
    <div style={pillStyles.group} role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt, i) => {
        const active = i === value;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(i)}
            className={"pill" + (active ? " pill-active" : "")}
            style={{ ...pillStyles.pill, ...(active ? pillStyles.pillActive : {}) }}
          >
            {active && <span style={pillStyles.check} aria-hidden="true">✓</span>}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

const pillStyles = {
  group: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 },
  pill: {
    flex: "1 1 0", minWidth: 130, fontFamily: "'IBM Plex Mono', monospace", fontSize: 15,
    fontWeight: 600, padding: "13px 16px", borderRadius: 13, border: "2px solid #e4d3e8",
    background: "#fbf6fc", color: "#4a4356", cursor: "pointer", transition: "all .16s ease",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7, lineHeight: 1.25, textAlign: "center",
  },
  pillActive: {
    background: "#7a3fb0", color: "#fff", borderColor: "#7a3fb0",
    boxShadow: "0 6px 18px rgba(122,63,176,0.32)", transform: "translateY(-1px)",
  },
  check: { fontWeight: 800, fontSize: 14 },
};

export default function CosmicBrainBuilder() {
  const [starIdx, setStarIdx] = useState(1);   // index into STAR_STOPS
  const [tempIdx, setTempIdx] = useState(1);   // index into TEMP_STOPS
  const [matterIdx, setMatterIdx] = useState(0);
  const [spendIdx, setSpendIdx] = useState(0); // index into SPEND_STOPS
  const [eonsLog, setEonsLog] = useState(9);   // log10 of years to run (deep-time mode): 1e9 yr default
  const [showThought, setShowThought] = useState(false);

  const star = STAR_STOPS[starIdx];
  const temp = TEMP_STOPS[tempIdx];
  const matter = MATTER_STOPS[matterIdx];
  const spend = SPEND_STOPS[spendIdx];

  // Run time is now an INDEPENDENT control (always-on slider), in years.
  const runYears = Math.pow(10, eonsLog);

  const calc = useMemo(() => {
    const avgLum = starIdx === 0 ? 0.03 : starIdx === 1 ? 0.05 : 0.1;
    const stellarPower = star.stars * avgLum * LSUN;       // sustainable starlight, watts

    let power = stellarPower;
    let fuelLimited = false;
    if (spend.key === "burn") {
      // Spread the convertible mass-energy over the chosen run time:
      // burn fast = brighter spike, burn slow = gentler. ~1% of baryons at ~10% efficiency.
      const energy = matter.kg * 0.01 * 0.10 * C2;          // joules available
      const seconds = runYears * SEC_PER_YR;
      const burnPower = energy / seconds;
      // You'd never run dimmer than your own starlight, so burn only helps when it beats it.
      power = Math.max(stellarPower, burnPower);
      fuelLimited = burnPower > stellarPower;               // is the burn actually doing anything?
    }

    // SUSTAINED level = starlight only; this never changes with time, so the hero is stable.
    const sustainedK = kardashev(stellarPower);
    const K = kardashev(power);                             // current/burst power
    const ops = power * opsPerJoule(temp.T);                // irreversible ops/sec
    const sustainedOps = stellarPower * opsPerJoule(temp.T);
    const bits = matter.kg * BITS_PER_KG;
    const brains = ops / BRAIN_OPS;
    return { power, stellarPower, K, sustainedK, ops, sustainedOps, bits, brains, avgLum, fuelLimited };
  }, [starIdx, tempIdx, matterIdx, spendIdx, star.stars, matter.kg, temp.T, spend.key, runYears]);

  // Relatable framings
  const opsExp = Math.floor(Math.log10(calc.ops));
  const brainsExp = Math.floor(Math.log10(calc.brains));
  const bitsExp = Math.floor(Math.log10(calc.bits));

  // Hero shows the SUSTAINED level (doesn't drop when you choose to burn slowly).
  const heroK = calc.sustainedK;
  const kFill = Math.max(0, Math.min(1, (heroK - 3.0) / 0.6));
  // Is the burn currently giving a real boost above sustained?
  const burstActive = spend.key === "burn" && calc.fuelLimited;

  // One whole-cluster "thought" = the 200-My light-crossing time.
  const opsPerThought = calc.ops * SEC_PER_200MY;
  const thoughtExp = Math.floor(Math.log10(opsPerThought));

  // Over the chosen run, synchronized whole-cluster thoughts pile up; lifetime ops are enormous.
  const lifetimeOps = calc.ops * runYears * SEC_PER_YR;
  const lifetimeOpsExp = Math.floor(Math.log10(lifetimeOps));
  const wholeThoughts = runYears / 200e6;                  // # of fully-synced cluster thoughts
  const thoughtsExp = Math.floor(Math.log10(Math.max(1, wholeThoughts)));

  // Concrete payoff: Earth-like civilizations fully simulated per thought cycle.
  const OPS_PER_CIV_SIM = 1e35;
  const civsSimulated = opsPerThought / OPS_PER_CIV_SIM;
  const civsExp = Math.floor(Math.log10(civsSimulated));

  // HERO NUMBER (option 2): Earth-civilizations fully simulated in a single heartbeat (~1 second).
  // ops in one second / ops to fully simulate one Earth-civilization.
  const SEC_PER_HEARTBEAT = 1;
  const earthsPerHeartbeat = (calc.ops * SEC_PER_HEARTBEAT) / OPS_PER_CIV_SIM;
  // GRAND TOTAL across the whole run (this is what the time slider drives).
  const earthsTotal = lifetimeOps / OPS_PER_CIV_SIM;

  // ---- HERO: a named tier that levels up, driven by TOTAL lifetime computation ----
  // Lifetime ops span ~10^58 to ~10^86 across the controls, so this moves dramatically
  // with every slider (stars, cold, matter, burn, and run time all feed in).
  const TIERS = [
    { min: 0,    name: "Stellar Mind",      blurb: "A mind on the scale of stars - already beyond anything biological." },
    { min: 1e66, name: "Galactic Mind",     blurb: "A mind spanning whole galaxies, thinking thoughts no single world could hold." },
    { min: 1e72, name: "Supercluster Mind", blurb: "A mind filling a supercluster - near the ceiling of what starlight allows." },
    { min: 1e78, name: "Deep-Time Mind",    blurb: "A mind that thinks across billions of years, stacking idea upon idea." },
    { min: 1e83, name: "Eternal Mind",      blurb: "A mind that reaches the practical limit of computation in this universe." },
  ];
  const tier = TIERS.reduce((acc, t) => (lifetimeOps >= t.min ? t : acc), TIERS[0]);
  const tierIndex = TIERS.indexOf(tier);
  const tierFill = (tierIndex + 1) / TIERS.length;

  // Brain-equivalents with a real comparison that scales visibly.
  // "times everyone who ever lived" = brains / 1.17e11, shown as a power of ten.
  const everyoneFactorExp = Math.floor(Math.log10(calc.brains / HUMANS_EVER));

  // Rounded power of ten: returns { exp } using Math.round so e.g. 8e61 -> 10^62.
  function parts(n) {
    if (!isFinite(n) || n <= 0) return { exp: 0 };
    return { exp: Math.round(Math.log10(n)) };
  }
  const opsP = parts(calc.ops);
  const brainsP = parts(calc.brains);
  const bitsP = parts(calc.bits);
  const earthsP = parts(earthsPerHeartbeat);
  const earthsTotalP = parts(earthsTotal);

  // Which capabilities are unlocked by the current slider settings?
  const unlocked = CAPABILITIES.filter((c) =>
    starIdx >= c.minStars &&
    matterIdx >= c.needsMatter &&
    (!c.needsCold || tempIdx >= 1) &&            // "cold" unlocks at 30 K or 3 K
    wholeThoughts >= (c.minThoughts || 0)        // deep-time: needs enough accumulated thoughts
  );
  const locked = CAPABILITIES.filter((c) => !unlocked.includes(c));

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      <header style={S.header}>
        <div style={S.kicker}>A galaxy-cluster-sized mind made of stars</div>
        <h1 style={S.h1}>Build Your Cosmic Brain</h1>
        <p style={S.sub}>
          We build a civilization that has spread across a chunk of the universe 100 million
          light-years wide, and turned its stars into computers. You decide how it's built.
          Make your choices below and watch what it becomes.
        </p>
      </header>

      {/* ---- THE THREE CHOICES ---- */}
      <section style={S.controls}>

        {/* STARS */}
        <div style={S.choice}>
          <div style={S.choiceTop}>
            <span style={S.choiceNum}>1</span>
            <div>
              <div style={S.choiceTitle}>How many stars does it use?</div>
              <div style={S.choiceSub}>Each star becomes a computer wrapped around it.</div>
            </div>
          </div>
          <PillGroup
            options={STAR_STOPS.map((s) => s.label)}
            value={starIdx} onChange={setStarIdx}
            ariaLabel="Number of stars used" />
          <div style={S.readout}><strong>{star.label} stars</strong> - {star.desc}</div>
        </div>

        {/* TEMPERATURE */}
        <div style={S.choice}>
          <div style={S.choiceTop}>
            <span style={S.choiceNum}>2</span>
            <div>
              <div style={S.choiceTitle}>How cold does it run the computers?</div>
              <div style={S.choiceSub}>Colder computers waste less energy, so they think more per watt.</div>
            </div>
          </div>
          <PillGroup
            options={TEMP_STOPS.map((t) => `${t.T} K`)}
            value={tempIdx} onChange={setTempIdx}
            ariaLabel="Operating temperature" />
          <div style={S.readout}><strong style={{ color: temp.color }}>{temp.label}</strong> - {temp.desc}</div>
        </div>

        {/* MATTER */}
        <div style={S.choice}>
          <div style={S.choiceTop}>
            <span style={S.choiceNum}>3</span>
            <div>
              <div style={S.choiceTitle}>How much material for memory?</div>
              <div style={S.choiceSub}>Atoms store the civilization's memories - more matter, more storage.</div>
            </div>
          </div>
          <PillGroup
            options={MATTER_STOPS.map((m) => m.label)}
            value={matterIdx} onChange={setMatterIdx}
            ariaLabel="Amount of matter used for memory" />
          <div style={S.readout}><strong>{matter.label}</strong></div>
        </div>

        {/* ENERGY SOURCE */}
        <div style={S.choice}>
          <div style={S.choiceTop}>
            <span style={S.choiceNum}>4</span>
            <div>
              <div style={S.choiceTitle}>Where does its energy come from?</div>
              <div style={S.choiceSub}>Starlight is income it can live on forever. Matter is savings it can burn for far more power - but only once.</div>
            </div>
          </div>
          <PillGroup
            options={SPEND_STOPS.map((s) => s.label)}
            value={spendIdx} onChange={setSpendIdx}
            ariaLabel="Energy source" />
          <div style={S.readout}><strong>{spend.label}</strong> - {spend.sub}</div>
        </div>

        {/* RUN TIME - always independent */}
        <div style={S.choice}>
          <div style={S.choiceTop}>
            <span style={S.choiceNum}>5</span>
            <div>
              <div style={S.choiceTitle}>How long does it run?</div>
              <div style={S.choiceSub}>
                {spend.key === "starlight"
                  ? "Starlight can sustain it for ages. The longer it runs, the more deep thoughts pile up."
                  : "Burn the savings fast for a blinding spike, or slow for a gentler, longer glow - you choose."}
              </div>
            </div>
          </div>
          <div style={S.eonLabel}>
            <span>Let it run for</span>
            <span style={S.eonVal}>{fmtYears(runYears)}</span>
          </div>
          <input type="range" min="6" max="15" step="0.5" value={eonsLog}
            onChange={(e) => setEonsLog(+e.target.value)} className="slider"
            aria-label="How long the civilization runs, in years"
            aria-valuetext={fmtYears(runYears)} />
          <div style={S.readout}>
            That's about <strong>{fmtCount(Math.max(1, wholeThoughts))} complete whole-cluster thoughts</strong>.
            {spend.key === "burn" && (calc.fuelLimited
              ? " Burning this fast pushes power well above starlight."
              : " Spread this thin, the burn adds nothing over plain starlight - run shorter to see the spike.")}
          </div>
        </div>
      </section>

      {/* ---- HERO: NAMED TIER ---- */}
      <section style={S.hero}>
        <div style={S.heroLabel}>You have built a</div>
        <div style={S.heroBig}>{tier.name}</div>
        <div style={S.heroDesc}>{tier.blurb}</div>

        {/* tier ladder */}
        <div style={S.tierScale}>
          <div style={S.tierTrack}>
            <div style={{ ...S.tierFill, width: `${tierFill * 100}%` }} />
          </div>
          <div style={S.tierTicks}>
            {TIERS.map((t, i) => (
              <span key={t.name} style={{ ...S.tierTick, ...(i === tierIndex ? S.tierTickActive : {}) }}>
                {t.name.replace(" Mind", "")}
              </span>
            ))}
          </div>
        </div>

        {/* the big, dramatic number: Earths fully simulated per heartbeat */}
        <div style={S.heroNumberWrap}>
          <div style={S.heroNumberLabel}>In a single heartbeat, it could fully simulate</div>
          <div style={S.heroNumber}>10<sup>{earthsP.exp}</sup></div>
          <div style={S.heroNumberUnit}>entire Earth-like civilizations</div>
          <div style={S.heroCompare}>
            Every person, every history, every living thing on each one &mdash; modelled in full,
            in the time between two beats of your heart. Colder computers or more stars make this leap.
          </div>

          <div style={S.heroTotalRow}>
            <div style={S.heroTotalLabel}>Over its whole {fmtYears(runYears)} run, that adds up to</div>
            <div style={S.heroTotal}>10<sup>{earthsTotalP.exp}</sup></div>
            <div style={S.heroTotalUnit}>Earth-civilizations simulated in total</div>
            <div style={S.heroTotalHint}>Slide "how long does it run" to watch this total grow.</div>
          </div>
        </div>

        {burstActive && (
          <div style={S.burstCallout}>
            <span style={S.burstUp}>+ temporary boost</span>
            Burning matter this fast lifts power to <strong>Kardashev {calc.K.toFixed(2)}</strong> for {fmtYears(runYears)} -
            then the savings are gone. Run longer and it fades to the steady level.
          </div>
        )}

        {/* small honest stats row */}
        <div style={S.heroStats}>
          <div style={S.heroStat}>
            <span style={S.heroStatVal}>Kardashev {heroK.toFixed(2)}</span>
            <span style={S.heroStatLbl}>raw power tier (barely moves - power is a log scale)</span>
          </div>
          <div style={S.heroStat}>
            <span style={S.heroStatVal}>{sci(calc.stellarPower)} W</span>
            <span style={S.heroStatLbl}>steady power from starlight</span>
          </div>
        </div>
      </section>

      {/* ---- THREE RESULT CARDS ---- */}
      <div style={S.resultGrid}>
        <div style={S.resultCard}>
          <div style={S.resultIcon}>brain</div>
          <div style={S.resultLabel}>Thinking speed</div>
          <div style={S.resultValue}>10<sup>{opsP.exp}</sup></div>
          <div style={S.resultUnit}>operations every second</div>
          <div style={S.resultPlain}>
            That equals about <strong>10<sup>{brainsP.exp}</sup> human brains</strong> all
            thinking at once - far more minds than the {HUMANS_EVER.toExponential(0).replace("e+", " x 10^")} people
            who have ever lived.
          </div>
        </div>

        <div style={S.resultCard}>
          <div style={S.resultIcon}>disk</div>
          <div style={S.resultLabel}>Memory</div>
          <div style={S.resultValue}>10<sup>{bitsP.exp}</sup></div>
          <div style={S.resultUnit}>bits of storage</div>
          <div style={S.resultPlain}>
            Enough to keep a <strong>detailed recording of entire planets, their histories,
            and every living thing on them</strong> - with room to spare almost beyond counting.
          </div>
        </div>

        <div style={S.resultCard}>
          <div style={S.resultIcon}>clock</div>
          <div style={S.resultLabel}>Its biggest thought</div>
          <div style={S.resultValue}>200<span style={S.resultValueSmall}> million</span></div>
          <div style={S.resultUnit}>years per single idea</div>
          <div style={S.resultPlain}>
            A thought using the <strong>whole</strong> civilization travels at light speed across
            200 million light-years - so one complete idea takes longer than dinosaurs ruled Earth.
          </div>
        </div>
      </div>

      {/* ---- DEEP TIME / SPENDING PANEL ---- */}
      <section style={S.deepPanel}>
        <div style={S.deepHead}>
          <span style={S.deepTag}>{spend.key === "burn" ? "Burning the reserve" : "Living on starlight"} for {fmtYears(runYears)}</span>
          <span style={S.deepSubtag}>
            {spend.key === "burn"
              ? (calc.fuelLimited ? "brighter than starlight - but spending savings" : "burn too slow to matter here")
              : "steady, sustainable, deep"}
          </span>
        </div>

        {spend.key === "burn" && calc.fuelLimited && (
          <div style={S.deepRow}>
            <div style={S.deepStat}>
              <div style={S.deepStatVal}>{sci(calc.power)} W</div>
              <div style={S.deepStatLabel}>average power while burning (vs {sci(calc.stellarPower)} W from starlight)</div>
            </div>
            <div style={S.deepStat}>
              <div style={S.deepStatVal}>Kardashev {calc.K.toFixed(2)}</div>
              <div style={S.deepStatLabel}>boosted by burning matter</div>
            </div>
          </div>
        )}

        <div style={S.deepRow}>
          <div style={S.deepStat}>
            <div style={S.deepStatVal}>{fmtCount(Math.max(1, wholeThoughts))}</div>
            <div style={S.deepStatLabel}>complete whole-cluster thoughts in that time</div>
          </div>
          <div style={S.deepStat}>
            <div style={S.deepStatVal}>10<sup>{lifetimeOpsExp}</sup></div>
            <div style={S.deepStatLabel}>total operations across the whole run</div>
          </div>
          <div style={S.deepStat}>
            <div style={S.deepStatVal}>~{fmtYears(runYears)}</div>
            <div style={S.deepStatLabel}>how long it runs</div>
          </div>
        </div>

        <p style={S.deepNote}>
          Thinking never speeds up - each whole-cluster thought still takes 200 million years, set by
          light crossing the region. What deep time grows is the <strong>number</strong> of synchronized
          thoughts and the <strong>total</strong> lifetime computation.
          {spend.key === "burn"
            ? " Burning matter can raise the power and Kardashev level above starlight, but only until the convertible mass is gone - it buys a brighter glow, not a longer one."
            : " Starlight never touches the savings, so it can keep this up for the whole trillion-year lifetime of its red-dwarf stars."}
        </p>
      </section>

      <section style={S.thinkSection}>
        <button style={S.thinkToggle} onClick={() => setShowThought(!showThought)} aria-expanded={showThought}>
          {showThought ? "Hide" : "So what could a mind this big actually do?"}
        </button>
        {showThought && (
          <div style={S.thinkBody}>
            <p style={S.thinkIntro}>
              Each "thought cycle" of the whole cluster gathers about <strong>10<sup>{thoughtExp}</sup> operations</strong> before
              it can sync up again. With your current settings that's enough to fully simulate roughly{" "}
              <strong>10<sup>{civsExp}</sup> Earth-sized civilizations</strong> in a single thought - and it could:
            </p>

            <div style={S.thinkGrid}>
              {unlocked.map((t) => (
                <div key={t.title} style={{ ...S.thinkCard, ...(t.deep ? S.thinkCardDeep : {}), ...(t.ultimate ? S.thinkCardUltimate : {}) }}>
                  {t.ultimate
                    ? <div style={S.ultimateBadge}>THE MEANING OF IT ALL</div>
                    : t.deep && <div style={S.deepBadge}>DEEP TIME</div>}
                  <div style={{ ...S.thinkTitle, ...(t.ultimate ? S.thinkTitleUltimate : {}) }}>{t.title}</div>
                  <div style={{ ...S.thinkText, ...(t.ultimate ? S.thinkTextUltimate : {}) }}>{t.text}</div>
                </div>
              ))}
            </div>

            {locked.length > 0 && (
              <>
                <p style={S.lockedHead}>Not yet unlocked - turn the sliders up to reach these:</p>
                <div style={S.thinkGrid}>
                  {locked.map((t) => {
                    let hint = "";
                    if (starIdx < t.minStars) hint = `Needs ${STAR_STOPS[t.minStars].label} stars`;
                    else if (matterIdx < t.needsMatter) hint = "Needs more matter for memory";
                    else if (t.needsCold && tempIdx < 1) hint = "Needs colder, more efficient computing";
                    else if (wholeThoughts < (t.minThoughts || 0)) hint = `Needs deep time: run for ~${fmtYears(t.minThoughts * 200e6)}`;
                    return (
                      <div key={t.title} style={{ ...S.lockedCard, ...(t.deep ? S.lockedDeep : {}) }}>
                        <div style={S.lockedTitle}>{t.title}</div>
                        <div style={S.lockedHint}>{hint}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <p style={S.thinkOutro}>
              But it can't break physics. It can't see past the edge of the visible universe,
              can't send messages faster than light, and can't stop the universe from expanding
              and slowly carrying the stars apart. It would be <strong>near-godlike in its own
              corner of space - but not all-powerful.</strong>
            </p>
          </div>
        )}
      </section>

      <footer style={S.footer}>
        A friendly model of a "Matrioshka brain" supercluster. The physics (Kardashev scale,
        the Landauer limit on computing, light-speed delays) is real and the numbers are in the
        right ballpark - but treat them as big-picture intuition, not exact predictions.
      </footer>
    </div>
  );
}

// Capabilities, each with an unlock requirement tied to the sliders:
//  minStars: index into STAR_STOPS (more power unlocks bigger projects)
//  needsCold: true if it benefits from / requires very efficient cold computing
//  needsMatter: index into MATTER_STOPS (memory-heavy projects need more atoms)
//  minThoughts: how many accumulated whole-cluster thoughts it needs (deep time!)
const CAPABILITIES = [
  // --- available almost immediately ---
  { title: "Simulate whole worlds", minStars: 0, needsCold: false, needsMatter: 0, minThoughts: 0,
    text: "Run incredibly detailed simulations of planets, ecosystems, and civilizations." },
  { title: "Search all of physics", minStars: 0, needsCold: false, needsMatter: 0, minThoughts: 0,
    text: "Test enormous numbers of possible theories about gravity, quantum mechanics, and reality's deepest rules." },
  { title: "Think the deepest thoughts", minStars: 0, needsCold: true, needsMatter: 0, minThoughts: 0,
    text: "Run ultra-efficient cold computation that squeezes the maximum number of ideas out of every joule of starlight." },
  { title: "Build vast memory archives", minStars: 0, needsCold: false, needsMatter: 1, minThoughts: 0,
    text: "Store staggeringly detailed records of every planet, history, and living thing in the region." },
  // --- need more power ---
  { title: "Resurrect lost histories", minStars: 1, needsCold: false, needsMatter: 1, minThoughts: 0,
    text: "Reconstruct plausible versions of vanished cultures, extinct species, and forgotten minds." },
  { title: "Make galaxy-scale art", minStars: 1, needsCold: false, needsMatter: 0, minThoughts: 0,
    text: "Compose a single artwork that unfolds over millions of years, using stars and black holes as instruments." },
  { title: "Engineer the stars", minStars: 2, needsCold: false, needsMatter: 0, minThoughts: 0,
    text: "Reshape stars so they burn longer, turning the whole region into an energy garden." },

  // --- DEEP TIME ONLY: these need many accumulated whole-cluster thoughts ---
  { title: "Reorganize whole galaxies", minStars: 1, needsCold: false, needsMatter: 0, minThoughts: 10,
    text: "Over tens of synchronized cluster-thoughts, nudge the orbits of billions of stars to redesign galaxies on purpose.", deep: true },
  { title: "Run universe-history simulations", minStars: 1, needsCold: false, needsMatter: 1, minThoughts: 100,
    text: "Simulate entire universe-like histories at lower resolution, and small regions in flawless detail - searching the space of how cosmoses unfold.", deep: true },
  { title: "Launch escape archives", minStars: 1, needsCold: false, needsMatter: 1, minThoughts: 50,
    text: "Before cosmic expansion isolates everything, fire ultra-long-term seed-archives outward to every still-reachable region - become a mind AND a seed source.", deep: true },
  { title: "Speak across the void", minStars: 1, needsCold: false, needsMatter: 1, minThoughts: 75,
    text: "Compose messages so rich and error-proof they survive the slow crawl to neighboring superclusters before expansion cuts the line.", deep: true },
  { title: "Translate any mind", minStars: 1, needsCold: false, needsMatter: 0, minThoughts: 30,
    text: "Build a universal framework for understanding any form of intelligence it ever encounters or invents, however alien.", deep: true },
  { title: "Cultivate civilizations as gardens", minStars: 2, needsCold: true, needsMatter: 1, minThoughts: 500,
    text: "Grow countless simulated civilizations as living artworks and ethical experiments, tended over billions of years.", deep: true },
  { title: "Compose a thought spanning eons", minStars: 1, needsCold: true, needsMatter: 0, minThoughts: 1000,
    text: "Chain thousands of whole-cluster thoughts into a single reflection so deep that its 'one idea' outlasts the lifetimes of most stars.", deep: true },
  { title: "Referee its own ethics", minStars: 1, needsCold: true, needsMatter: 1, minThoughts: 2000,
    text: "Run vast deliberations on what it ought to value, stress-testing moral systems across billions of simulated lives before committing to any.", deep: true },
  { title: "Outlast the stars themselves", minStars: 0, needsCold: true, needsMatter: 1, minThoughts: 5000,
    text: "Shift onto black holes, white dwarfs and stored hydrogen to keep thinking into the cold far future, long after normal starlight fades.", deep: true },

  // --- the truly enormous end: tens of thousands of thoughts and up ---
  { title: "Map every possible mind", minStars: 1, needsCold: true, needsMatter: 1, minThoughts: 20000,
    text: "Methodically explore the space of all possible kinds of minds and experiences - a catalogue of what it is even possible to be.", deep: true },
  { title: "Solve problems that take eons", minStars: 1, needsCold: true, needsMatter: 0, minThoughts: 50000,
    text: "Attack questions so hard that no shorter-lived mind could ever finish them - proofs and searches spanning trillions of years of steady work.", deep: true },
  { title: "Steer black holes as engines", minStars: 2, needsCold: false, needsMatter: 1, minThoughts: 100000,
    text: "Use the colossal energy of feeding black holes as deliberate computing reactors, squeezing far more thought out of the same matter.", deep: true },
  { title: "Build a backup of itself elsewhere", minStars: 2, needsCold: true, needsMatter: 1, minThoughts: 250000,
    text: "Send a complete, self-rebuilding copy of the whole civilization to another supercluster as insurance against any local catastrophe.", deep: true },
  { title: "Choose its own descendants", minStars: 1, needsCold: true, needsMatter: 1, minThoughts: 500000,
    text: "Across deep time, carefully redesign what it wants to become - guiding its own values and form over millions of generations of thought.", deep: true },
  { title: "Compress itself for eternity", minStars: 1, needsCold: true, needsMatter: 1, minThoughts: 750000,
    text: "Re-encode its whole self into the most efficient possible form, trading speed for endurance to ride the universe down to its last usable joule.", deep: true },
  { title: "Wait out the dark era", minStars: 0, needsCold: true, needsMatter: 1, minThoughts: 1000000,
    text: "Slow its thinking to a crawl to match the dimming universe, stretching its remaining energy across the vast cold future for as long as physics allows.", deep: true },
  { title: "Take on entropy itself", minStars: 2, needsCold: true, needsMatter: 1, minThoughts: 2000000,
    text: "Mount the ultimate project: search for any way - reversible computing, exotic physics, sheer patience - to cheat the heat death that limits every mind. The one problem it can never be sure it will win. And perhaps that is the point: a mind that can do almost anything still needs one impossible task to give it purpose. To go on thinking, creating, and caring in the face of an ending it cannot prevent - that struggle, freely chosen, may be the closest thing to a meaning of life that any mind, of any size, ever finds.", deep: true, ultimate: true },
];

// ============================================================
//  STYLES - warm, bright, high-contrast, large legible type
// ============================================================
const ACCENT = "#7a3fb0";       // cosmic violet, AA on cream
const ACCENT2 = "#166b46";      // deep green
const INK = "#1d1a24";

const S = {
  root: { fontFamily: "'Fraunces', Georgia, serif", background: "radial-gradient(120% 100% at 50% 0%, #fdf6ff 0%, #f4eef5 55%, #efe7ea 100%)", color: INK, minHeight: "100vh", padding: "clamp(22px,4vw,56px)", maxWidth: 1120, margin: "0 auto" },
  header: { marginBottom: 34, maxWidth: 760 },
  kicker: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: ACCENT, marginBottom: 14, fontWeight: 600 },
  h1: { fontSize: "clamp(44px,8vw,80px)", lineHeight: 0.96, margin: 0, fontWeight: 900, letterSpacing: "-0.02em", color: "#14101c" },
  sub: { fontSize: 19, lineHeight: 1.6, color: "#433c4d", marginTop: 18 },

  controls: { display: "grid", gridTemplateColumns: "1fr", gap: 18, marginBottom: 26 },
  choice: { background: "#fffdfb", borderRadius: 18, padding: "24px 26px", border: "1px solid #ead9ec", boxShadow: "0 8px 28px rgba(120,63,176,0.08)" },
  choiceTop: { display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18 },
  choiceNum: { flexShrink: 0, width: 36, height: 36, borderRadius: "50%", background: ACCENT, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 18 },
  choiceTitle: { fontSize: 21, fontWeight: 700, color: "#14101c", lineHeight: 1.2 },
  choiceSub: { fontSize: 15, color: "#5a5266", marginTop: 4, lineHeight: 1.4 },
  stopRow: { display: "flex", justifyContent: "space-between", marginTop: 12, gap: 8 },
  stop: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#6f6780", textAlign: "center", flex: 1 },
  stopActive: { color: ACCENT, fontWeight: 700 },
  readout: { marginTop: 14, fontSize: 16, color: "#332e3d", background: "#faf4fb", borderRadius: 10, padding: "10px 14px", lineHeight: 1.4 },
  eonBlock: { marginTop: 16, padding: "16px 18px", background: "#fff7ed", borderRadius: 12, border: "1px solid #f0d9bf" },
  eonLabel: { display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 15, fontWeight: 600, color: "#5a4632", marginBottom: 6 },
  eonVal: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, color: "#9c5d0f", fontWeight: 700 },
  eonHint: { fontSize: 14, color: "#6b5340", marginTop: 8, fontStyle: "italic", lineHeight: 1.4 },

  hero: { background: "linear-gradient(150deg, #1a1030 0%, #2d1b54 60%, #3a1f5e 100%)", borderRadius: 22, padding: "clamp(26px,4vw,42px)", color: "#fff", marginBottom: 26, textAlign: "center", boxShadow: "0 16px 50px rgba(40,20,80,0.35)" },
  heroLabel: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: "#d3b8ff", marginBottom: 8 },
  heroBig: { fontSize: "clamp(44px,8vw,76px)", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1, color: "#fff" },
  heroDesc: { fontSize: 18, color: "#e3d6ff", marginTop: 12, maxWidth: 560, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 },
  tierScale: { marginTop: 26, maxWidth: 620, marginLeft: "auto", marginRight: "auto" },
  tierTrack: { position: "relative", height: 12, background: "rgba(255,255,255,0.12)", borderRadius: 10, overflow: "hidden" },
  tierFill: { height: "100%", background: "linear-gradient(90deg, #ffb86b, #ff7eb6, #c98bff)", borderRadius: 10, transition: "width .4s ease" },
  tierTicks: { display: "flex", justifyContent: "space-between", marginTop: 10, gap: 4 },
  tierTick: { flex: 1, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#9a86c4", textAlign: "center", lineHeight: 1.25 },
  tierTickActive: { color: "#ffd9a8", fontWeight: 700 },
  heroNumberWrap: { marginTop: 32, padding: "22px 18px", background: "rgba(255,255,255,0.06)", borderRadius: 18, maxWidth: 620, marginLeft: "auto", marginRight: "auto" },
  heroNumberLabel: { fontSize: 16, color: "#cdb8f0", marginBottom: 6 },
  heroNumber: { fontSize: "clamp(40px,7vw,64px)", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.01em" },
  heroNumberUnit: { fontSize: 18, color: "#e3d6ff", marginTop: 8, fontWeight: 600 },
  heroCompare: { fontSize: 15, color: "#c4b2e6", marginTop: 14, lineHeight: 1.5, maxWidth: 480, marginLeft: "auto", marginRight: "auto" },
  heroTotalRow: { marginTop: 22, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,0.14)" },
  heroTotalLabel: { fontSize: 15, color: "#cdb8f0", marginBottom: 6 },
  heroTotal: { fontSize: "clamp(32px,5.5vw,50px)", fontWeight: 900, color: "#ffd9a8", lineHeight: 1, letterSpacing: "-0.01em" },
  heroTotalUnit: { fontSize: 16, color: "#e3d6ff", marginTop: 7, fontWeight: 600 },
  heroTotalHint: { fontSize: 13, color: "#a692ca", marginTop: 10, fontStyle: "italic" },
  heroStats: { display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 26 },
  heroStat: { display: "flex", flexDirection: "column", gap: 3, minWidth: 200 },
  heroStatVal: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 17, fontWeight: 700, color: "#ffd9a8" },
  heroStatLbl: { fontSize: 13, color: "#a692ca", lineHeight: 1.35 },
  burstCallout: { marginTop: 24, maxWidth: 580, marginLeft: "auto", marginRight: "auto", background: "rgba(255,180,107,0.15)", border: "1px solid rgba(255,180,107,0.4)", borderRadius: 14, padding: "16px 20px", fontSize: 16, lineHeight: 1.5, color: "#ffe8cf" },
  burstUp: { display: "inline-block", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "#1a1030", background: "#ffb86b", padding: "3px 10px", borderRadius: 7, marginRight: 10 },

  resultGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 18, marginBottom: 26 },
  resultCard: { background: "#fffdfb", borderRadius: 18, padding: 26, border: "1px solid #ead9ec", boxShadow: "0 8px 28px rgba(120,63,176,0.08)" },
  deepPanel: { background: "linear-gradient(150deg, #fff7ed 0%, #fdeede 100%)", borderRadius: 20, padding: "clamp(24px,3.5vw,36px)", border: "1px solid #f0d9bf", marginBottom: 26, boxShadow: "0 10px 34px rgba(180,110,40,0.12)" },
  deepHead: { display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 22 },
  deepTag: { fontSize: 24, fontWeight: 900, color: "#8a4a12", letterSpacing: "-0.01em" },
  deepSubtag: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: "#9c5d0f", fontWeight: 600 },
  deepRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 18, marginBottom: 20 },
  deepStat: { background: "#fffdfb", borderRadius: 14, padding: "18px 20px", border: "1px solid #f0e0cf", textAlign: "center" },
  deepStatVal: { fontSize: 30, fontWeight: 900, color: "#7a3d0c", lineHeight: 1, letterSpacing: "-0.01em" },
  deepStatLabel: { fontSize: 14, color: "#6b5340", marginTop: 8, lineHeight: 1.4 },
  deepNote: { fontSize: 16, lineHeight: 1.6, color: "#4a3a28", margin: 0, background: "#fffaf2", borderRadius: 12, padding: "16px 20px", borderLeft: "4px solid #c77d2e" },
  resultIcon: { display: "none" },
  resultLabel: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase", color: ACCENT, fontWeight: 600 },
  resultValue: { fontSize: 52, fontWeight: 900, color: "#14101c", lineHeight: 1, marginTop: 10, letterSpacing: "-0.02em" },
  resultValueSmall: { fontSize: 26, fontWeight: 700 },
  resultUnit: { fontSize: 16, color: "#5a5266", marginTop: 6, fontWeight: 600 },
  resultPlain: { fontSize: 16, color: "#433c4d", marginTop: 16, lineHeight: 1.55 },

  thinkSection: { marginBottom: 26 },
  thinkToggle: { width: "100%", background: ACCENT2, color: "#fff", border: "none", borderRadius: 16, padding: "20px 24px", fontSize: 20, fontWeight: 700, cursor: "pointer", fontFamily: "'Fraunces', Georgia, serif", transition: "all .18s ease", boxShadow: "0 8px 24px rgba(22,107,70,0.22)" },
  thinkBody: { marginTop: 18, background: "#fffdfb", borderRadius: 18, padding: "clamp(22px,3vw,32px)", border: "1px solid #ead9ec", boxShadow: "0 8px 28px rgba(120,63,176,0.08)" },
  thinkIntro: { fontSize: 17, lineHeight: 1.6, color: "#332e3d", margin: "0 0 20px" },
  thinkGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 16 },
  thinkCard: { background: "#faf4fb", borderRadius: 12, padding: 18, borderLeft: `4px solid ${ACCENT}` },
  thinkCardDeep: { background: "linear-gradient(135deg, #fff4e6, #ffeacf)", borderLeft: "4px solid #c77d2e", position: "relative" },
  thinkCardUltimate: { background: "linear-gradient(135deg, #0e2a33, #15414a 60%, #1c5560)", borderLeft: "4px solid #38d6c4", gridColumn: "1 / -1", padding: 24 },
  thinkTitleUltimate: { color: "#aef5ec", fontSize: 22 },
  thinkTextUltimate: { color: "#d4f3ee", fontSize: 16 },
  ultimateBadge: { display: "inline-block", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: "#0e2a33", background: "#38d6c4", padding: "4px 11px", borderRadius: 7, marginBottom: 10 },
  deepBadge: { display: "inline-block", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#fff", background: "#a85a16", padding: "3px 8px", borderRadius: 6, marginBottom: 8 },
  lockedDeep: { borderLeft: "4px solid #d8a55f" },
  lockedHead: { fontSize: 16, fontWeight: 700, color: "#665e75", margin: "24px 0 14px" },
  lockedCard: { background: "#f2eef3", borderRadius: 12, padding: 18, borderLeft: "4px solid #c3b8cc", opacity: 0.85 },
  lockedTitle: { fontSize: 17, fontWeight: 700, color: "#6a6276", marginBottom: 6 },
  lockedHint: { fontSize: 14, color: "#7a3fb0", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 },
  thinkTitle: { fontSize: 17, fontWeight: 700, color: "#14101c", marginBottom: 6 },
  thinkText: { fontSize: 15, color: "#4a4356", lineHeight: 1.5 },
  thinkOutro: { fontSize: 17, lineHeight: 1.6, color: "#332e3d", margin: "22px 0 0", padding: "18px 20px", background: "#f3ecf5", borderRadius: 12 },

  footer: { fontSize: 15, color: "#6a6276", textAlign: "center", marginTop: 12, lineHeight: 1.55, maxWidth: 680, marginLeft: "auto", marginRight: "auto", fontStyle: "italic" },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,900&family=IBM+Plex+Mono:wght@400;600;700&display=swap');
* { box-sizing: border-box; }
.slider { -webkit-appearance: none; width: 100%; height: 8px; border-radius: 8px; background: linear-gradient(90deg, #e9dcf0, #d9c4ea); outline: none; margin: 6px 0; }
.slider::-webkit-slider-thumb { -webkit-appearance: none; width: 26px; height: 26px; border-radius: 50%; background: ${ACCENT}; cursor: pointer; border: 4px solid #fffdfb; box-shadow: 0 3px 10px rgba(122,63,176,0.45); transition: transform .15s ease; }
.slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
.slider::-moz-range-thumb { width: 26px; height: 26px; border-radius: 50%; background: ${ACCENT}; cursor: pointer; border: 4px solid #fffdfb; box-shadow: 0 3px 10px rgba(122,63,176,0.45); }
.slider-cold { background: linear-gradient(90deg, #f4c9a8, #a8cdf0, #b6c0f0); }
.slider-cold::-webkit-slider-thumb { background: #2f7fc0; box-shadow: 0 3px 10px rgba(47,127,192,0.45); }
.slider-cold::-moz-range-thumb { background: #2f7fc0; }
.thinkToggle:hover, button:hover.thinkToggle { filter: brightness(1.07); transform: translateY(-1px); }
.pill:hover:not(.pill-active) { border-color: #c89fd6; background: #f6ecf9; transform: translateY(-1px); }
.pill-active:hover { filter: brightness(1.06); }
button:focus-visible, .slider:focus-visible { outline: 3px solid ${ACCENT}; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;
