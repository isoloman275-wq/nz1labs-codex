# HUX — TE PŪMANAWA

My personal site. Not a résumé — a living codex. Nine facets of who I am, sealed in a
generative Aotearoa koru-nebula. Unseal each through a trial true to it; clear all nine
and a hidden place opens.

> “Nine facets. One current. Unseal them — and find the hidden place.”

## The facets
`IDENTITY` (iwi, Taranaki) · `CRAFT` (lead dev) · `STUDIO` (Indigenous-led Etsy POD,
HARD IP RULE) · `TIKTOK` (daily, non-negotiable) · `POKER` (GTO from PT4) ·
`HERMES` (the AI operator I run) · `MISSION CONTROL` (three.js war-room) ·
`OPEN SOURCE` (public MIT repos, isoloman275-wq) · `WHY` (by Māori, for ours).

## The trick up the sleeve
Two things you won't see elsewhere:
1. **Per-visitor seeding.** The koru-nebula, the node shaders and the constellation's
   orientation are all seeded from the moment you arrive. No two visitors ever see the
   same site. Refresh and it rearranges.
2. **WĀHI NGARO — the hidden place.** The tenth node does not exist until you have
   unsealed all nine. It then fades into being at the centre; click it and you get my
   real manifesto beside a *tohu* (signature) generated uniquely from that visit —
   gone the moment you leave.

## Tech
- Custom GLSL fragment shader (generative koru-nebula + Matariki starfield, no images).
- 9 procedural node sculptures (icosahedron displaced by 3D fbm in a vertex shader,
  fresnel + cosine-palette iridescence, seeded per facet).
- Hand-rolled orbit camera (drag / scroll / idle drift).
- Nine role-flavoured unlock gates (choice / order / type / hold-the-pulse).
- Generative kowhaiwhai signatures + a visitor-seeded tohu (2D canvas).
- WebAudio generative ambient + interaction stings (original, no licensed audio).
- Responsive, reduced-motion aware, IP-clean (original art only).

## Run it locally
```bash
cd hermes-profile-codex
python3 -m http.server 8099
# open http://localhost:8099
```
No build step. `assets/three.min.js` is vendored — works offline, never breaks on a CDN.

## Deploy to GitHub Pages
1. Push this folder to a repo.
2. Repo **Settings → Pages → Source: main / root**.
3. Live at `https://<user>.github.io/<repo>/`.

## Files
```
index.html        # shell, original CSS design system, loads assets
assets/app.js     # shaders, scene, gates, audio, generative art, the hidden node
assets/three.min.js  # vendored Three.js (r160, UMD) — the only dependency
```

## Notes
- The Māori visual language (koru, kowhaiwhai, Matariki, wāhi ngaro) is used as original
  generative interpretation and appreciation — not as reproduction of tapu/sacred designs.
- Built by Hermes (operator/Atua on M1, WSL) for Hux / Amanah2.

---
MIT.
