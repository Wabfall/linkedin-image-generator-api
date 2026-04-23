#!/usr/bin/env bash
# Generates one PNG per feature into test-img/.
# The server must be running: npm run dev
set -euo pipefail

BASE_URL="${API_URL:-http://localhost:3000}/api/linkedin-image"
OUT="$(dirname "$0")/../test-img"
mkdir -p "$OUT"

# Wait up to 30 s for the server to become reachable
echo "Waiting for server at $BASE_URL ..."
for i in $(seq 1 30); do
  if curl -sf "$BASE_URL" > /dev/null 2>&1; then
    echo "Server is up."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: API not reachable at $BASE_URL after 30 s"
    echo "Start the server first: npm run dev"
    exit 1
  fi
  sleep 1
done

post() {
  local name="$1"
  local payload="$2"
  echo "  generating $name.png ..."
  curl -sS -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    --output "$OUT/$name.png"
}

echo "Generating test images into $OUT/"
echo ""

# ── Basic post ────────────────────────────────────────────────────────────────
post "basic-post" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Software Engineer @ Acme Corp",
  "timeAgo": "• 2 h",
  "textMarkdown": "Just shipped a new feature!\n\nProud of what we built together.",
  "reactions": 247,
  "comments": 38,
  "reposts": 12
}'

# ── Markdown: bold & italic ───────────────────────────────────────────────────
post "markdown-bold-italic" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Software Engineer",
  "textMarkdown": "**Bold text** makes key points stand out.\n\n*Italic text* adds softer emphasis.\n\nYou can even mix **bold and *nested italic*** in the same line.",
  "reactions": 89,
  "comments": 14,
  "reposts": 6
}'

# ── Markdown: links ───────────────────────────────────────────────────────────
post "markdown-links" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Software Engineer",
  "textMarkdown": "Links are rendered in LinkedIn blue and are clickable.\n\nCheck out [Next.js](https://nextjs.org) and [Satori](https://github.com/vercel/satori), the two main libraries powering this API.",
  "reactions": 62,
  "comments": 8,
  "reposts": 3
}'

# ── Markdown: hashtags ────────────────────────────────────────────────────────
post "markdown-hashtags" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Software Engineer",
  "textMarkdown": "Hashtags are automatically detected and styled in blue.\n\n#OpenSource #TypeScript #NextJS #API\n\nThey work anywhere in the post, not just at the end.",
  "reactions": 73,
  "comments": 11,
  "reposts": 4
}'

# ── Markdown: all features combined ───────────────────────────────────────────
post "markdown-combined" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Software Engineer",
  "textMarkdown": "**Markdown** is supported natively 🎉\n\n- **Bold** for emphasis\n- *Italic* for nuance\n- [Links](https://example.com) in LinkedIn blue\n- #Hashtags highlighted automatically\n\nAll features work together seamlessly.",
  "reactions": 134,
  "comments": 22,
  "reposts": 9
}'

# ── Emoji rendering ───────────────────────────────────────────────────────────
post "emoji-rendering" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Frontend Developer",
  "textMarkdown": "Emoji rendering is handled via SVG sprites 🎨\n\nFlags: 🇫🇷 🇺🇸 🇯🇵 🇧🇷\nFaces: 😀 🤔 🥳 😎\nObjects: 🚀 💡 🔥 ✅ 📚\nSymbols: ⚡ 🎯 💎 🌟\n\nAll rendered crisp at any resolution.",
  "reactions": 201,
  "comments": 33,
  "reposts": 14
}'

# ── Line breaks ───────────────────────────────────────────────────────────────
post "line-breaks" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Software Engineer",
  "textMarkdown": "Line breaks (\\n) create visual structure.\n\nFirst paragraph.\nSecond line of first paragraph.\nThird line.\n\nNew paragraph after double \\n\\n.\nAnd another line here.\n\nThird paragraph.",
  "reactions": 45,
  "comments": 7,
  "reposts": 2
}'

# ── Platform style: Windows (Segoe UI) ───────────────────────────────────────
post "platform-windows" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Developer",
  "textMarkdown": "Platform style: **Windows**\n\nRendered with Segoe UI — the native Windows font stack.\n\nThis is the default `platformStyle`.",
  "platformStyle": "windows",
  "reactions": 58,
  "comments": 9,
  "reposts": 3
}'

# ── Platform style: macOS (SF Pro Text) ──────────────────────────────────────
post "platform-mac" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Developer",
  "textMarkdown": "Platform style: **macOS**\n\nRendered with SF Pro Text — Apple'\''s native font.\n\nSet `platformStyle` to `\"mac\"` or `\"ios\"` to use this stack.",
  "platformStyle": "mac",
  "reactions": 63,
  "comments": 10,
  "reposts": 4
}'

# ── Platform style: Android (Roboto) ─────────────────────────────────────────
post "platform-android" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Developer",
  "textMarkdown": "Platform style: **Android**\n\nRendered with Roboto — Google'\''s Material Design font.\n\nSet `platformStyle` to `\"android\"` to use this stack.",
  "platformStyle": "android",
  "reactions": 71,
  "comments": 12,
  "reposts": 5
}'

# ── Device preview: mobile (800px) ───────────────────────────────────────────
post "device-mobile" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Product Designer",
  "textMarkdown": "Device preview: **mobile** (800 px wide)\n\nLayout adapts to a narrower column, just like the LinkedIn mobile app.",
  "devicePreview": "mobile",
  "reactions": 54,
  "comments": 9,
  "reposts": 3
}'

# ── Device preview: tablet (1000px) ──────────────────────────────────────────
post "device-tablet" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Product Designer",
  "textMarkdown": "Device preview: **tablet** (1000 px wide)\n\nA comfortable middle ground between mobile and desktop.",
  "devicePreview": "tablet",
  "reactions": 54,
  "comments": 9,
  "reposts": 3
}'

# ── Device preview: desktop (1200px) ─────────────────────────────────────────
post "device-desktop" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Product Designer",
  "textMarkdown": "Device preview: **desktop** (1200 px wide)\n\nThe default output width — widest layout, closest to LinkedIn web.",
  "devicePreview": "desktop",
  "reactions": 54,
  "comments": 9,
  "reposts": 3
}'

# ── Preview mode: more (full text) ───────────────────────────────────────────
post "preview-more" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Content Creator",
  "textMarkdown": "Preview mode: **more** — full text visible.\n\nThis is the second paragraph. It is fully visible because typePreview is set to more.\n\nThird paragraph is also visible.\n\nAnd so is the fourth.",
  "typePreview": "more",
  "reactions": 95,
  "comments": 17,
  "reposts": 5
}'

# ── Preview mode: less (truncated) ───────────────────────────────────────────
post "preview-less" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Content Creator",
  "textMarkdown": "Preview mode: **less** — text truncated to ~3 lines.\n\nThis second paragraph and everything below would be hidden. The post ends with a ...more suffix, just like LinkedIn'\''s native app.\n\nThird paragraph — not visible.\n\nFourth paragraph — not visible either.",
  "typePreview": "less",
  "reactions": 95,
  "comments": 17,
  "reposts": 5
}'

# ── Auto height ───────────────────────────────────────────────────────────────
post "auto-height" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Software Engineer",
  "textMarkdown": "Auto height adjusts to content length.\n\nThe API estimates the required height based on text length, line breaks, emojis, and font size — no need to specify height manually.\n\nThis post has four paragraphs.\n\nAnd the card height will fit them perfectly.",
  "size": { "height": "auto" },
  "reactions": 112,
  "comments": 19,
  "reposts": 7
}'

# ── High reaction counts ──────────────────────────────────────────────────────
post "reactions-counts" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Viral Content Creator",
  "textMarkdown": "This post went viral 🔥\n\nReaction, comment, and repost counters are fully customizable.",
  "reactions": 12847,
  "comments": 2341,
  "reposts": 987
}'

# ── Custom dark theme ─────────────────────────────────────────────────────────
post "custom-theme-dark" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Software Engineer",
  "textMarkdown": "Custom dark theme 🌙\n\nAll five color tokens are customizable:\n`background`, `card`, `text`, `subtext`, `divider`.",
  "theme": {
    "background": "#1A1A2E",
    "card": "#16213E",
    "text": "#E0E0E0",
    "subtext": "#9E9E9E",
    "divider": "#2A2A4A"
  },
  "reactions": 178,
  "comments": 29,
  "reposts": 11
}'

# ── Avatar: remote URL ────────────────────────────────────────────────────────
post "avatar-remote-url" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Software Engineer",
  "textMarkdown": "Profile picture loaded from a remote URL.\n\nThe API fetches the image and embeds it as a base64 data URL — no external requests from the SVG renderer.",
  "profileImageUrl": "https://picsum.photos/seed/avatar/200/200",
  "reactions": 67,
  "comments": 11,
  "reposts": 4
}'

# ── Avatar: inline SVG ────────────────────────────────────────────────────────
post "avatar-inline-svg" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Software Engineer",
  "textMarkdown": "Profile picture as inline SVG markup.\n\nPass raw SVG XML via `profileSvgMarkup` — useful for custom initials avatars or icon-based profiles.",
  "profileSvgMarkup": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"64\" height=\"64\" viewBox=\"0 0 64 64\"><circle cx=\"32\" cy=\"32\" r=\"32\" fill=\"#6366F1\"/><text x=\"50%\" y=\"52%\" dominant-baseline=\"middle\" text-anchor=\"middle\" font-family=\"Inter,Arial\" font-size=\"26\" fill=\"#ffffff\" font-weight=\"bold\">AM</text></svg>",
  "reactions": 43,
  "comments": 6,
  "reposts": 2
}'

# ── Avatar: default fallback ──────────────────────────────────────────────────
post "avatar-default" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Software Engineer",
  "textMarkdown": "No profile picture provided — the default avatar SVG is used as a fallback.\n\nOmit all three `profileImage*` fields to trigger this behavior.",
  "reactions": 31,
  "comments": 5,
  "reposts": 1
}'

# ── Attachments: 1 image ──────────────────────────────────────────────────────
post "attachments-1-image" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Product Designer",
  "textMarkdown": "1 image attachment → full width.",
  "size": { "height": "auto" },
  "attachmentsUrls": [
    "https://picsum.photos/seed/one/1200/800"
  ],
  "reactions": 134,
  "comments": 22,
  "reposts": 8
}'

# ── Attachments: 2 images ─────────────────────────────────────────────────────
post "attachments-2-images" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Product Designer",
  "textMarkdown": "2 image attachments → 50 / 50 side-by-side split.",
  "size": { "height": "auto" },
  "attachmentsUrls": [
    "https://picsum.photos/seed/one/1200/800",
    "https://picsum.photos/seed/two/1200/800"
  ],
  "reactions": 156,
  "comments": 25,
  "reposts": 10
}'

# ── Attachments: 3 images ─────────────────────────────────────────────────────
post "attachments-3-images" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Product Designer",
  "textMarkdown": "3 image attachments → 1 large left + 2 stacked right.",
  "size": { "height": "auto" },
  "attachmentsUrls": [
    "https://picsum.photos/seed/one/1200/800",
    "https://picsum.photos/seed/two/1200/800",
    "https://picsum.photos/seed/three/1200/800"
  ],
  "reactions": 189,
  "comments": 31,
  "reposts": 13
}'

# ── Attachments: 4+ images (overflow badge) ───────────────────────────────────
post "attachments-4-plus-images" '{
  "firstName": "Alex",
  "lastName": "Martin",
  "headline": "Product Designer",
  "textMarkdown": "5 image attachments → 2×2 grid with a +1 overflow badge on the last slot.",
  "size": { "height": "auto" },
  "attachmentsUrls": [
    "https://picsum.photos/seed/one/1200/800",
    "https://picsum.photos/seed/two/1200/800",
    "https://picsum.photos/seed/three/1200/800",
    "https://picsum.photos/seed/four/1200/800",
    "https://picsum.photos/seed/five/1200/800"
  ],
  "reactions": 310,
  "comments": 47,
  "reposts": 19
}'

echo ""
echo "Done. $(ls "$OUT"/*.png 2>/dev/null | wc -l) images saved to $OUT/"
