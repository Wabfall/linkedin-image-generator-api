// src/lib/og/markdown.ts

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

// --- Options de rendu pour les paragraphes
export type ParagraphRenderOptions = {
    color?: string
    fontFamily?: string        // 'inherit' par défaut → respecte platformStyle
    fontSize?: number          // 20 par défaut
    lineHeight?: number | string // 1.3 par défaut
    paragraphSpacing?: number  // 16 par défaut
    maxWidth?: number          // optionnel
}

/**
 * Rend une liste de paragraphes (texte brut avec mini-markdown inline)
 * - Par défaut, la font est 'inherit' pour épouser la font du conteneur (platformStyle).
 * - Possibilité d'injecter une stack via options.fontFamily.
 *
 * Usage:
 * paragraphsWithWrap(paragraphs, '#111')                // rétro-compat couleur seule
 * paragraphsWithWrap(paragraphs, { color, fontFamily }) // options étendues
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
        fontFamily = opts.fontFamily,  // ← clé: on n’impose pas Inter
        fontSize = opts.fontSize,
        lineHeight = opts.lineHeight,
        paragraphSpacing = 16,
        maxWidth,
    } = opts

    return paragraphs.map((p, idx) => ({
        type: 'div',
        key: `p-${idx}`,
        props: {
            // conteneur paragraphe : un seul enfant => pas d'exigence Satori spéciale
            style: {
                marginTop: idx === 0 ? 0 : paragraphSpacing,
                display: 'flex',         // sûr pour Satori
                flexDirection: 'column',
            },
            children: {
                // bloc de texte (un seul enfant)
                type: 'div',
                props: {
                    style: {
                        display: 'flex',     // explicite si jamais Satori durcit la règle
                        color,
                        fontFamily,
                        fontSize,
                        lineHeight,
                        whiteSpace: 'pre-wrap',
                        ...(maxWidth ? { maxWidth } : {}),
                    },
                    children: {
                        type: 'span',
                        props: {
                            children: parseInlineMarkdown(p).map((node: any, i: number) => {
                                if (typeof node === 'string') return node
                                if (node.type === 'b') {
                                    return {
                                        type: 'b',
                                        key: i,
                                        props: { style: { fontWeight: 700 }, children: node.children },
                                    }
                                }
                                if (node.type === 'i') {
                                    return {
                                        type: 'i',
                                        key: i,
                                        props: { style: { fontStyle: 'italic' }, children: node.children },
                                    }
                                }
                                if (node.type === 'a') {
                                    // Pas de lien cliquable en image: on affiche "texte (url)"
                                    return {
                                        type: 'span',
                                        key: i,
                                        props: {
                                            style: { textDecoration: 'underline' },
                                            children: `${node.children} (${node.href})`,
                                        },
                                    }
                                }
                                return null
                            }).filter(Boolean) as any,
                        },
                    },
                },
            },
        },
    }))
}
