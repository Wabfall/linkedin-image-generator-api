# Docker Setup Design

**Date:** 2026-05-17
**Goal:** Containerize the LinkedIn Post Generator for deployment on a VPS alongside multiple other projects.

## Context

The app is a Next.js 15 API that generates LinkedIn post PNG images. It uses `@resvg/resvg-js` (a native Node.js module with prebuilt binaries), a large `public/emoji` directory (~1000+ SVGs), and bundled fonts.

## Architecture

### Multi-project VPS strategy

Each project on the VPS is independent:

```
~/
├── traefik/                        # Shared reverse proxy (separate private config)
│   ├── docker-compose.yml
│   ├── traefik.yml
│   └── acme.json
│
├── linkedin-post-generator/        # This repo (cloned from GitHub)
│   ├── docker-compose.yml          # Public — local dev only
│   ├── docker-compose.override.yml # Private — Traefik + domain (never committed)
│   └── ... (app code)
│
└── other-project/
    └── docker-compose.yml
```

A shared Docker network `traefik-public` connects Traefik to all projects. Traefik listens to Docker events and auto-configures routing when a project does `docker compose up`.

### Separation: public vs private config

- **Public repo** — contains only what's needed to build and run locally. No domain, no SSL, no Traefik references.
- **VPS (private)** — a `docker-compose.override.yml` per project adds Traefik labels and the shared network. Docker Compose merges it automatically with the base file.

## Files added to this repo

### `next.config.ts`
Add `output: 'standalone'` so Next.js emits a self-contained bundle (no full `node_modules` needed at runtime).

### `Dockerfile`
Multi-stage build:

1. **deps** — `node:20-alpine`, runs `npm ci`. Installs all dependencies including the platform-specific prebuilt binary for `@resvg/resvg-js` (linux/amd64 or linux/arm64).
2. **builder** — copies deps, copies source, runs `npm run build`. Produces `.next/standalone`.
3. **runner** — minimal `node:20-alpine` image. Copies:
   - `.next/standalone/` (the self-contained server)
   - `public/` (emoji SVGs, fonts — required at runtime)
   - `.next/static/` (CSS, JS chunks for the playground page)

Final image size: ~300–400 MB (dominated by emoji SVGs and bundled fonts).

### `docker-compose.yml`
Local development use only. Exposes port 3000 directly. No Traefik, no SSL, no domain.

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

### `.dockerignore`
Excludes: `node_modules`, `.next`, `.git`, `test-img`, `docs`.

## VPS-only config (not in this repo)

`docker-compose.override.yml` example (user creates this on the VPS):

```yaml
services:
  app:
    ports: []                        # Remove direct port exposure
    networks:
      - traefik-public
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.linkedin.rule=Host(`linkedin-api.wabfall.tech`)"
      - "traefik.http.routers.linkedin.entrypoints=websecure"
      - "traefik.http.routers.linkedin.tls.certresolver=letsencrypt"

networks:
  traefik-public:
    external: true
```

## Decisions

- **`output: 'standalone'`** — reduces image size significantly vs copying full `node_modules`.
- **Alpine base image** — lighter than Debian slim; `@resvg/resvg-js` has Alpine-compatible prebuilt binaries.
- **`@resvg/resvg-js` handling** — relies on npm's prebuilt binary download during `npm ci` inside Docker (correct platform). No manual compilation needed.
- **`public/` copied explicitly** — Next.js standalone does not include `public/` automatically; the emoji SVGs and fonts are required at runtime.
