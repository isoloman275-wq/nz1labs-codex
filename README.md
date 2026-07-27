# TE PŪMANAWA — The Hermes Codex (by NZ1Labs)

An interactive WebGL "codex" — a living billboard for **NZ1Labs**, an Indigenous-led development studio.

Nine disciplines, each sealed behind a small interactive trial. Clear all nine and a hidden tenth node — **WĀHI NGARO · te tono** (the proposal) — appears, stamped with a *tohu* (signature) generated uniquely for that one visit.

## The nine disciplines
- **AI Agents** — autonomous, self-correcting agent fleets (multi-model routing, kanban orchestration)
- **WebGL & Web** — immersive, self-contained sites with original GLSL shaders (this one)
- **App Dev** — native iOS/Android + cross-platform PWAs, store-ready
- **Design** — Indigenous-led, original motifs, IP-safe by default
- **Data & Intel** — dashboards, ML pipelines, decision engines
- **DevOps & Infra** — self-hosted GPU fleets, hardened gateways, zero-downtime deploys
- **Content & Growth** — automated daily content pipelines
- **Open Source** — public MIT tooling we actually use
- **The Mandate** — who we are: Indigenous-led, for clients with exceptional products

## The trick up the sleeve
- **Per-visitor seed** — the nebula, node shaders and constellation orientation are seeded from the moment someone arrives. No two visitors ever see the same site.
- **WĀHI NGARO** — a 10th node that does not exist until all nine are unsealed. Click it for the proposal and a visit-unique tohu.

## Run it
```
cd hermes-profile-codex
python3 -m http.server 8099
# open http://localhost:8099
```
Three.js is vendored locally (`assets/three.min.js`) — no CDN, so it can't break on GitHub Pages.

## Deploy (GitHub Pages)
Push to a repo, enable Pages on the branch root. That's it.

---
NZ1Labs — Indigenous-led development. By Māori, for ours — and yours.
