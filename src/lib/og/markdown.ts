// src/lib/og/markdown.ts
export function parseInlineMarkdown(input: string) {
    // **bold**, *italic*, [text](url)
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

export function paragraphsWithWrap(paragraphs: string[], color: string): any[] {
    return paragraphs.map((p, idx) => ({
        type: 'div',
        key: `p-${idx}`,
        props: {
            style: { marginTop: idx === 0 ? 0 : 24, display: 'flex', flexDirection: 'column' },
            children: [{
                type: 'div',
                props: {
                    style: { fontSize: 18, lineHeight: 1.42857, color, whiteSpace: 'pre-wrap', display: 'flex' },
                    children: {
                        type: 'span',
                        props: {
                            children: parseInlineMarkdown(p).map((node: any, i: number) => {
                                if (typeof node === 'string') return node
                                if (node.type === 'b') return { type: 'b', key: i, props: { style: { fontWeight: 700 }, children: node.children } }
                                if (node.type === 'i') return { type: 'i', key: i, props: { style: { fontStyle: 'italic' }, children: node.children } }
                                if (node.type === 'a') return { type: 'span', key: i, props: { style: { textDecoration: 'underline' }, children: `${node.children} (${node.href})` } }
                                return null
                            }).filter(Boolean) as any
                        }
                    }
                }
            }],
        },
    }))
}
