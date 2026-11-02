# Repository Intelligence AI — Viva Study Guide (A to Z)

Read top to bottom once. Then jump to **Part 12 (Q&A)** to practise.

---

## Part 0 — Be honest about what is in this repo (read first!)

The PRD splits the project into three people:

| Person | Owns | In this repo? |
|---|---|---|
| **Yashodhan (you)** | Product, frontend (Next.js), GitHub-App user flow, dashboards, graph UI, PR-review UI | **Yes — this repo** |
| Swarali | Deep learning: GraphCodeBERT, GNN, history encoder, fusion, 3 heads, evaluation, ablation | **No** |
| Kaivalya | FastAPI backend, parsing, graph building, Git history, Semgrep, Celery, Docker | **No** |

So `skytrace` is a **working frontend running on a typed mock data layer** (`lib/mock-data.ts`).
The numbers you see (91% defect risk, health 73/100) are hand-written demo data shaped exactly like the
real backend's answers (`lib/types.ts`). When the backend is ready, you replace the functions in
`mock-data.ts` with `fetch()` calls and no component changes.

**If the examiner asks "did your model predict this?"** the honest answer is: *"The UI shows the output of
the ML pipeline. In this demo build the output is mocked to the agreed integration contract; the model
design and training are Swarali's module, and I can explain the architecture end to end."*
Do **not** claim you trained the model. You *can* confidently explain it, because the next parts teach it.

---

## Part 1 — The project in one minute

**Problem:** Normal tools (linters, Semgrep) look at one file or one rule at a time. But software is a
*connected system*: file A calls file B, B was changed 19 times last month, and B has had bugs before.
A bug risk depends on **what the code says + how it is connected + how it has changed over time.**

**Solution:** Repository Intelligence AI reads a GitHub repo and, for every file/function, predicts:

1. **Defect (bug) risk** — will this contain a bug?
2. **Security risk** — is this vulnerable?
3. **Regression risk** — if someone changes something nearby, will this break?

…and also shows *why*, finds similar past bugs, reviews pull requests, and recommends which tests to run.

**Key words to remember:** *multi-modal* (code + graph + history), *multi-task* (3 predictions),
*explainable*, *repository-level* (not file-level).

---

## Part 2 — Big picture pipeline (the "how it works" diagram)

```
GitHub repo
   │  (Kaivalya) clone → parse with Tree-sitter / Python AST → functions, classes, imports, calls
   │                      Git history → commits, diffs, co-changes, bug-fix commits
   ▼
┌──────────────── Three views of every component ────────────────┐
│ 1. CODE      → GraphCodeBERT       → code embedding (vector)   │
│ 2. GRAPH     → GNN (PyTorch Geom.) → structure embedding       │
│ 3. HISTORY   → History encoder     → history embedding         │
└────────────────────────────┬───────────────────────────────────┘
                             ▼
                      Fusion network  (combine the 3 vectors)
                             ▼
                Unified Repository Embedding (one vector per component)
                ┌────────────┼─────────────┐
                ▼            ▼             ▼
            Bug head   Security head  Regression head   → 3 probabilities (0–1)
                             │
                             ├── store vector in FAISS  → "similar past bugs"
                             ▼
                     FastAPI  →  Next.js frontend (YOU)
```

---

## Part 3 — Deep learning concepts from zero

### 3.1 What is an embedding?
A computer can't "read" code. An **embedding** turns a piece of code into a list of numbers
(e.g., 768 numbers) so that **similar code gets similar numbers**. Think of it as GPS coordinates for
meaning: two functions that do similar things end up "close" on the map.

### 3.2 Transformer / BERT in 4 lines
- A **Transformer** reads all tokens at once and uses **self-attention** ("which other words matter for
  this word?").
- **BERT** is a Transformer *pre-trained* by hiding some words (Masked Language Modelling) and guessing them.
- Pre-training on huge data first, then fine-tuning on your small task = **transfer learning**.
  *(Why: we have few labelled bugs; the model already knows code from millions of examples.)*

### 3.3 CodeBERT → GraphCodeBERT
- **CodeBERT** (Microsoft): BERT trained on code + natural-language comments (6 languages).
- **GraphCodeBERT**: CodeBERT + knowledge of the code's **data flow** (which variable's value comes from
  where). Pre-training adds *edge prediction* and *code–data-flow alignment* tasks, so it understands
  *meaning*, not just word order.
- **Why we picked it:** code semantics matter, it's pre-trained (no training from scratch — the PRD
  explicitly says "Training a large code language model from scratch" is a non-goal), and it's open source on Hugging Face.
- **Limit to mention:** input length is 512 tokens, so long files must be split into function-level chunks.

### 3.4 Graph Neural Network (GNN)
A repository is a **graph**: nodes = files/functions/classes; edges = IMPORTS, CALLS, DEFINES, etc.
A GNN does **message passing**: each node collects vectors from its neighbours, mixes them, updates
itself; repeat for k layers (k hops). After this, a node's vector knows *who it depends on and who
depends on it*.
- Library: **PyTorch Geometric**.
- Example: `validate_session()` is called by 4 modules → the GNN encodes "this is central and
  everyone depends on it".
- **Why a plain MLP/BERT can't do it:** they look at one item alone; they have no idea of neighbours.

### 3.5 History encoder
Features from Git: how often it changes, number of authors, how many past commits were *bug-fix*
commits, how often it changes together with other files (co-change), file volatility. Fed to a small
network (MLP, or LSTM/Transformer if it's a time sequence). **Why:** bugs cluster where code churns —
well-known finding in software-engineering research.

### 3.6 Fusion network
We have 3 vectors (code, graph, history). Fusion = **concatenate** them (or attention-weight them)
and pass through dense layers to make one **unified repository embedding**.
Simple version: `z = MLP([code ‖ graph ‖ history])`.

### 3.7 Multi-task heads
From the same embedding `z`, three small output layers each end with a **sigmoid**
(squashes to 0–1 = probability):

- Bug head → `bug_probability`
- Security head → `security_probability`
- Regression head → `regression_probability`

Loss: **binary cross-entropy** per head; total loss = weighted sum.
**Why multi-task:** the tasks share signals (a risky, central, churny file tends to be bad in all three),
so learning together helps and we store only one embedding (cheaper than 3 models).

### 3.8 FAISS (similarity search)
FAISS (Facebook AI Similarity Search) stores millions of vectors and quickly finds the **top-K nearest**
(cosine / L2 distance). We store embeddings of past buggy/vulnerable code; for the current component we
fetch the K closest ones → UI shows "Similar historical patterns, 91% similar".

### 3.9 How the output becomes a risk label
Probability × 100 → level (this is real code, `lib/risk.ts`):

| Score | Level |
|---|---|
| ≥ 85 | CRITICAL |
| ≥ 65 | HIGH |
| ≥ 35 | MEDIUM |
| < 35 | LOW |

---

## Part 4 — Data, labels, training, evaluation

**Datasets (PRD §19, §28)**
- **Devign** — real vulnerable/non-vulnerable functions from FFmpeg & QEMU. ⚠ Those are **C** projects,
  while our product targets Python/JS/TS. Be ready: *"Devign is used for pre-training/benchmarking the
  vulnerability head; language transfer is a known limitation, and repo-specific adaptation is listed as post-MVP."*
- **Bug-fixing commits** from open-source repos as weak/self-supervised labels: if a commit message says
  "fix bug…", the lines/files it changed were buggy *before* the commit (SZZ-style idea).
  Cheap labels, but noisy — that's a limitation.

**Class imbalance:** only ~2–5% of files are buggy (see mock: 458 LOW vs 2 CRITICAL). Accuracy is
misleading (a model saying "never buggy" gets 95%). So we use **Precision, Recall, F1, ROC-AUC, PR-AUC**
(PR-AUC is better under imbalance). Fixes: class weights, focal loss, oversampling.

**Metric definitions (memorise with the example "flag risky files")**
- **Precision** = of files I flagged, how many were truly buggy. (TP / (TP+FP))
- **Recall** = of truly buggy files, how many did I catch. (TP / (TP+FN))
- **F1** = harmonic mean of the two.
- **ROC-AUC** = chance a random buggy file scores higher than a random clean one.
- **PR-AUC** = area under precision–recall curve; stricter for rare positives.
- **Precision@K** = of the top-K results returned (e.g., similar bugs), how many are relevant.
- **Recall@K** = of all relevant items, how many appear in the top K.
- **MRR** = average of 1/rank of the first correct result.

**Ablation study (PRD §24)** — the research contribution. Train four versions:
`Code only → Code+Graph → Code+History → Code+Graph+History`.
If the last one scores best, you've *proved* graph and history add value over just reading code.
That is the answer to "why multi-modal?" — **evidence, not opinion.**

---

## Part 5 — Security part

Hybrid = **rules + ML**:
- **Semgrep** (pattern rules), **Bandit** (Python security linter), custom AST rules → precise, explain
  exactly line and rule, but only find *known* patterns.
- **ML security head** → catches fuzzy/unknown patterns by similarity to past vulnerabilities, gives a probability.
- Each finding is normalised into one format: severity, file, line, category, confidence, evidence,
  `source: "semgrep" | "bandit" | "ml-risk-model" | "custom-rule"` (see `SecurityFinding` in `lib/types.ts`).
- Example in the demo: Semgrep flags missing Stripe webhook signature check **and** the ML model
  corroborates at 0.79 → higher trust.

---

## Part 6 — Explainable AI (a favourite viva topic)

**Why:** a bare "91% risky" isn't trusted by developers. They need the reasons.

**What the app shows (PRD §12):** a "Why is this risky?" panel with weighted evidence factors:
historical defect frequency, dependency centrality, modification frequency, similarity to known
defective code, downstream dependents. In the demo, `auth/service.py` has four factors with weights
0.32 + 0.28 + 0.22 + 0.18 = **1.00** — contribution bars that sum to 100%.

**How it is done in the real world (be able to name them):**
- **SHAP / LIME** — measure each input feature's contribution to the prediction.
- **Attention weights** — which tokens the Transformer focused on.
- **GNNExplainer** — finds the sub-graph/edges that most influenced a GNN prediction.
- **Integrated Gradients** — gradient-based attribution.

Honest line: *"The frontend renders `evidence[]` with `label, detail, weight`. The backend decides how
weights are computed (feature attribution); the UI is agnostic."*

---

## Part 7 — Repository Health Score

Weighted average of five sub-scores (higher = healthier). Weights in the demo data
(`lib/mock-data.ts`):

| Sub-score | Weight | Demo value |
|---|---|---|
| Defect risk | 0.30 | 68 |
| Security risk | 0.30 | 74 |
| Regression risk | 0.20 | 71 |
| Code quality | 0.10 | 79 |
| Historical stability | 0.10 | 76 |

`Health = Σ weight × sub-score`
Let me verify: 0.3·68 + 0.3·74 + 0.2·71 + 0.1·79 + 0.1·76 = 20.4 + 22.2 + 14.2 + 7.9 + 7.6 = **72.3**.
⚠ The demo shows **73**, because the mock data is hand-typed. If the examiner does the maths, say:
*"The mock value is rounded/hand-entered; in the real pipeline the backend computes it with this formula."*
(Or fix the mock to 72 before the viva.)

Why fixed weights? PRD §13: initial implementation is a fixed weighted aggregation, "configurable and
documented"; the report should explain rationale and limitations (weights are a design choice, not learned).
Labels: ≥80 Healthy, ≥60 Needs attention, ≥40 At risk, else Critical.

---

## Part 8 — Graph, change impact, smart testing

**Graph model**
- Nodes: Repository, File, Function, Class, Dependency, Commit, Pull Request.
- Edges: `IMPORTS, CALLS, DEFINES, INHERITS, DEPENDS_ON, MODIFIED_BY, CO_CHANGED_WITH`.
- Built with Tree-sitter / Python AST + NetworkX.

**Change impact (regression analysis):** when a PR changes `auth.py`, walk the graph **backwards along
CALLS/IMPORTS edges** (who depends on me?) — a BFS. Each affected file gets a **hop count**
(1 hop = direct dependant, 3 hops = far away). Closer = more likely to break. In the UI:
"Potentially affected" list with hops.

**Smart testing:** changed components → affected components → rank by risk → recommend tests that cover
those, highest priority first. Result: run 3 relevant suites instead of the whole test suite — saves CI time.

---

## Part 9 — Your part: the frontend (what you built and why)

| Tech | What it does | Why chosen |
|---|---|---|
| **Next.js 16 (App Router)** | React framework: file-based routing, server/client components, loading/error files | SEO-ready, fast, routes = folders, built-in `loading.tsx`/`error.tsx`/`not-found.tsx` |
| **TypeScript** | JS with types | Catches mismatches with backend shape at compile time — `lib/types.ts` *is* the contract |
| **Tailwind CSS v4 + shadcn/ui (Radix)** | Styling + accessible components | Fast, consistent design, keyboard/screen-reader support |
| **React Flow + dagre** | Interactive graph; dagre auto-places nodes (left-to-right) in `lib/graph-layout.ts` | Zoom/pan/click nodes, no manual coordinates |
| **Recharts** | Health-trend line, risk-distribution chart | Simple React charts |
| **next-themes** | Dark/light mode (dark default) | UX |

**Routes (`app/`)**
- `/` landing + connect → `/onboarding` GitHub connect + repo selection
- `/repositories` all repos → `/repositories/[repoId]` dashboard
- `.../analyzing` pipeline progress (7 steps: clone, parse, graph, history, models, embeddings, health)
- `.../components/[componentId]` risk detail (3 meters, Why panel, metrics, dependants, similar patterns)
- `.../graph` dependency explorer; `.../pull-requests` and `/[prId]` PR review

**Mock data layer:** `lib/mock-data.ts` exports accessors (`getRepository`, `getComponentsForRepo`,
`getPullRequest`…). To go live: swap for `fetch` to FastAPI endpoints (PRD §17). That's the
"integration contract" (PRD §20): ML → `{component_id, bug_probability, security_probability, regression_probability, embedding_id}`.

**Why mock first?** The three of you work in parallel; agreeing the JSON shapes up front lets the
frontend be built and demoed before the backend/model exist. It's standard "contract-first" development.

---

## Part 10 — Demo flow (5 min) — see `docs/DEMO_SCRIPT.md`
Connect repo → analysis progress → dashboard (health 73, risk distribution 2/7/19/458) → open
`auth/service.py` (Critical, 91%) → Why panel → graph → downstream dependants → similar bugs (up to 91%)
→ PR #124 review (Bug HIGH, Security MEDIUM, Regression HIGH) → recommended tests → health trend (61→73).

---

## Part 11 — Limitations & future work (say these proactively; examiners love it)
1. Prediction ≠ proof of a bug (PRD non-goal): it's a **risk estimate** to prioritise human review.
2. Weak labels from commit messages are noisy.
3. Devign is C-only; product targets Python/JS/TS → domain shift.
4. Fixed health weights, not learned.
5. Cold start: new repos have little history; repo-specific adaptation is post-MVP.
6. 512-token limit of GraphCodeBERT → function-level chunking.
7. Frontend currently uses mock data, backend integration pending.
Future: more languages, VS Code extension, auto PR comments, continuous monitoring.

---

## Part 12 — Likely viva questions with short answers

**General**
1. *What does your project do?* — Analyses a GitHub repo as a connected system and predicts bug, security and regression risk per component, explains why, finds similar past bugs, reviews PRs, recommends tests.
2. *What's new vs SonarQube/Semgrep?* — They're rule-based and file-local. We fuse code semantics + dependency graph + Git history in a learned model and give explanations.
3. *Who are the users?* — Developers, maintainers/teams, students/researchers.
4. *What was your role?* — Product + frontend + GitHub-flow UI + integration; Swarali ML; Kaivalya backend.

**Deep learning**
5. *Why deep learning, not rules?* — Rules catch known patterns only; DL learns subtle patterns and generalises; combine both for security.
6. *What is an embedding?* — A numeric vector representing meaning; similar items are close.
7. *Why GraphCodeBERT over plain BERT?* — Pre-trained on code and data flow; understands code structure.
8. *Why not train from scratch?* — Needs huge data/compute; transfer learning + fine-tuning is enough.
9. *What does the GNN do?* — Message passing over the repo graph so each component knows its neighbours/dependencies.
10. *What is message passing?* — Each node aggregates neighbours' vectors, updates its own; k layers = k-hop view.
11. *Why a history encoder?* — Bugs correlate with churn, bug-fix history, co-changes.
12. *What is fusion?* — Combining the three embeddings (concat + MLP/attention) into one.
13. *Why multi-task heads?* — Shared representation, tasks are correlated, one model instead of three.
14. *Activation / loss for heads?* — Sigmoid output, binary cross-entropy.
15. *How do you handle class imbalance?* — Class weights/focal loss, oversampling; evaluate with PR-AUC, F1, not accuracy.
16. *What is overfitting; how avoid?* — Memorising training data; use dropout, early stopping, validation split, weight decay, and *time-based or repo-based splits* to avoid leakage.
17. *What is FAISS and why?* — Fast vector similarity search at scale; returns top-K similar past defects.
18. *Cosine vs Euclidean?* — Cosine compares direction (angle), ignores magnitude; common for text/code embeddings.
19. *Why ablation?* — To prove each modality contributes.
20. *Fine-tuning vs feature extraction?* — Fine-tune updates BERT weights; feature extraction freezes them and only trains heads (cheaper).
21. *What are the 512-token problem and fix?* — Transformer input limit; split into function-level chunks.
22. *What is attention?* — Weighted focus on relevant tokens.
23. *Supervised vs self-supervised here?* — Labels from datasets are supervised; labels derived from bug-fix commits are weak/self-supervised.
24. *How does explainability work?* — Feature attribution (SHAP/GNNExplainer/attention) → weighted factors shown in UI.
25. *Can you guarantee the bug is real?* — No; it's a probability for prioritisation.

**System / frontend**
26. *Why Next.js?* — File-based routing, server components, built-in loading/error states, TypeScript support.
27. *What's the mock layer?* — Typed fake data matching the backend contract so UI works before backend exists; swap for fetch later.
28. *How does the graph render?* — React Flow draws nodes/edges; dagre computes layout; filter by node type; click shows relationships.
29. *How is impact computed?* — Reverse traversal of CALLS/IMPORTS from changed files; hop count = distance.
30. *How's health calculated?* — Weighted sum of 5 sub-scores (0.3/0.3/0.2/0.1/0.1).
31. *How does PR analysis work?* — GitHub webhook → fetch diff → changed files → impact graph + risk scores + security findings → AI summary + tests.
32. *How does GitHub connection work?* — GitHub App (OAuth install, scoped repo permissions, webhooks). Demo simulates it.
33. *Why FastAPI/Celery/Redis?* — Async Python API (same language as ML); analysis is slow, so run in background workers with a queue; frontend polls progress.
34. *Why PostgreSQL?* — Relational data: repos, files, commits, scores, runs.
35. *Security of the app?* — GitHub App least-privilege permissions, webhook signature verification, no code stored beyond analysis (state what you know).
36. *Accessibility?* — Radix primitives, keyboard focus, colour + text labels (not colour alone).

---

## Part 13 — 60-second cheat sheet
- **Idea:** repo-level risk intelligence = **code (GraphCodeBERT) + structure (GNN) + history (encoder) → fusion → 3 heads (bug/security/regression)**.
- **Extras:** FAISS similar bugs, Semgrep/Bandit hybrid security, explainable factors, PR review, smart tests, health score.
- **Eval:** P/R/F1, ROC-AUC, PR-AUC, P@K, R@K, MRR; **ablation: Code → +Graph → +History → +both**.
- **Stack:** Next.js/TS/Tailwind/shadcn/React Flow/Recharts · FastAPI/Postgres/Redis/Celery · PyTorch/PyG/HF/FAISS · Docker.
- **Your part:** frontend + contract-first mock layer; the real model/back-end plug in via `lib/mock-data.ts`.
- **Be honest:** risk estimate, not proof; mock data in demo; Devign is C.
