# Playground Page — Design Spec

**Date:** 2026-05-10
**Status:** Approved

## Goal

Add a React page at `/` that serves as both a project showcase and a live interactive playground. Visitors fill in a form exposing every API parameter and see the generated PNG update in real time.

## Architecture

Single file: `src/app/page.tsx` (Next.js App Router, `'use client'`). No new API routes. Calls the existing `POST /api/linkedin-image` endpoint.

## Layout

Split two-column (50 / 50):

- **Left column** — scrollable form, 7 accordion sections
- **Right column** — sticky live preview panel

### Header (full-width, above split)

- App name: "LinkedIn Post Generator"
- Short tagline
- GitHub link (opens in new tab)

## Form sections (left column)

All sections are collapsible accordions, expanded by default.

| # | Title | Fields |
|---|-------|--------|
| 1 | 👤 Identité | `firstName`, `lastName`, `headline`, `timeAgo` |
| 2 | ✍️ Contenu | `textMarkdown` (textarea, supports markdown) |
| 3 | 📊 Statistiques | `reactions`, `comments`, `reposts` (number inputs) |
| 4 | 📐 Layout | `platformStyle` (radio: windows/mac/ios/android), `devicePreview` (radio: mobile/tablet/desktop), `typePreview` (radio: more/less), `size.width` (number), `size.height` (number or "auto") |
| 5 | 🎨 Thème | `theme.background`, `theme.card`, `theme.text`, `theme.subtext`, `theme.divider` (color pickers + hex text input) |
| 6 | 🖼️ Avatar | Radio to pick mode (URL / SVG markup / fichier public), then one conditional field: `profileImageUrl` or `profileSvgMarkup` or `profileSvgPublicPath` |
| 7 | 📎 Pièces jointes | Dynamic list of `attachmentsUrls` (add/remove URL inputs) |

## Live Preview (right column)

- **Header bar**: "Prévisualisation live" label + green status dot + "Télécharger PNG" button
- **Preview area**: displays the `<img>` returned by the API as a blob URL
- **Debounce**: 500 ms after any form field change → POST to `/api/linkedin-image` → update image
- **Loading state**: spinner overlay on preview area while request is in flight
- **Error state**: red message below preview showing `error` field from API response
- **Download**: clicking "Télécharger PNG" triggers a download of the current blob (filename: `linkedin-post.png`)

## Default values

Pre-populate the form with sensible demo values so the preview shows something on first load:

```json
{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Software Engineer @ Acme Corp",
  "timeAgo": "• 2 h",
  "textMarkdown": "Excited to share my **new open-source project** 🚀\n\nBuilt with #NextJS and #TypeScript.\n\n[Check it out on GitHub](https://github.com)",
  "reactions": 247,
  "comments": 38,
  "reposts": 12,
  "platformStyle": "windows",
  "devicePreview": "desktop",
  "typePreview": "more"
}
```

## Data flow

```
form state (React useState)
  → onChange handler → clearTimeout / setTimeout(500ms)
  → fetch POST /api/linkedin-image (JSON body)
  → response.blob() → URL.createObjectURL()
  → <img src={objectUrl} />
```

Revoke previous object URL before creating the next one to avoid memory leaks.

## Error handling

- If `firstName`, `lastName`, or `textMarkdown` are empty: skip the API call, show a soft hint
- If the API returns 4xx/5xx: display the error message from the JSON response
- Network errors: display a generic "Erreur réseau" message

## Styling

- Plain CSS (no Tailwind, no extra library — the project has none)
- Color palette consistent with the project's existing `#EEF2F5` / `#FFFFFF` / `#0A66C2` (LinkedIn blue)
- Responsive: below 900px the split becomes stacked (form on top, preview below)

## Out of scope

- Authentication / API keys
- Saving / history of generated images
- `attachmentsData` (base64 input) — only `attachmentsUrls` exposed for simplicity
- Server-side rendering of the preview
