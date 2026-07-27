# TE PŪMANAWA — The Hermes Codex

An interactive WebGL "codex" of the nine worker-profiles of **Hermes**, an AI operator.
Each profile is a living sculpture in a generative Aotearoa koru-nebula. They begin
**sealed**; you unlock each through a micro-trial true to its role. Clear all nine and
the *whakapapa* — the woven lineage — completes.

> “He pūmanawa, he whakapapa — nine minds, one current.”

## Why it exists
This is a **profile brief as a website** — a single, self-contained, dependency-free page
that presents the lab's agent roles (architect, coder, researcher, reviewer, builder,
data-analyst, copywriter, devops, ip-guard) with their real machine routing, models and
mandates, wrapped in an experience rather than a table.

## What's inside
- **Custom GLSL** generative background — a domain-warped volumetric koru-nebula with a
  Matariki-style starfield, drawn in a fragment shader (no textures, no images).
- **9 procedural node sculptures** — each an icosahedron displaced by 3D fbm noise in a
  vertex shader, shaded with a fresnel + cosine-palette iridescence, seeded per profile so
  every mind looks unique.
- **A hand-rolled orbit camera** (drag / scroll / idle auto-rotate) — no external controls.
- **Nine role-flavoured unlock gates**:
  - *Architect* — assemble the build sequence (order)
  - *Coder* — type the incantation to the local model (typing)
  - *Researcher* — resolve the true signal from the noise (entity resolution)
  - *Reviewer* — spot the silent pipeline fault (code review)
  - *Builder* — sequence the integration steps (order)
  - *Data-Analyst* — read the context-window chart (analysis)
  - *Copywriter* — pick the persuasive, IP-clean line (voice)
  - *DevOps* — hold the gateway pulse in the green (liveness)
  - *IP-Guard* — spot the infringement; enforces the studio's **HARD IP RULE**
- **Generative kowhaiwhai signatures** — each unsealed profile renders its own living
  spiral, seeded by its name (2D canvas, recursive koru).
- **WebAudio** — an original generative ambient pad + interaction stings (no licensed audio).
- Fully **responsive**, **reduced-motion aware**, and **IP-clean** (original art only;
  no copyrighted characters, logos, lyrics or real artists).

## Run it locally
```bash
cd hermes-profile-codex
python3 -m http.server 8099
# open http://localhost:8099
```
No build step, no `npm install`. `assets/three.min.js` is vendored, so it works offline
and will never break because a CDN went away.

## Deploy to GitHub Pages
1. Push this folder to a repo.
2. Repo **Settings → Pages → Source: main / root**.
3. Your site goes live at `https://<user>.github.io/<repo>/`.

## Files
```
index.html        # shell, original CSS design system, loads assets
assets/app.js     # all logic: shaders, scene, gates, audio, generative art
assets/three.min.js  # vendored Three.js (r160, UMD) — the only dependency
```

## Notes
- Profile data is grounded in the live lab topology (M1 / M2 / M3 routing, model contexts).
- The Māori visual language (koru, kowhaiwhai, Matariki) is used as **original generative
  interpretation and appreciation** — not as reproduction of tapu/sacred designs.
- Built by Hermes (operator/Atua on M1, WSL) for Hux / Amanah2.

---
MIT — do what you like, just keep it original.
