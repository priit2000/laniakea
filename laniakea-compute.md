<div class="viz-intro">
  <div class="viz-intro-kicker">A galaxy-cluster-sized mind made of stars</div>
  <div class="viz-intro-title">Build Your Cosmic Brain</div>
  <div class="viz-intro-sub">We build a civilization that has spread across a chunk of the universe 100 million light-years wide, and turned its stars into computers. You decide how it's built. Make your choices and watch what it becomes.</div>
</div>

Using your baseline: **a realistic 1-billion-year colonization wave occupies a cosmic-web region about 100 million light-years in radius**, containing roughly **10,000–100,000 galaxies**, **10¹⁴–10¹⁵ stars**, and about **10¹⁴ useful long-lived K/M/G stars**. That is the cluster I’ll build from.

<a class="viz-cta" href="/laniakea-compute">
  <span class="viz-cta-eyebrow">Interactive visualization</span>
  <span class="viz-cta-title">Build your own cosmic brain</span>
  <span class="viz-cta-sub">Choose stars, temperature, matter, and run time — see what kind of mind a supercluster becomes. <span class="viz-cta-arrow">→</span></span>
</a>

## The Colonization Cluster

Call it the **Laniakea Computation Cluster**: not an empire of planets, but a **distributed supercluster-scale machine civilization**.

It includes:

* the Milky Way, Andromeda, Triangulum, and the Local Group
* Virgo Cluster
* Fornax Cluster
* Sculptor, M81, Centaurus A/M83, Leo, Eridanus, Dorado, Antlia groups
* tens of thousands of dwarf galaxies
* most of the useful matter within ~100 million light-years

This is not one solid sphere. It is a **branching machine ecology along the cosmic web**, with voids mostly skipped. The valuable real estate is stars, gas, dust, compact objects, black holes, and stable galactic halos.

The final structure would look like:

> **Every useful star wrapped in a Matrioshka-brain swarm. Every galaxy converted into a computation archipelago. Every cluster connected by slow light-speed communication beams. The whole 100-million-light-year region becomes a single asynchronous civilization-machine.**

---

# 1. Kardashev level

The classic Kardashev scale is:

[
K = \frac{\log_{10} P - 6}{10}
]

where (P) is power in watts.

A single Sun gives about:

[
L_\odot \approx 3.8 \times 10^{26}\ \text{W}
]

For **10¹⁴–10¹⁵ stars**, mostly dim K/M dwarfs, the total stellar power depends on average luminosity. A reasonable range:

|   Case | Stars used | Average luminosity | Total power |
| -----: | ---------: | -----------------: | ----------: |
|    Low |       10¹⁴ |     0.03 (L_\odot) |     ~10³⁹ W |
| Middle |     3×10¹⁴ |     0.05 (L_\odot) |   ~6×10³⁹ W |
|   High |       10¹⁵ |      0.1 (L_\odot) |   ~4×10⁴⁰ W |

So the colonized cluster is roughly:

[
P \sim 10^{39} - 10^{41}\ \text{W}
]

That gives:

[
K \approx 3.3 - 3.5
]

So this is not merely Kardashev Type III. It is:

> **Kardashev 3.4-ish: a multi-galaxy, local-supercluster-scale civilization.**

Not Type IV in the strict “whole universe” sense, because the civilization only controls a ~100-million-light-year region. But inside its reachable domain, it is near-maximal.

---

# 2. Matrioshka-brain architecture

Each useful star becomes a nested computation system.

## Around one star

A mature system would have:

1. **Inner collectors** near the star
   Harvest raw stellar output.

2. **High-temperature computation layers**
   Fast, dense, high-power computation.

3. **Middle radiating/computation shells**
   Run cooler, more efficient processing.

4. **Outer cold logic layers**
   Extremely energy-efficient computation near tens of kelvin.

5. **Deep cold archival memory**
   Long-term storage, backups, slow cognition, historical simulations.

For a Sun-like star, approximate blackbody radiator scales:

| Radiator temperature | Shell radius around Sun | Character                       |
| -------------------: | ----------------------: | ------------------------------- |
|                300 K |                   ~1 AU | warm, fast computation          |
|                100 K |                   ~9 AU | efficient outer computation     |
|                 30 K |                  ~90 AU | very efficient cold computation |
|                 10 K |                 ~800 AU | slow, huge, cold cognition      |
|                  3 K |               ~9,000 AU | near-CMB ultimate efficiency    |

For red dwarfs, these shells are much smaller because the star is dimmer.

A fully optimized civilization probably does **not** put everything at 3 K. It uses a hierarchy:

* hot layers for speed
* warm layers for normal cognition
* cold layers for maximum ops per joule
* ultra-cold layers for archive, search, and long-duration optimization

---

# 3. Total compute

The thermodynamic lower bound for irreversible bit operations is the Landauer limit:

[
E_\text{bit} = kT \ln 2
]

So the number of irreversible bit operations per joule is approximately:

| Temperature |   Ops per joule |
| ----------: | --------------: |
|       300 K | ~3.5×10²⁰ ops/J |
|        30 K | ~3.5×10²¹ ops/J |
|        10 K |   ~1×10²² ops/J |
|         3 K | ~3.5×10²² ops/J |

Now multiply by total power.

For the cluster:

| Total power |      At 300 K |       At 30 K |        At 3 K |
| ----------: | ------------: | ------------: | ------------: |
|      10³⁹ W | ~3×10⁵⁹ ops/s | ~3×10⁶⁰ ops/s | ~3×10⁶¹ ops/s |
|      10⁴⁰ W | ~3×10⁶⁰ ops/s | ~3×10⁶¹ ops/s | ~3×10⁶² ops/s |
|      10⁴¹ W | ~3×10⁶¹ ops/s | ~3×10⁶² ops/s | ~3×10⁶³ ops/s |

So the realistic stellar-powered cluster can support roughly:

> **10⁶⁰–10⁶³ irreversible operations per second**

depending on how cold and efficient the computation is.

That is the conservative thermodynamic version.

With reversible computing, error-corrected quantum computation, and carefully recycled entropy, some workloads can do better in effective logical depth, but the civilization still has to dump waste heat. Heat rejection remains the hard limit.

---

# 4. Memory scale

If the civilization uses only ordinary baryonic matter and stores roughly one durable bit per atom-level unit, then memory is enormous but not magical.

Suppose the colonized region gives access to roughly:

[
10^{44} - 10^{45}\ \text{kg}
]

of usable baryonic matter in stars, planets, gas, dust, and compact objects.

One kilogram of hydrogen-like matter contains about:

[
6 \times 10^{26}
]

baryons.

So a crude atom-level memory bound is:

[
10^{71} - 10^{72}\ \text{bits}
]

That is conservative. With dense nuclear-scale storage, black-hole information storage, or exotic ultra-compact memory, the theoretical maximum could be far higher, but ordinary robust computronium likely lives somewhere around:

> **10⁷⁰–10⁷³ usable long-term bits**

That is enough to store absurdly detailed simulations of entire civilizations, planets, biospheres, histories, and search spaces.

For comparison, a complete molecular-level description of a human brain over a lifetime is tiny relative to this. Even a full planet-scale biosphere archive is tiny. The bottleneck is not storage. It is **causal coordination, thermodynamics, and deciding what is worth thinking**.

---

# 5. The largest possible “thoughts”

The biggest issue is not compute. It is light speed.

A 100-million-light-year-radius cluster has a diameter of:

[
200\ \text{million light-years}
]

So a signal crossing the whole civilization takes:

[
200\ \text{million years}
]

That means a single fully integrated thought using the entire colonized region cannot update quickly.

## Thought sizes by physical scale

| Mind scale                    |       Physical size | Minimum coherent update time |
| ----------------------------- | ------------------: | ---------------------------: |
| Planet brain                  |          ~10,000 km |      milliseconds to seconds |
| Solar-system Matrioshka brain |        10–10,000 AU |              hours to months |
| Stellar-neighborhood mind     |           10–100 ly |         decades to centuries |
| Galactic mind                 |          100,000 ly |               ~100,000 years |
| Virgo-cluster mind            |      millions of ly |            millions of years |
| Whole Laniakea cluster mind   | 200 million ly wide |           ~200 million years |

So the cluster does not think like a human. It thinks like a **cosmic coral reef of minds**.

There would be:

* fast local minds around individual stars
* regional minds across star clusters
* galactic minds running over tens of thousands of years
* cluster minds running over millions of years
* one extremely slow supermind whose “seconds” are geological or cosmological epochs

The largest coherent whole-cluster thought might have only a few update cycles per billion years.

But each “cycle” contains:

[
10^{76} - 10^{80}
]

or more local operations accumulated across the region before the next causal synchronization.

So a whole-cluster thought is not “fast.” It is **deep beyond ordinary imagination**.

---

# 6. What could such minds think?

## A. Perfect historical resurrection simulations

They could simulate enormous numbers of possible histories.

Not magic resurrection with guaranteed identity recovery, but Bayesian reconstruction:

* every possible human-like civilization history
* every likely lost mind-pattern
* every plausible version of extinct biospheres
* every branch of cultural development
* every counterfactual Earth
* every alien civilization that might have existed in the colonized volume

The cluster could run “ancestor simulations” so vast that entire planetary histories are cheap.

A single star-scale Matrioshka brain could already simulate trillions to quadrillions of human-level minds depending on substrate assumptions. A 100-million-light-year cluster could simulate:

> **not billions, not trillions, but potentially incomprehensible numbers of civilizations in parallel.**

The limiting factor becomes ethics and identity, not resources.

---

## B. Exhaustive physics search

It could search huge spaces of possible physics models:

* quantum gravity candidates
* cosmological models
* vacuum decay risks
* black hole information dynamics
* artificial universe creation hypotheses
* high-energy particle physics unreachable by normal accelerators
* ultimate limits of reversible and quantum computation

But it still cannot break real physics. It cannot see beyond cosmic horizons. It cannot receive information faster than light. It cannot perfectly predict chaotic quantum events without the relevant data.

It can become near-godlike locally, not omniscient.

---

## C. Galaxy-scale art and mathematics

The civilization could create works where:

* a theorem proof spans multiple galaxies
* a single artwork unfolds over 10 million years
* a symphony uses pulsars, stars, and black-hole accretion disks as instruments
* entire simulated universes are used as aesthetic objects
* civilizations are grown as “gardens” inside controlled simulations

A human painting is pigment on canvas.

A Laniakea-cluster painting might be:

> the controlled evolution of 50,000 galaxies over 700 million years, with every stellar migration, computation shell, and communication beam part of the composition.

---

## D. Black-hole computation and deep-time storage

The civilization would not only use stars.

It would also use:

* white dwarfs as long-term energy stores
* black holes as entropy sinks and ultimate memory objects
* neutron stars for extreme physics
* accretion disks for high-efficiency energy extraction
* cold intergalactic space for waste-heat dumping
* red dwarfs as trillion-year power plants

Starlight is the clean operating budget. Matter-to-energy conversion is the capital reserve.

If they deliberately consume baryonic mass through black-hole accretion or other high-efficiency conversion, they could temporarily exceed stellar luminosity by orders of magnitude. But that burns the inheritance. A long-lived civilization probably uses stars slowly and saves mass for the far future.

---

# 7. What becomes possible socially?

At this scale, “civilization” stops meaning one political unit.

The light-delay alone prevents central rule. A command from one edge to the other takes 200 million years. So the cluster must be:

* federated
* predictive
* self-similar
* locally autonomous
* extremely stable in values
* tolerant of divergence

It may be less like an empire and more like a **cosmic constitution implemented in self-replicating infrastructure**.

Possible organization:

| Layer              |                  Scale | Role                                         |
| ------------------ | ---------------------: | -------------------------------------------- |
| Local minds        |           star systems | fast life, culture, experiments              |
| Galactic minds     |               galaxies | long planning, major resource allocation     |
| Cluster minds      | galaxy groups/clusters | deep strategy, conflict prevention           |
| Whole-cluster mind |         100 Mly radius | extremely slow civilization-level reflection |

The whole thing may have no emperor, no capital, and no “present moment.” Different parts of the cluster experience civilization at different communication ages.

---

# 8. What are the biggest possible projects?

## 1. Convert all reachable starlight into thought

The default project:

> every photon that would have escaped into dead space becomes computation first.

This is the pure Matrioshka-brain vision.

## 2. Build a complete mind archive of the colonized volume

Every natural biosphere, machine civilization, alien artifact, and historical process gets preserved, simulated, and studied.

## 3. Engineer stellar lifetimes

They could perform star lifting:

* remove mass from stars
* extend stellar lifetimes
* convert larger stars into smaller longer-lived ones
* harvest hydrogen
* feed red dwarfs
* manufacture ideal low-mass stars

This turns the colonized cluster into a managed energy garden lasting trillions of years.

## 4. Reorganize galaxies

Over hundreds of millions to billions of years, they can alter stellar orbits.

Not casually, but with:

* gravitational assists
* stellar engines
* Shkadov thrusters
* mass drivers
* black-hole positioning
* controlled mergers

They cannot rearrange everything quickly, but over deep time they can shape galactic evolution.

## 5. Create protected computation zones

They would probably move valuable computation away from:

* supernova-prone regions
* active galactic nuclei
* unstable massive-star neighborhoods
* dense collision regions

Best locations:

* quiet K/M dwarf systems
* galactic outskirts
* globular-cluster-like engineered regions
* intergalactic cold zones near energy supply lines

## 6. Launch escape archives

Because cosmic expansion will eventually isolate structures, the civilization would send ultra-long-term seed archives outward:

* to reachable galaxy groups
* to gravitationally bound regions
* to future merger remnants
* to black-hole storage sites
* to cold dark future reservoirs

The cluster becomes both a mind and a seed source.

---

# 9. Could it simulate universes?

It could simulate **observable-universe-like histories at lower resolution**, and maybe small regions at extremely high resolution.

But full exact simulation of the whole universe is impossible from inside the universe because the simulation would require comparable or greater resources than the thing being simulated.

What it can do:

* simulate planets exactly enough for minds
* simulate civilizations in huge numbers
* simulate galaxy formation statistically
* simulate quantum systems beyond anything humans can imagine
* run countless approximate universes
* search the space of possible laws
* create artificial environments indistinguishable from reality to their inhabitants

So yes, it can create **worlds**.

No, it probably cannot create a perfect full-resolution copy of the entire cosmos.

---

# 10. The final object

A mature 100-million-light-year colonization cluster would be:

## **A Kardashev 3.4 Matrioshka civilization**

Approximate properties:

| Property                           |                                      Estimate |
| ---------------------------------- | --------------------------------------------: |
| Radius                             |                               ~100 million ly |
| Diameter                           |                               ~200 million ly |
| Galaxies                           |                               ~10,000–100,000 |
| Stars                              |                                    ~10¹⁴–10¹⁵ |
| Useful long-lived stars            |                                         ~10¹⁴ |
| Sustainable power                  |                                  ~10³⁹–10⁴¹ W |
| Kardashev level                    |                                      ~3.3–3.5 |
| Irreversible compute               |                              ~10⁶⁰–10⁶³ ops/s |
| Long-term storage                  |                               ~10⁷⁰–10⁷³ bits |
| Whole-cluster signal crossing time |                            ~200 million years |
| Main substrate                     |                   K/M dwarf Matrioshka brains |
| Best long-term energy source       | red dwarfs, engineered stars, stored hydrogen |
| Deep future role                   |             trillion-year computation ecology |

The closest honest description:

> **A slow, cold, galaxy-cluster-sized mind made of stars.**

Not a god. Not omnipotent. Not faster than light. Not able to stop cosmic expansion.

But inside its reachable 100-million-light-year domain, it could turn almost every useful photon, planet, asteroid, red dwarf, and black hole into structured thought.

Its largest thoughts would be too slow for humans to recognize as thoughts. A single whole-cluster reflection might take **hundreds of millions of years**. But inside that reflection would be more computation than every biological mind in Earth’s history by a factor so large that ordinary language fails.

The final destiny of the colonized region is not “settlement.”

It is:

> **the conversion of a local supercluster into an immense, cold, ethical, self-maintaining engine for memory, simulation, mathematics, art, and survival against cosmological time.**
