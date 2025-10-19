// src/app/api/linkedin-image/route.ts
import { NextRequest, NextResponse } from 'next/server'
import satori, { type SatoriOptions } from 'satori'
import type { ReactNode } from 'react'
import { buildPalette, clamp } from '@/lib/og/theme'
import { buildSatoriInput } from '@/lib/og/post'
import { publicSvgToDataUrl } from '@/lib/og/reactions'
import { ensureFontsLocalOnly, getSatoriFonts } from '@/lib/og/fonts'

// types
type PlatformStyle = 'windows' | 'mac' | 'ios' | 'android'
type Payload = {
    profileImageUrl?: string
    profileSvgMarkup?: unknown           // 👈 unknown pour éviter trims sauvages
    profileSvgPublicPath?: string
    firstName: string
    lastName: string
    headline?: string
    timeAgo?: string
    textMarkdown: unknown                // 👈 unknown → on normalise en string
    reactions?: number
    comments?: number
    reposts?: number
    theme?: {
        background?: string
        card?: string
        text?: string
        subtext?: string
        divider?: string
    }
    size?: { width?: number; height?: number | 'auto' }  // width/height optionnels
    platformStyle?: PlatformStyle
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ----- utils -----
function estimateAutoHeight(opts: {
    W: number
    text: string
    bodyFontSize?: number
    lineHeight?: number
    maxWidthInner?: number
    paragraphSpacing?: number
    safetyMultiplier?: number
}): number {
    const {
        W,
        text,
        bodyFontSize = 18,
        lineHeight = 1.42857,
        maxWidthInner = Math.min(920, W - 160),
        paragraphSpacing = 16,
        safetyMultiplier = 1.35,
    } = opts

    const PADDING_CARD = 28
    const HEADER_BLOCK_H = 64 + 2
    const SPACER_ABOVE_BODY = 16
    const SPACER_BELOW_BODY = 32
    const REACTIONS_H = 28
    const DIVIDER_GROUP_H = 21
    const ACTIONS_H = 28

    const avgCharPx = 0.52 * bodyFontSize
    const charsPerLine = Math.max(14, Math.floor(maxWidthInner / avgCharPx))

    const paragraphs = text.replace(/\r\n/g, '\n').split(/\n\n+/).map(s => s.trim()).filter(Boolean)

    let totalLines = 0
    let explicitBreaks = 0
    let emojiCount = 0
    let boldLikeSignals = 0

    const emojiRegex = /\p{Extended_Pictographic}/gu
    const boldRegex = /\*\*[^*]+\*\*/g
    const linkRegex = /\[[^\]]+\]\([^)]+\)/g
    const hashRegex = /(^|\s)#([\p{L}\p{N}_]+)/gu

    for (const para of paragraphs) {
        const segments = para.split('\n')
        explicitBreaks += Math.max(0, segments.length - 1)

        for (const seg of segments) {
            emojiCount += (seg.match(emojiRegex) || []).length
            boldLikeSignals += (seg.match(boldRegex) || []).length
            boldLikeSignals += (seg.match(linkRegex) || []).length
            boldLikeSignals += (seg.match(hashRegex) || []).length

            const words = seg.split(/\s+/).filter(Boolean)
            let current = 0
            let linesForSeg = 1
            for (const w of words) {
                const wlen = Math.max(1, w.length)
                if (current === 0) current = wlen
                else if (current + 1 + wlen <= charsPerLine) current += 1 + wlen
                else { linesForSeg++; current = wlen }
            }
            if (words.length === 0) linesForSeg = 1
            totalLines += linesForSeg
        }
    }

    const emojiExtraLines = Math.ceil(emojiCount * 0.15)
    const styleExtraLines = Math.ceil(boldLikeSignals * 0.25)
    const breaksExtraLines = Math.ceil(explicitBreaks * 0.25)
    totalLines += emojiExtraLines + styleExtraLines + breaksExtraLines

    const bodyLinePx = bodyFontSize * lineHeight
    const bodyBlockH = totalLines * bodyLinePx
    const paraSpaceTotal = Math.max(0, paragraphs.length - 1) * paragraphSpacing

    let innerHeight =
        HEADER_BLOCK_H +
        SPACER_ABOVE_BODY +
        bodyBlockH +
        paraSpaceTotal +
        SPACER_BELOW_BODY +
        REACTIONS_H +
        DIVIDER_GROUP_H +
        ACTIONS_H

    innerHeight *= safetyMultiplier

    const total = Math.ceil(innerHeight + PADDING_CARD * 2 + 8)
    return (total + 7) & ~7
}

async function imageToDataUrl(url: string): Promise<string | null> {
    try {
        const r = await fetch(url)
        const buf = await r.arrayBuffer()
        const base64 = Buffer.from(buf).toString('base64')
        const mime = r.headers.get('content-type') || 'image/png'
        return `data:${mime};base64,${base64}`
    } catch { return null }
}

function svgMarkupToDataUrl(markup: string): string {
    return `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`
}

async function resolveProfileDataUrl(input: {
    profileImageUrl?: string
    profileSvgMarkup?: unknown
    profileSvgPublicPath?: string
}) {
    const { profileImageUrl, profileSvgMarkup, profileSvgPublicPath } = input

    if (profileImageUrl) {
        const d = await imageToDataUrl(profileImageUrl)
        if (d) return d
    }
    if (typeof profileSvgMarkup === 'string' && profileSvgMarkup.trim()) {
        return svgMarkupToDataUrl(profileSvgMarkup)
    }
    if (profileSvgPublicPath) {
        const d = publicSvgToDataUrl(profileSvgPublicPath)
        if (d) return d
    }
    return publicSvgToDataUrl('icons/avatar-default.svg') || null
}

export async function GET() {
    return NextResponse.json({ ok: true, message: 'POST an object to get a PNG back.' })
}

export async function POST(req: NextRequest) {
    try {
        // lecture UTF-8 pour garder accents/émojis
        const bytes = await req.arrayBuffer()
        const utf8 = new TextDecoder('utf-8').decode(bytes)
        const body = JSON.parse(utf8) as Payload

        const {
            profileImageUrl,
            profileSvgMarkup,
            profileSvgPublicPath,
            firstName,
            lastName,
            headline = '',
            timeAgo = '• 1 h',
            textMarkdown,
            reactions = 0,
            comments = 0,
            reposts = 0,
            theme = {},
            size,
            platformStyle = 'windows',
        } = body || {}

        // 🔒 Normalisation / validation des champs sensibles
        const text = typeof textMarkdown === 'string'
            ? textMarkdown
            : String(textMarkdown ?? '')

        if (!firstName || !lastName || text.trim().length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields: firstName, lastName, textMarkdown (non-empty)' },
                { status: 400 }
            )
        }

        ensureFontsLocalOnly()
        const fonts = getSatoriFonts()
        if (!fonts.length) {
            return NextResponse.json(
                { error: 'Fonts missing. Place Inter-Regular.ttf in /public/fonts' },
                { status: 500 }
            )
        }

        // Normalisation de size → toujours { width: number; height?: number|'auto' }
        const rawSize = size ?? {}
        const safeSize: { width: number; height?: number | 'auto' } = {
            width: Number(rawSize.width) || 1200,
            ...(typeof rawSize.height !== 'undefined' ? { height: rawSize.height } : {}),
        }

        // Largeur (clampée)
        const W = clamp(Number(safeSize.width) || 1200, 600, 2000)

        // Estimation basée contenu (toujours calculée)
        const estimatedH = estimateAutoHeight({
            W,
            text,
            bodyFontSize: 18,
            lineHeight: 1.42857,
            maxWidthInner: Math.min(920, W - 160),
            paragraphSpacing: 16,
            safetyMultiplier: 1,
        })

        // Hauteur finale (pilotée par l’estimateur)
        let H: number
        if (safeSize.height === 'auto' || typeof safeSize.height === 'undefined') {
            H = clamp(estimatedH, 800, 4000)
            console.log("H" + H)
            console.log("EstimatedH" + estimatedH)
        } else {
            const explicitH = Number(safeSize.height) || 0
            console.log("EstimatedH" + estimatedH)
            H = clamp(Math.max(explicitH, estimatedH), 800, 4000)
            console.log("H" + H)
        }

        const palette = buildPalette(theme)
        const profileDataUrl = await resolveProfileDataUrl({
            profileImageUrl,
            profileSvgMarkup,
            profileSvgPublicPath,
        })

        const satoriInput = buildSatoriInput({
            W,
            H, // ← H est bien défini (nombre), côté post.ts tu peux aussi le rendre optionnel si tu veux
            profileDataUrl,
            firstName,
            lastName,
            headline,
            timeAgo,
            textMarkdown: text, // ← on passe la version normalisée
            reactions,
            comments,
            reposts,
            palette,
            platformStyle,
        }) as unknown as ReactNode

        const options: SatoriOptions = { width: W, height: H, fonts }
        const svg = await satori(satoriInput, options)

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
            { error: 'Internal error while generating image', detail: err?.message || String(err) },
            { status: 500 }
        )
    }
}
