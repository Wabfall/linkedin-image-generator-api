// src/app/api/linkedin-image/route.ts
import { NextRequest, NextResponse } from 'next/server'
import satori, { SatoriOptions } from 'satori'
import fs from 'fs'
import path from 'path'
import type { ReactNode } from 'react'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Payload = {
    profileImageUrl?: string
    firstName: string
    lastName: string
    headline?: string
    timeAgo?: string
    textMarkdown: string
    reactions?: number
    comments?: number
    theme?: {
        background?: string
        card?: string
        text?: string
        subtext?: string
        divider?: string
    }
    size?: { width: number; height: number }
}

let interRegular: ArrayBuffer | null = null
let interBold: ArrayBuffer | null = null

function ensureFontsLocalOnly() {
    if (interRegular && interBold) return
    const base = path.join(process.cwd(), 'public', 'fonts')
    const reg = path.join(base, 'Inter-Regular.ttf')
    const bold = path.join(base, 'Inter-Bold.ttf')

    const miss: string[] = []
    try {
        if (fs.existsSync(reg)) interRegular = fs.readFileSync(reg).buffer
        else miss.push('Inter-Regular.ttf')
    } catch { miss.push('Inter-Regular.ttf') }
    try {
        if (fs.existsSync(bold)) interBold = fs.readFileSync(bold).buffer
        else miss.push('Inter-Bold.ttf')
    } catch { miss.push('Inter-Bold.ttf') }

    if (!interRegular && !interBold) {
        const hint = `Placez les fichiers dans ${path.relative(process.cwd(), base)}`
        throw new Error(`Fonts not found: ${miss.join(', ')}. ${hint}`)
    }
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n))
}

// Markdown inline minimal: **bold**, *italic*, [text](url)
function parseInlineMarkdown(input: string) {
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
const splitParagraphs = (t: string) =>
    t.replace(/\r\n/g, '\n').split(/\n\n+/).map(s => s.trim()).filter(Boolean)

async function imageToDataUrl(url: string): Promise<string | null> {
    try {
        const r = await fetch(url)
        const buf = await r.arrayBuffer()
        const base64 = Buffer.from(buf).toString('base64')
        const mime = r.headers.get('content-type') || 'image/png'
        return `data:${mime};base64,${base64}`
    } catch {
        return null
    }
}

// Healthcheck
export async function GET() {
    return NextResponse.json({ ok: true, message: 'POST an object to get a PNG back.' })
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as Payload
        const {
            profileImageUrl,
            firstName,
            lastName,
            headline = '',
            timeAgo = '• 1 h',
            textMarkdown,
            reactions = 0,
            comments = 0,
            theme = {},
            size = { width: 1200, height: 1350 },
        } = body || {}

        if (!firstName || !lastName || !textMarkdown) {
            return NextResponse.json(
                { error: 'Missing required fields: firstName, lastName, textMarkdown' },
                { status: 400 }
            )
        }

        ensureFontsLocalOnly()

        const W = clamp(Number(size.width) || 1200, 600, 2000)
        const H = clamp(Number(size.height) || 1350, 800, 2200)

        const palette = {
            background: theme.background || '#EEF2F5',
            card: theme.card || '#FFFFFF',
            text: theme.text || '#111111',
            subtext: theme.subtext || '#5E6A75',
            divider: theme.divider || '#E5E7EB',
        }

        const profileDataUrl = profileImageUrl ? await imageToDataUrl(profileImageUrl) : null

        const fonts: SatoriOptions['fonts'] = []
        if (interRegular) fonts.push({ name: 'Inter', data: interRegular, weight: 400, style: 'normal' })
        if (interBold) fonts.push({ name: 'Inter', data: interBold, weight: 700, style: 'normal' })
        if (!fonts.length) {
            return NextResponse.json(
                { error: 'Fonts missing. Put Inter-Regular.ttf and Inter-Bold.ttf in /public/fonts' },
                { status: 500 }
            )
        }

        const options: SatoriOptions = { width: W, height: H, fonts }

        // --- Corps de texte : containers flex + wrap inline dans un <span> unique
        const bodyNodes = paragraphsWithWrap(splitParagraphs(textMarkdown), palette)

        const ReactionIcon = ({ bg }: { bg: string }) => ({
            type: 'div',
            props: {
                style: {
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: -6,
                    border: '3px solid #fff',
                },
            },
        })

        const satoriInput = ({
            type: 'div',
            props: {
                style: {
                    width: W, height: H, backgroundColor: palette.background,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
                },
                children: {
                    type: 'div',
                    props: {
                        style: {
                            width: Math.min(920, W - 160),
                            backgroundColor: palette.card,
                            borderRadius: 16,
                            boxShadow: '0 8px 28px rgba(0,0,0,0.06)',
                            padding: 28,
                            display: 'flex', flexDirection: 'column',
                        },
                        children: [
                            // Header
                            {
                                type: 'div',
                                props: {
                                    style: { display: 'flex', alignItems: 'center' },
                                    children: [
                                        profileDataUrl ? {
                                            type: 'img',
                                            props: {
                                                src: profileDataUrl, width: 64, height: 64,
                                                style: { borderRadius: 32, objectFit: 'cover', border: '1px solid #E5E7EB' }
                                            }
                                        } : {
                                            type: 'div',
                                            props: {
                                                style: {
                                                    width: 64, height: 64, borderRadius: 32, backgroundColor: '#D1D5DB',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#374151', fontWeight: 700
                                                },
                                                children: `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
                                            }
                                        },
                                        {
                                            type: 'div',
                                            props: {
                                                style: { marginLeft: 14, display: 'flex', flexDirection: 'column' },
                                                children: [
                                                    { type: 'div', props: { style: { fontSize: 28, fontWeight: 700, color: palette.text }, children: `${firstName} ${lastName}` } },
                                                    { type: 'div', props: { style: { fontSize: 22, color: palette.subtext, marginTop: 2 }, children: headline } },
                                                    { type: 'div', props: { style: { fontSize: 18, color: palette.subtext, marginTop: 2 }, children: timeAgo.startsWith('•') ? timeAgo : `• ${timeAgo}` } },
                                                ]
                                            }
                                        }
                                    ]
                                }
                            },

                            // Spacer
                            { type: 'div', props: { style: { height: 16 } } },

                            // Body
                            {
                                type: 'div',
                                props: {
                                    style: { display: 'flex', flexDirection: 'column' },
                                    children: bodyNodes,
                                }
                            },

                            // Spacer + Divider
                            { type: 'div', props: { style: { height: 20 } } },
                            { type: 'div', props: { style: { height: 1, backgroundColor: palette.divider } } },
                            { type: 'div', props: { style: { height: 16 } } },

                            // Footer réactions/commentaires
                            {
                                type: 'div',
                                props: {
                                    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
                                    children: [
                                        {
                                            type: 'div',
                                            props: {
                                                style: { display: 'flex', alignItems: 'center' },
                                                children: [
                                                    ReactionIcon({ bg: '#0A66C2' }),
                                                    ReactionIcon({ bg: '#F5982C' }),
                                                    ReactionIcon({ bg: '#F03A5F' }),
                                                    { type: 'div', props: { style: { marginLeft: 8, fontSize: 20, color: palette.subtext }, children: `${reactions.toLocaleString()} réactions` } }
                                                ]
                                            }
                                        },
                                        { type: 'div', props: { style: { fontSize: 20, color: palette.subtext }, children: `${comments.toLocaleString()} commentaires` } }
                                    ]
                                }
                            }
                        ]
                    }
                }
            }
        }) as unknown as ReactNode

        const svg = await satori(satoriInput, options)

        // ⬇️ Import NATIF dynamique (pas de WASM ici)
        const { Resvg } = await import('@resvg/resvg-js')
        const resvg = new Resvg(svg as string, { fitTo: { mode: 'width', value: W } })
        const pngData = resvg.render().asPng()

        return new NextResponse(Buffer.from(pngData), {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    } catch (err: any) {
        console.error('[linkedin-image] ERROR:', err)
        return NextResponse.json(
            { error: 'Internal error while generating image', detail: (err && err.message) || String(err) },
            { status: 500 }
        )
    }
}

/** Construit les paragraphes avec enveloppe <span> unique pour le inline */
function paragraphsWithWrap(paragraphs: string[], palette: any): any[] {
    return paragraphs.map((p, idx) => ({
        type: 'div',
        key: `p-${idx}`,
        props: {
            style: { marginTop: idx === 0 ? 0 : 24, display: 'flex', flexDirection: 'column' },
            children: [{
                type: 'div',
                props: {
                    style: { fontSize: 42, lineHeight: 1.35, color: palette.text, whiteSpace: 'pre-wrap', display: 'flex' },
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
