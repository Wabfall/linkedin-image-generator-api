import fs from 'fs'
import path from 'path'
import type { SatoriOptions } from 'satori'

type Loaded = Record<string, { weight: SatoriOptions['fonts'][number]['weight']; data: ArrayBuffer }[]>

let loaded: Loaded | null = null

function toAB(buf: Buffer): ArrayBuffer {
    const ab = new ArrayBuffer(buf.length)
    new Uint8Array(ab).set(buf)
    return ab
}

/** Essaie plusieurs noms de fichiers (ttf/otf) dans un sous-dossier de famille, renvoie le 1er trouvé. */
function readFromFamilyDir(
    base: string,
    familyDir: string,
    filenameCandidates: string[],
): ArrayBuffer | null {
    const dir = path.join(base, familyDir)
    for (const name of filenameCandidates) {
        const p = path.join(dir, name)
        try {
            if (fs.existsSync(p)) {
                return toAB(fs.readFileSync(p))
            }
        } catch {
            // ignore and continue
        }
    }
    return null
}

/** Ajoute une variante (si trouvée) dans la famille donnée avec un poids donné. */
function addVariantIfFound(
    out: Loaded,
    family: string,
    data: ArrayBuffer | null,
    weight: number | string,
) {
    if (!data) return
    if (!out[family]) out[family] = []
    const w = weight as unknown as SatoriOptions['fonts'][number]['weight']
    out[family].push({ weight: w, data })
}

/**
 * Charge toutes les polices depuis /public/fonts/<famille>/FICHIER.ttf|otf
 * Supporte plusieurs fichiers candidats pour chaque variante.
 */
export function ensureFontsLocalOnly() {
    if (loaded) return

    const base = path.join(process.cwd(), 'public', 'fonts')
    const out: Loaded = {}

    // --- Windows-like : Segoe UI
    addVariantIfFound(out, 'Segoe UI',
        readFromFamilyDir(base, 'Segoe UI', ['SegoeUI.ttf', 'SegoeUI-Regular.ttf', 'Regular.ttf']), 400)
    addVariantIfFound(out, 'Segoe UI',
        readFromFamilyDir(base, 'Segoe UI', ['SegoeUI-Semibold.ttf', 'Semibold.ttf', 'SemiBold.ttf']), 600)
    addVariantIfFound(out, 'Segoe UI',
        readFromFamilyDir(base, 'Segoe UI', ['SegoeUI-Bold.ttf', 'Bold.ttf']), 700)

    // --- mac / iOS-like : SF Pro Text
    addVariantIfFound(out, 'SF Pro Text',
        readFromFamilyDir(base, 'SF Pro Text', ['SFProText-Regular.otf', 'SFProText-Regular.ttf', 'Regular.otf', 'Regular.ttf']), 400)
    addVariantIfFound(out, 'SF Pro Text',
        readFromFamilyDir(base, 'SF Pro Text', ['SFProText-Semibold.otf', 'SFProText-Semibold.ttf', 'Semibold.otf', 'Semibold.ttf', 'SemiBold.otf', 'SemiBold.ttf']), 600)
    addVariantIfFound(out, 'SF Pro Text',
        readFromFamilyDir(base, 'SF Pro Text', ['SFProText-Bold.otf', 'SFProText-Bold.ttf', 'Bold.otf', 'Bold.ttf']), 700)

    // --- Android-like : Roboto
    addVariantIfFound(out, 'Roboto',
        readFromFamilyDir(base, 'Roboto', ['Roboto-Regular.ttf', 'Regular.ttf']), 400)
    addVariantIfFound(out, 'Roboto',
        readFromFamilyDir(base, 'Roboto', ['Roboto-Medium.ttf', 'Medium.ttf', '500.ttf']), 500)
    addVariantIfFound(out, 'Roboto',
        readFromFamilyDir(base, 'Roboto', ['Roboto-Bold.ttf', 'Bold.ttf']), 700)

    // --- Inter (fallback universel)
    addVariantIfFound(out, 'Inter',
        readFromFamilyDir(base, 'Inter', ['Inter-Regular.ttf', 'Regular.ttf']), 400)
    addVariantIfFound(out, 'Inter',
        readFromFamilyDir(base, 'Inter', ['Inter-Semibold.ttf', 'Semibold.ttf', 'SemiBold.ttf']), 600)
    addVariantIfFound(out, 'Inter',
        readFromFamilyDir(base, 'Inter', ['Inter-Bold.ttf', 'Bold.ttf']), 700)

    // --- Emoji sets
    addVariantIfFound(out, 'Noto',
        readFromFamilyDir(base, 'Noto', ['NotoEmoji-Regular.ttf', 'NotoColorEmoji.ttf']), 400)

    // Symboles étendus
    addVariantIfFound(out, 'Noto',
        readFromFamilyDir(base, 'Noto Sans Symbols 2', ['NotoSansSymbols2-Regular.ttf', 'Regular.ttf']), 400)

    // Au moins une famille nécessaire
    if (Object.keys(out).length === 0) {
        throw new Error(
            `No local fonts found in ${path.relative(process.cwd(), base)}.
Expected structure: <fonts>/<Family>/<File.ttf>. Place at least Inter/Inter-Regular.ttf.`
        )
    }

    loaded = out

    const summary = Object.entries(loaded)
        .map(([fam, arr]) => `${fam} [${arr.map(a => a.weight).sort().join(', ')}]`)
        .join(' | ')
    console.log('[fonts] Local loaded (by family folders):', summary)
}

/** Retourne les polices au format Satori */
export function getSatoriFonts(): SatoriOptions['fonts'] {
    if (!loaded) throw new Error('ensureFontsLocalOnly() must be called first')
    const fonts: SatoriOptions['fonts'] = []
    for (const [family, variants] of Object.entries(loaded)) {
        for (const v of variants) {
            fonts.push({
                name: family,
                data: v.data,
                weight: v.weight,
                style: 'normal',
            })
        }
    }
    return fonts
}

/** Indique si une famille est dispo localement. */
export function hasFamily(name: string): boolean {
    return Boolean(loaded && loaded[name])
}
