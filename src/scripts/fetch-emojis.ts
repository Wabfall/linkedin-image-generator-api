// scripts/fetch-emojis.ts
import fs from 'node:fs'
import path from 'node:path'
import fetch from 'node-fetch'
import emojiRegex from 'emoji-regex'

type Style = 'twemoji' | 'noto' | 'fluent'

/** Convertit un émoji (potentiellement séquence) -> '1f44b' ou '1f469-1f3fb' */
function emojiToHexSequence(emoji: string): string {
    const cps: number[] = []
    for (let i = 0; i < emoji.length;) {
        const cp = emoji.codePointAt(i)!
        cps.push(cp)
        i += cp > 0xffff ? 2 : 1
    }
    return cps.map((cp) => cp.toString(16)).join('-').toLowerCase()
}

/** Pour Noto : 'emoji_u1f44b.svg' ou 'emoji_u1f469_1f3fb.svg' */
function emojiToNotoFilename(emoji: string): string {
    const cps: number[] = []
    for (let i = 0; i < emoji.length;) {
        const cp = emoji.codePointAt(i)!
        cps.push(cp)
        i += cp > 0xffff ? 2 : 1
    }
    const parts = cps.map((cp) => cp.toString(16).toLowerCase())
    return `emoji_u${parts.join('_')}.svg`
}

/** Récupère tous les émojis uniques d’un texte */
function extractUniqueEmojis(text: string): string[] {
    const re = emojiRegex()
    const set = new Set<string>()
    for (const match of text.matchAll(re)) {
        if (match[0]) set.add(match[0])
    }
    return Array.from(set)
}

/** Télécharge un fichier si absent (ou force si overwrite=true) */
async function downloadIfNeeded(url: string, dest: string, overwrite = false) {
    await fs.promises.mkdir(path.dirname(dest), { recursive: true })
    if (!overwrite && fs.existsSync(dest)) return

    const res = await fetch(url)
    if (!res.ok) throw new Error(`GET ${url} → ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    await fs.promises.writeFile(dest, buf)
}

/** Construit les URLs CDN (versions “figées” pour stabilité) */
function buildTwemojiUrl(hexSeq: string) {
    // twemoji 14.0.2
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${hexSeq}.svg`
}
function buildNotoUrl(notoFilename: string) {
    // noto-emoji v2.042
    return `https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@v2.042/svg/${notoFilename}`
}

/**
 * FLUENT (optionnel) :
 * Le repo Fluent indexe par nom (en anglais), pas par codepoints.
 * On utilise un mapping minimal codepoints→nom. À étendre selon besoin.
 */
const FLUENT_MAP: Record<string, string> = {
    // Exemples (à compléter selon tes besoins) :
    // '1f44b': 'Waving Hand',
    // '1f60a': 'Smiling Face With Smiling Eyes',
}
function buildFluentUrl(hexSeq: string) {
    const name = FLUENT_MAP[hexSeq]
    if (!name) return null
    // Flat SVG
    return `https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@latest/assets/${encodeURIComponent(
        name
    )}/Flat/flat.svg`
}

/** Télécharge les 3 styles dans public/emoji */
async function fetchEmojisForStyles(emojis: string[], outDir = 'public/emoji') {
    const twOut = path.join(outDir, 'twemoji')
    const noOut = path.join(outDir, 'noto')
    const flOut = path.join(outDir, 'fluent')

    let ok = 0, ko = 0

    for (const e of emojis) {
        const hexSeq = emojiToHexSequence(e)
        const twUrl = buildTwemojiUrl(hexSeq)
        const twDest = path.join(twOut, `${hexSeq}.svg`)

        const noFile = emojiToNotoFilename(e)
        const noUrl = buildNotoUrl(noFile)
        const noDest = path.join(noOut, noFile)

        const flUrl = buildFluentUrl(hexSeq)
        const flDest = flUrl ? path.join(flOut, `${hexSeq}.svg`) : null

        try {
            await downloadIfNeeded(twUrl, twDest)
            ok++
        } catch (err) {
            console.warn(`[twemoji] miss ${hexSeq}: ${(err as Error).message}`)
            ko++
        }

        try {
            await downloadIfNeeded(noUrl, noDest)
            ok++
        } catch (err) {
            console.warn(`[noto] miss ${noFile}: ${(err as Error).message}`)
            ko++
        }

        if (flUrl && flDest) {
            try {
                await downloadIfNeeded(flUrl, flDest)
                ok++
            } catch (err) {
                console.warn(`[fluent] miss ${hexSeq}: ${(err as Error).message}`)
                ko++
            }
        }
    }

    console.log(`Done. Downloaded OK=${ok}, MISS=${ko}`)
}

/** CLI simple :
 *  - soit tu passes un fichier texte à scanner,
 *  - soit tu passes directement une liste d’émojis.
 *
 * ex:
 *  ts-node scripts/fetch-emojis.ts "🚀🔥🙂"
 *  ts-node scripts/fetch-emojis.ts ./data/post.txt
 */
async function main() {
    const arg = process.argv[2]
    if (!arg) {
        console.error('Usage: ts-node scripts/fetch-emojis.ts <emoji-string | path-to-text>')
        process.exit(1)
    }

    let text: string
    if (fs.existsSync(arg) && fs.statSync(arg).isFile()) {
        text = await fs.promises.readFile(arg, 'utf8')
    } else {
        text = arg
    }

    const emojis = extractUniqueEmojis(text)
    if (emojis.length === 0) {
        console.log('No emojis found.')
        return
    }

    console.log(`Found ${emojis.length} unique emoji(s): ${emojis.join(' ')}`)
    await fetchEmojisForStyles(emojis, 'public/emoji')

    // Manifest utile
    const manifestPath = path.join('public/emoji', 'manifest.json')
    const manifest = {
        count: emojis.length,
        emojis,
        generatedAt: new Date().toISOString(),
    }
    await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
    console.log(`Wrote ${manifestPath}`)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
