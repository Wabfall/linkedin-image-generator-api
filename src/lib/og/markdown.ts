// src/lib/og/markdown.ts
import fs from 'fs'
import path from 'path'

// --- Inline Markdown parsing: **bold**, *italic*, [text](url)
export function parseInlineMarkdown(input: string) {
    const nodes: any[] = []
    const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)]+)\))/g
    let lastIndex = 0
    let m: RegExpExecArray | null

    while ((m = regex.exec(input)) !== null) {
        if (m.index > lastIndex) nodes.push(input.slice(lastIndex, m.index))
        if (m[1]) nodes.push({ type: 'b', children: m[2] })
        else if (m[3]) nodes.push({ type: 'i', children: m[4] })
        else if (m[5]) nodes.push({ type: 'a', href: m[7], children: m[6] })
        lastIndex = regex.lastIndex
    }
    if (lastIndex < input.length) nodes.push(input.slice(lastIndex))
    return nodes
}

export const splitParagraphs = (t: string) =>
    t.replace(/\r\n/g, '\n').split(/\n\n+/).map(s => s.trim()).filter(Boolean)

// -------------------- Emoji helpers (local → data URL) --------------------

export type PlatformStyle = 'windows' | 'mac' | 'ios' | 'android'

function splitTextIntoEmojiRuns(text: string): Array<{ type: 'text' | 'emoji'; value: string }> {
    const regex = /\p{Extended_Pictographic}/u
    const runs: Array<{ type: 'text' | 'emoji'; value: string }> = []
    let i = 0
    while (i < text.length) {
        const cp = text.codePointAt(i)!
        const ch = String.fromCodePoint(cp)
        if (regex.test(ch)) {
            runs.push({ type: 'emoji', value: ch })
            i += ch.length
        } else {
            let j = i + ch.length
            while (j < text.length) {
                const cp2 = text.codePointAt(j)!
                const ch2 = String.fromCodePoint(cp2)
                if (regex.test(ch2)) break
                j += ch2.length
            }
            runs.push({ type: 'text', value: text.slice(i, j) })
            i = j
        }
    }
    return runs
}

function emojiToHexSequence(emoji: string): string {
    const cps: number[] = []
    for (let i = 0; i < emoji.length;) {
        const cp = emoji.codePointAt(i)!
        cps.push(cp)
        i += cp > 0xffff ? 2 : 1
    }
    return cps.map(cp => cp.toString(16)).join('-').toLowerCase()
}

function emojiToNotoFilename(emoji: string): string {
    const cps: number[] = []
    for (let i = 0; i < emoji.length;) {
        const cp = emoji.codePointAt(i)!
        cps.push(cp)
        i += cp > 0xffff ? 2 : 1
    }
    return `emoji_u${cps.map(cp => cp.toString(16)).join('_').toLowerCase()}.svg`
}

function fileToDataUrl(absPath: string, mime = 'image/svg+xml'): string | null {
    try {
        const buf = fs.readFileSync(absPath)
        const b64 = Buffer.from(buf).toString('base64')
        return `data:${mime};base64,${b64}`
    } catch {
        return null
    }
}

/** Renvoie une data URL locale pour l’emoji selon platformStyle ; fallback Twemoji puis Noto. */
function emojiDataUrlLocal(emoji: string, platformStyle: PlatformStyle): string | null {
    const base = path.join(process.cwd(), 'public', 'emoji')
    const hex = emojiToHexSequence(emoji)
    const notoName = emojiToNotoFilename(emoji)

    // Ordre de préférence par plateforme
    const candidates =
        platformStyle === 'android'
            ? [
                path.join(base, 'noto', notoName),
                path.join(base, 'twemoji', `${hex}.svg`),
            ]
            : [
                path.join(base, 'twemoji', `${hex}.svg`),
                path.join(base, 'noto', notoName),
            ]

    for (const abs of candidates) {
        const d = fileToDataUrl(abs, 'image/svg+xml')
        if (d) return d
    }
    return null
}

// --- Options de rendu pour les paragraphes
export type ParagraphRenderOptions = {
    color?: string
    fontFamily?: string
    fontSize?: number
    lineHeight?: number | string
    paragraphSpacing?: number
    maxWidth?: number

    platformStyle?: PlatformStyle
    emojiSizePx?: number
    emojiVAlign?: number
}

/**
 * Rend une liste de paragraphes (texte brut avec mini-markdown inline)
 * - Police par défaut: 'inherit' (hérite de la font du conteneur via platformStyle)
 * - Émojis locaux en data URL (twemoji/noto) → zéro I/O au rendu
 */
export function paragraphsWithWrap(
    paragraphs: string[],
    colorOrOpts?: string | ParagraphRenderOptions
): any[] {
    const opts: ParagraphRenderOptions =
        typeof colorOrOpts === 'string'
            ? { color: colorOrOpts }
            : (colorOrOpts || {})

    const {
        color = '#111',
        fontFamily = 'inherit',
        fontSize = 20,
        lineHeight = 1.3,
        paragraphSpacing = 16,
        maxWidth,
        platformStyle = 'windows',
        emojiSizePx = Math.round(fontSize * 1.05),
        emojiVAlign = -2,
    } = opts

    return paragraphs.map((p, idx) => {
        const inlineChildren: any[] = []

        for (const node of parseInlineMarkdown(p)) {
            if (typeof node === 'string') {
                const runs = splitTextIntoEmojiRuns(node)
                for (let k = 0; k < runs.length; k++) {
                    const r = runs[k]
                    if (r.type === 'text') {
                        inlineChildren.push(r.value)
                    } else {
                        const srcDataUrl = emojiDataUrlLocal(r.value, platformStyle)
                        if (srcDataUrl) {
                            inlineChildren.push({
                                type: 'img',
                                key: `e-${idx}-${inlineChildren.length}`,
                                props: {
                                    src: srcDataUrl,
                                    width: emojiSizePx,
                                    height: emojiSizePx,
                                    style: {
                                        display: 'block', // ✅ Satori-friendly
                                        verticalAlign: `${emojiVAlign}px`,
                                    },
                                },
                            })
                        } else {
                            // Fallback ultime : on garde le caractère si aucun asset local trouvé
                            inlineChildren.push(r.value)
                        }
                    }
                }
                continue
            }

            if (node.type === 'b') {
                inlineChildren.push({
                    type: 'b',
                    key: `b-${idx}-${inlineChildren.length}`,
                    props: { style: { fontWeight: 700 }, children: node.children },
                })
                continue
            }

            if (node.type === 'i') {
                inlineChildren.push({
                    type: 'i',
                    key: `i-${idx}-${inlineChildren.length}`,
                    props: { style: { fontStyle: 'italic' }, children: node.children },
                })
                continue
            }

            if (node.type === 'a') {
                inlineChildren.push({
                    type: 'span',
                    key: `a-${idx}-${inlineChildren.length}`,
                    props: {
                        style: { textDecoration: 'underline' },
                        children: `${node.children} (${node.href})`,
                    },
                })
                continue
            }
        }

        return {
            type: 'div',
            key: `p-${idx}`,
            props: {
                style: {
                    marginTop: idx === 0 ? 0 : paragraphSpacing,
                    display: 'flex',
                    flexDirection: 'column',
                },
                children: {
                    type: 'div',
                    props: {
                        style: {
                            display: 'flex',
                            color,
                            fontFamily,
                            fontSize,
                            lineHeight,
                            whiteSpace: 'pre-wrap',
                            ...(maxWidth ? { maxWidth } : {}),
                        },
                        children: {
                            type: 'span',
                            props: { children: inlineChildren as any },
                        },
                    },
                },
            },
        }
    })
}
