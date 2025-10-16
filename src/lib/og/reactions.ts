// src/lib/og/reactions.ts
import fs from 'fs'
import path from 'path'

export function publicSvgToDataUrl(relPath: string): string | null {
    const abs = path.join(process.cwd(), 'public', relPath)
    if (!fs.existsSync(abs)) return null
    try {
        const svg = fs.readFileSync(abs, 'utf8')
        const base64 = Buffer.from(svg).toString('base64')
        return `data:image/svg+xml;base64,${base64}`
    } catch {
        return null
    }
}

export function loadReactiveIcons(): string[] {
    // expects public/icons/reactive/{like.svg,celebrate.svg,love.svg}
    return [
        publicSvgToDataUrl('icons/reactive/like.svg'),
        publicSvgToDataUrl('icons/reactive/celebrate.svg'),
        publicSvgToDataUrl('icons/reactive/love.svg'),
    ].filter(Boolean) as string[]
}

export function ReactionBadge(src: string, i: number) {
    return {
        type: 'img',
        props: {
            src,
            width: 28,
            height: 28,
            style: {
                display: 'block',
                borderRadius: 14,
                objectFit: 'cover',
                marginLeft: i === 0 ? 0 : -6,
                border: '3px solid #fff',
            },
        },
    }
}
