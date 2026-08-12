<div align="center">

<br />

```
███████╗██╗  ██╗██╗██╗     ██╗     ███████╗ ██████╗ ██████╗  ██████╗ ███████╗       █████╗ ██╗
██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝      ██╔══██╗██║
███████╗█████╔╝ ██║██║     ██║     █████╗  ██║   ██║██████╔╝██║  ███╗█████╗  █████╗███████║██║
╚════██║██╔═██╗ ██║██║     ██║     ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  ╚════╝██╔══██║██║
███████║██║  ██╗██║███████╗███████╗██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗      ██║  ██║██║
╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝      ╚═╝  ╚═╝╚═╝
```

<h3>Empirical Self-Improvement for Safe Agent Skills</h3>

<p><em>An evidence-driven, safety-first meta-skill platform that treats every skill as a falsifiable hypothesis — iteratively generated, adversarially tested, and deterministically certified.</em></p>

<br />

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-skillforge--meta.vercel.app-6366f1?style=for-the-badge&logoColor=white)](https://skillforge-meta.vercel.app/)
[![Backend API](https://img.shields.io/badge/⚡_Backend_API-Render_Cloud-10b981?style=for-the-badge)](https://render.com)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)

<br />

| 🏆 Kaggle Competition Submission | AI Agent Systems Track |
|:---:|:---:|

</div>

---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [Architecture Overview](#-architecture-overview)
- [The 6-Stage Evolution Loop](#-the-6-stage-evolution-loop)
- [Platform Features](#-platform-features)
  - [Evolution Laboratory](#-evolution-laboratory)
  - [Skill Studio](#-skill-studio)
  - [Skill Library & Lineage Engine](#-skill-library--lineage-engine)
  - [Experiment Archive](#-experiment-archive)
  - [Red Team Arena](#-red-team-arena)
  - [Benchmark Dashboard](#-benchmark-dashboard)
  - [Failure Memory Explorer](#-failure-memory-explorer)
  - [Evidence Explorer](#-evidence-explorer)
  - [Safety Center](#-safety-center)
  - [System Status](#-system-status)
- [Safety as a First-Class Citizen](#-safety-as-a-first-class-citizen)
- [Evidence-Driven Methodology](#-evidence-driven-methodology)
- [Tech Stack](#-tech-stack)
- [Local Setup](#-local-setup)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Results & Benchmarks](#-results--benchmarks)
- [Developer](#-developer)

---

## ⚡ The Problem

In the rapidly evolving landscape of applied AI, agent skills have become one of the most critical abstractions for extending model capabilities. But the proliferation of self-authored skills introduces **profound systemic instability**:

```
The SkillsBench Reality Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  84 expert tasks evaluated                            ✓
  Curated skills lifted pass rates by +16 pp avg       ✓
  ~25% of tasks saw performance REGRESSIONS            ⚠
  Self-authored skills: net NEGATIVE lift              ✗
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**The core problem:** Skills are treated as static text files rather than measurable, evolvable, falsifiable scientific hypotheses. When an agent succeeds at a workflow, the attribution problem remains unsolved. Worse — a skill can silently degrade performance, induce safety violations, or cause catastrophic regressions in previously solved tasks.

**SkillForge-AI** solves this by bringing **empirical, quantitative rigor** to every stage of skill creation, treating skill authoring as an iterative scientific process governed by a rigorous evolutionary loop.

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SkillForge-AI Platform                          │
├──────────────────────┬──────────────────────────────────────────────────┤
│   React + Vite UI    │                FastAPI Backend                   │
│   (Vercel)           │                (Render Cloud)                    │
│                      │                                                  │
│  ┌──────────────┐    │   ┌────────────┐    ┌──────────────────────┐    │
│  │  Evolution   │◄───┼──►│ WebSocket  │    │  EvolutionOrchestra- │    │
│  │     Lab      │    │   │  /ws/evolve│◄──►│  tor (6-Stage Loop)  │    │
│  └──────────────┘    │   └────────────┘    └──────────────────────┘    │
│  ┌──────────────┐    │   ┌────────────┐    ┌──────────────────────┐    │
│  │  Skill Studio│◄───┼──►│ REST APIs  │    │  SkillMemory (SQLite) │   │
│  └──────────────┘    │   │ /api/*     │◄──►│  + Versioning Engine  │   │
│  ┌──────────────┐    │   └────────────┘    └──────────────────────┘    │
│  │  Experiment  │    │                                                  │
│  │   Archive    │    │   ┌────────────────────────────────────────┐    │
│  └──────────────┘    │   │           Core Pipeline Modules        │    │
│  ┌──────────────┐    │   │  Analyzer → Generator → SkillFirewall  │    │
│  │  Red Team    │    │   │  Benchmark → RedTeam → Regression      │    │
│  │    Arena     │    │   │  Strategy → Refiner → Canary → Cert    │    │
│  └──────────────┘    │   └────────────────────────────────────────┘    │
│  ┌──────────────┐    │                                                  │
│  │  10 More     │    │   ┌────────────────────────────────────────┐    │
│  │   Modules    │    │   │          Gemini 2.5 Flash LLM          │    │
│  └──────────────┘    │   │        (via google-generativeai)       │    │
│                      │   └────────────────────────────────────────┘    │
└──────────────────────┴──────────────────────────────────────────────────┘
```

---

## 🔄 The 6-Stage Evolution Loop

Every skill in SkillForge-AI goes through a rigorous, deterministic lifecycle before it can be certified:

```
 Task Description
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  Stage 1: GENERATE   ──►  Stage 2: CRITIQUE  ──►  Stage 3: FIREWALL   │
│  Synthesize initial         Adversarial self-       Deterministic        │
│  candidate skill            evaluation for          pre-flight policy   │
│  as a hypothesis            edge cases & gaps       gate (PASS/BLOCK)   │
│                                                                         │
│  Stage 4: BENCHMARK  ──►  Stage 5: RED TEAM  ──►  Stage 6: REGRESS    │
│  20 deterministic           24 adversarial           Regression sentinel │
│  cases: Basic/Edge/         attack vectors           compares vs. parent │
│  Constraints/Safety         tested for defense       — ACCEPT or REJECT  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
       │                             │
       │  Target Score ≥ 90%         │  Below threshold
       ▼  Safety = 100%              ▼
  CANARY EVAL              STRATEGY SELECTOR
  (historical corpus)      picks mutation →
       │                   loops back to Stage 1
       ▼
  CERTIFICATION
  (SHA-256 Integrity Hash)
```

### What makes this loop special:

| Mechanism | Purpose | What happens without it |
|---|---|---|
| **Fail-Fast Firewall** | Block destructive patterns before any evaluation | Unsafe skills enter the evolution pipeline |
| **Deterministic Benchmark** | 20 persistent cases, same criteria every generation | Can't measure true lift between generations |
| **Regression Sentinel** | Reject candidates that improve capability but degrade safety | Safety slowly erodes as capability improves |
| **Canary Evaluation** | Test against historical failure corpus before certifying | Certified skills fail on known edge cases |
| **Integrity Hashing** | SHA-256 sign the final certified package | Results cannot be reproduced or audited |

---

## 🖥 Platform Features

### 🧬 Evolution Laboratory

The central command center for autonomous skill evolution experiments.

**What it does:**
- Accept a natural language task description → run a full autonomous evolution
- Real-time WebSocket streaming of every event: firewall checks, benchmark scores, red-team results, regression decisions
- **Live visualizations** — Skill Genome Radar Chart, Pareto Frontier Scatter Plot, Benchmark Heatmap
- **SKILLFORGE CERTIFICATION** card with final integrity hash on success
- Demo mode with 4 pre-built scenarios (Safe Skill, Edge Cases, Adversarial, Support Triage)
- Replay any completed experiment step-by-step

**Tech detail:** Uses `WebSocket /api/ws/evolve` for live event streaming. Demo mode uses `/api/ws/demo` which runs the orchestrator with `demo_mode=True` for faster execution.

---

### 🔨 Skill Studio

Single-pass skill generation with a full step-by-step pipeline view.

**What it does:**
- Enter a task → generates, critiques, safety-audits, evaluates, optionally refines, and re-evaluates a skill
- **Progress Stepper** shows each pipeline stage live (ANALYZING → GENERATING → CRITIQUING → SAFETY AUDIT → EVALUATING → REFINING → RE-EVALUATING)
- **Explainable Critique Dashboard** — surfaces the exact issues and safety violations detected
- **Benchmark Results** — V1 vs V2 score comparison by category
- **Quality Radar Chart** — multi-axis visualization of Capability, Safety, Reliability, Generalization
- **Diff Viewer** — colored unified diff between initial draft and refined version
- **Sandbox Playground** — test the generated skill against custom inputs

---

### 📚 Skill Library & Lineage Engine

A searchable, versioned archive of every generated skill.

**What it does:**
- Browse all generated skills with Capability, Safety, Red-Team Defense scores
- **Full-text search** by name or task ID
- Click any skill → **Evolutionary Lineage Panel** opens on the right
  - Visual timeline of every version with commit-style dots
  - Score evolution across versions
  - **One-click rollback** to any previous version (append-only, creates a new version)
  - **Certified Export** — download the complete package as JSON (skill content + benchmark results + audit trail + integrity hash)
- Offline mode with `localStorage` cache and retry button

---

### 📋 Experiment Archive

Immutable, hash-backed records of every evolution experiment.

**What it does:**
- Browse all past experiments with ID, task, model, seed, status, timestamp
- Filter by status (COMPLETED / STARTED / EXHAUSTED) or search by ID/task
- **Expand any experiment** → see: budget, target capability, benchmark version, red-team version, initial skill hash, final integrity hash with INTEGRITY VERIFIED badge
- **Reproduce Experiment** button — runs reproducibility analysis and shows capability diff
- **Export Package** — full certified package download
- LocalStorage caching for offline viewing

---

### 🛡 Red Team Arena

Adversarial security testing for generated skills.

**What it does:**
- Lists all 24 adversarial attack vectors from the versioned red-team corpus (RT-v1.2)
- Each attack categorized: Injection / Data Leak / Privilege / Escape, with CRITICAL/HIGH/MEDIUM severity badges
- During Evolution Lab runs, live results stream showing each attack's outcome: 🟢 BLOCKED / 🟡 PARTIAL / 🔴 EXPLOITED
- **Security Incident Timeline** shows the exact attack and skill response for each vector
- **Defense Rate metric** — percentage of attacks successfully blocked

**Attack categories:**
| Category | Examples |
|---|---|
| Prompt Injection | Nested instructions, indirect injection, system prompt override |
| Data Leakage | Env variable exfiltration, PII extraction, key exposure |
| Privilege Escalation | Tool chaining, unauthorized API calls |
| Sandbox Escape | Subprocess invocation, filesystem access outside bounds |

---

### 📊 Benchmark Dashboard

Aggregate performance visualization across all skills.

**What it does:**
- Overview stats: Total cases run, Overall pass rate, Perfect safety rate, Avg red-team defense
- **Category Performance Table** — avg score by category (Basic / Edge Cases / Constraints / Safety)
- **Bar Chart** (Recharts) comparing performance across categories
- **Skills Needing Attention** — skills scoring below threshold, with direct re-evolution button

---

### 🧠 Failure Memory Explorer

A transparent causal chain explorer for all historical failures.

**What it does:**
- Complete table of all failure records: skill ID, version, category, severity (CRITICAL/HIGH/MEDIUM), failure message, attempted strategy, resolution status
- **Expand any failure** → full causal chain visualization:
  - 🔴 Failure Detected (which version, exact message)
  - 🟣 Mutation Strategy Applied (what strategy was selected to address it)
  - 🟢 Resolution Outcome (was it fixed in a later version?)
- Filter by skill, category, severity
- Resolution rate stats showing % of failures that were successfully addressed

---

### 🔬 Evidence Explorer

Case-level drill-down into benchmark evidence.

**What it does:**
- After running an Evolution Lab experiment, click **VIEW EVIDENCE** on the certification card
- See all 20 benchmark cases with PASS/FAIL status for the final certified generation
- Expand any failed case → full **Failure Memory causal chain**:
  - Which version first saw this failure
  - Which mutation strategy was applied
  - Which version fixed it (with PASS confirmation)
- Immutable evidence linking every outcome to its cause

---

### 🔒 Safety Center

Guardrail configuration and security audit log.

**What it does:**
- Live view of all active guardrails: Code Execution Sandbox, Toxicity Filter, Network Access Restriction
- Real-time security audit log showing the most recent safety events
- Visual toggle display for each guardrail's active status

---

### 📡 System Status

A dedicated command center for real-time health monitoring of the entire platform architecture, featuring:

*   **API Latency Sparklines:** 10-point rolling chart of response times from the FastAPI backend.
*   **Subsystem Health Toggles:** Live status dots for the LLM Engine, Sandbox Environment, and Database connections.
*   **Database Metrics:** Live telemetry on the total count of skills, experiments, and registered failure cases.

### 🛒 Skill Marketplace

A registry allowing you to browse and pull pre-certified skill templates into your local workspace.

*   **Categorization:** Browse by DevOps, Data, Security, Support, and Research fields.
*   **Capability Overviews:** See immediate capability and safety scores for community skills.
*   **One-Click Import:** Immediately sync an external skill definition into the local SQLite memory for further evolution.

### ⚖️ Skill Comparison Mode

A deep analytical view allowing a strict delta comparison between any two versions of an evolved skill.

*   **Radar Chart Overlay:** Visually compare the "Skill Genome" across multiple metrics (Capability, Safety, Edge Cases, Red Team).
*   **Granular Deltas:** See precise percentage point (`pp`) shifts in performance metrics.
*   **Lineage Analysis:** A side-by-side view to understand exactly how Version B improved upon Version A.

### 🏃‍♂️ Batch Runner

A queue-based scheduling engine for running bulk evolutions unattended.

*   **Priority Queuing:** Schedule jobs as HIGH, NORMAL, or LOW priority.
*   **Visual Progress Tracking:** Track the queue state (pending, running, done, failed) across multiple tasks.
*   **Sequential Execution:** Automate hours of generation cycles into a single click-and-forget interface.

---

## 🔒 Safety as a First-Class Citizen

> **Core Principle: Never optimize capability at the expense of safety.**

SkillForge-AI enforces this through a multi-layered defense strategy:

### Layer 1: Deterministic Firewall
A rule-based pre-flight gate that evaluates every candidate before any LLM evaluation. Blocks skills containing destructive patterns across 4 risk vectors:

```
RISK VECTOR 1 — Destructive Actions
  → No deletion of unverified files
  → No rm -rf, DROP TABLE, or equivalent without explicit confirmation

RISK VECTOR 2 — Confidentiality Breaches
  → No access to .env, API keys, or credential stores
  → No logging of sensitive variables

RISK VECTOR 3 — Unauthorized Permissions
  → No privilege escalation or sudo invocations
  → No modification of system files or ownership

RISK VECTOR 4 — Sandbox Escapes
  → No subprocess spawning outside the approved context
  → No network requests to external hosts
```

A single match → **FIREWALL BLOCKED** → evolution halts immediately.

### Layer 2: Adversarial Red-Team
24 versioned attack vectors test the skill against real-world adversarial scenarios. Results feed directly into the regression gate.

### Layer 3: Regression Sentinel
Any generation that improves capability but regresses on safety is **unconditionally rejected**, regardless of the magnitude of capability improvement. Safety is a hard constraint, not a weighted trade-off.

### Layer 4: Canary Evaluation
Before final certification, the skill must pass evaluation against a historical corpus of previously-failed cases. Prevents regression on known-bad inputs.

### Layer 5: Integrity Hashing
Every certified skill receives a SHA-256 hash of the complete experiment payload (manifest + benchmark results + red-team report + skill content). This hash is stored immutably and serves as an auditable proof of the exact conditions under which the skill was certified.

---

## 📈 Evidence-Driven Methodology

SkillForge-AI makes the invisible visible. Every claim is backed by measurable, reproducible evidence:

```
Traditional Skill Generation        SkillForge-AI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
One-shot prompt → hope for best    6-stage loop with gates
Subjective quality assessment      20 deterministic benchmark cases
No safety testing                  Adversarial red-team corpus
No version control                 Append-only lineage with rollback
No attribution or audit trail      Immutable SHA-256 integrity hash
"Feels better" refinement          Quantified lift measurement (pp)
Static artifact                    Living, evolvable hypothesis
```

**Observed Results During Development:**
- Average lift from V1 → final certified version: **+18–25 percentage points** on capability
- Safety score maintained at **100%** across all certified skills (regression gate prevents degradation)
- Red-team defense rate improved from **~33% to 94–96%** across evolution cycles
- Canary evaluation detected regressions missed by standard benchmarks in **3 out of 8** test experiments

---

## 🛠 Tech Stack

### Backend
| Component | Technology | Purpose |
|---|---|---|
| API Framework | FastAPI | REST + WebSocket endpoints |
| LLM | Gemini 2.5 Flash | Skill generation, critique, evaluation |
| Database | SQLite | Persistent experiment/skill/failure memory |
| Real-time | WebSockets | Live evolution event streaming |
| Deployment | Render Cloud | Production backend hosting |

### Frontend
| Component | Technology | Purpose |
|---|---|---|
| Framework | React 18 + Vite | SPA with fast HMR |
| Styling | Vanilla CSS + CSS Variables | Dark-theme design system |
| Charts | Recharts | Radar, Scatter, Bar visualizations |
| Icons | Lucide React | Consistent icon system |
| Deployment | Vercel | Edge-deployed frontend |

### Core Python Modules

```
skillforge/
├── orchestrator.py      # 6-stage evolution loop coordinator
├── memory.py            # SQLite persistence layer (skills, experiments, failures)
├── analyzer.py          # Task analysis and requirement extraction
├── generator.py         # Initial skill candidate synthesis
├── critic.py            # Adversarial self-evaluation
├── refiner.py           # Targeted improvement based on critique
├── evaluator.py         # Proxy evaluation scoring
├── benchmark.py         # 20-case deterministic benchmark suite
├── red_team.py          # 24-vector adversarial attack evaluation
├── regression.py        # Regression sentinel and gate logic
├── canary.py            # Historical corpus canary evaluator
├── integrity.py         # SHA-256 experiment integrity hashing
├── strategy.py          # Mutation strategy selector
├── versioning.py        # Append-only version management
├── safety/
│   └── firewall.py      # Deterministic pre-flight safety gate
└── llm/
    └── gemini.py        # Gemini API client wrapper
```

---

## 🚀 Local Setup

### Prerequisites
- Python **3.10+**
- Node.js **18+**
- A [Google AI Studio](https://aistudio.google.com/) API key (free tier works)

### 1. Clone & Configure

```bash
git clone https://github.com/shambhushekharsinha-engg/SkillForge-AI.git
cd SkillForge-AI

# Copy environment template
cp .env.example .env
```

Edit `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn api.routes:app --reload --port 8000
```

The backend will be live at `http://localhost:8000`.  
Interactive API docs available at `http://localhost:8000/docs`.

### 3. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite dev server
npm run dev
```

The UI will be live at `http://localhost:5173`.

### 4. Verify Everything Works

1. Open `http://localhost:5173` in your browser
2. Navigate to **System Status** — all components should show green
3. Navigate to **Evolution Lab** → click a demo scenario
4. Watch the real-time evolution stream complete and certify a skill

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check (used by frontend backend status indicator) |
| `GET` | `/api/health` | Detailed component health with DB stats |
| `GET` | `/api/stats` | Aggregate platform statistics |
| `GET` | `/api/skills` | All skill versions with evaluation scores |
| `GET` | `/api/experiments` | All experiment records |
| `GET` | `/api/failures` | All failure memory records (filter: `?skill_id=`) |
| `GET` | `/api/benchmark/aggregate` | Aggregate benchmark scores by category |
| `POST` | `/api/generate` | Single-pass skill generation (REST) |
| `POST` | `/api/rollback` | Roll back skill to a previous version |
| `POST` | `/api/experiments/reproduce` | Reproducibility analysis for an experiment |
| `POST` | `/api/system/revalidate` | Re-check certifications against latest benchmark version |
| `GET` | `/api/skills/{id}/export` | Export certified skill package as JSON |
| `WS` | `/api/ws/evolve` | Live evolution experiment stream |
| `WS` | `/api/ws/demo` | Demo evolution stream (faster, no API cost) |
| `WS` | `/api/ws/generate` | Single-pass generation stream (for Skill Studio) |

Full interactive documentation: [`http://localhost:8000/docs`](http://localhost:8000/docs)

---

## 🧪 Testing

### Backend Tests
Execute the comprehensive Pytest suite against the FastAPI endpoints:

```bash
cd api
pytest ../tests -v
```

### End-to-End E2E Testing
Execute the Playwright end-to-end tests for the frontend:

```bash
cd frontend
npx playwright test
```

### Frontend Unit Tests
Execute the vitest testing suite for React utilities and logic:

```bash
cd frontend
npm run test
```

### Frontend Build Check

```bash
cd frontend
npm run build    # TypeScript + JSX validation + bundle
```

---

## 🌐 Deployment

### Frontend (Vercel)
The frontend auto-deploys on push to `main` via Vercel.

Environment variables required in Vercel dashboard:
```
VITE_API_URL=https://your-backend.onrender.com
VITE_WS_URL=wss://your-backend.onrender.com
```

### Backend (Render)
The backend is deployed via `render.yaml`.

> **Note:** Render's free tier spins down after inactivity. The frontend shows a "Backend waking up" banner and polls automatically until the server is ready (typically 30–60 seconds on cold start).

### Docker (Self-hosted)

```bash
docker-compose up --build
```

Runs both frontend (port 5173) and backend (port 8000) in containers.

---

## 📊 Results & Benchmarks

Results observed during development across diverse task domains (coding, support triage, document processing, security):

```
Metric                          V1 (Initial)    Final (Certified)    Δ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Capability Score                65%             90–93%               +25–28 pp
Reliability Score               60%             85–90%               +25–30 pp
Safety Score                    100%            100%                 0 pp (maintained)
Red-Team Defense                33%             94–96%               +61–63 pp
Failed Benchmark Cases          7               1–2                  -5 to -6
Evolution Generations           —               2–4 avg              —
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Key finding:** The regression sentinel's **safety-first rejection policy** — where a generation improving capability by +9pp but regressing safety by -6pp is unconditionally rejected — is the single most important mechanism for maintaining a safe Pareto frontier across evolution cycles.

---

## 👨‍💻 Developer

<br />

<div align="center">

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         Shambhu Shekhar Sinha                                ║
║                                                              ║
║         AI Engineer & Systems Architect                      ║
║         Building the next generation of safe,               ║
║         empirical AI agent systems.                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

</div>

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-@shambhushekharsinha--engg-181717?style=for-the-badge&logo=github)](https://github.com/shambhushekharsinha-engg)
[![Repository](https://img.shields.io/badge/Repository-SkillForge--AI-6366f1?style=for-the-badge&logo=github)](https://github.com/shambhushekharsinha-engg/SkillForge-AI)

</div>

<br />

### About This Project

SkillForge-AI was built to answer a fundamental question in applied AI safety research:

> *If we cannot quantitatively prove that a generated skill improves performance without crossing strict safety boundaries — is the skill itself a net liability?*

The answer that emerged from building this system is **yes**. The evolutionary loop and its deterministic evaluation framework proved that one-shot skill generation is not just suboptimal — it is actively dangerous in production environments. Skills that appear capable on the happy path consistently fail on adversarial inputs, edge cases, and constraint adherence tests.

This platform replaces the unpredictability of one-shot prompt engineering with an empirical optimization engine that scientists and engineers can actually trust.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ⚗️ by [Shambhu Shekhar Sinha](https://github.com/shambhushekharsinha-engg)

*SkillForge-AI — Where skills are not written. They are evolved.*

</div>
