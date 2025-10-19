// src/app/api/linkedin-image/route.ts
import { NextRequest, NextResponse } from 'next/server'
import satori, { type SatoriOptions } from 'satori'
import type { ReactNode } from 'react'
import { buildPalette, clamp } from '@/lib/og/theme'
import { buildSatoriInput } from '@/lib/og/post'
import { publicSvgToDataUrl } from '@/lib/og/reactions'
import { ensureFontsLocalOnly, getSatoriFonts, hasFamily } from '@/lib/og/fonts'
import { primaryFamilyFor } from '@/lib/og/fontStacks'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Payload = {
    profileImageUrl?: string
    profileSvgMarkup?: string
    profileSvgPublicPath?: string
    firstName: string
    lastName: string
    headline?: string
    timeAgo?: string
    textMarkdown: string
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
    size?: { width: number; height: number }

    /** Rend le style selon la plateforme : windows | mac | ios | android */
    platformStyle?: 'windows' | 'mac' | 'ios' | 'android'
}

// --- helpers ---
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

function svgMarkupToDataUrl(markup: string): string {
    return `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`
}

async function resolveProfileDataUrl(input: {
    profileImageUrl?: string
    profileSvgMarkup?: string
    profileSvgPublicPath?: string
}) {
    const { profileImageUrl, profileSvgMarkup, profileSvgPublicPath } = input

    if (profileImageUrl) {
        const d = await imageToDataUrl(profileImageUrl)
        if (d) return d
    }
    if (profileSvgMarkup && profileSvgMarkup.trim()) {
        return svgMarkupToDataUrl(profileSvgMarkup)
    }
    if (profileSvgPublicPath) {
        const d = publicSvgToDataUrl(profileSvgPublicPath)
        if (d) return d
    }
    return publicSvgToDataUrl('icons/avatar-default.svg') || null
}

// --- route handlers ---
export async function GET() {
    return NextResponse.json({ ok: true, message: 'POST an object to get a PNG back.' })
}

export async function POST(req: NextRequest) {
    try {
        // lecture propre en UTF-8 (accents/emojis)
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
            size = { width: 1200, height: 1350 },
            platformStyle = 'windows',
        } = body || {}

        if (!firstName || !lastName || !textMarkdown) {
            return NextResponse.json(
                { error: 'Missing required fields: firstName, lastName, textMarkdown' },
                { status: 400 },
            )
        }

        // --- charge les fonts locales ---
        ensureFontsLocalOnly()
        const fonts = getSatoriFonts()
        if (!fonts.length) {
            return NextResponse.json(
                { error: 'Fonts missing. Place Inter-Regular.ttf in /public/fonts' },
                { status: 500 },
            )
        }

        // Alerte si la famille primaire attendue pour la plateforme n'est pas chargée
        const primary = primaryFamilyFor(platformStyle)
        if (primary && !hasFamily(primary)) {
            console.warn(
                `[fonts] platformStyle=${platformStyle}: primary family "${primary}" not found locally. Falling back to loaded families.`
            )
        }

        const W = clamp(Number(size.width) || 1200, 600, 2000)
        const H = clamp(Number(size.height) || 1350, 800, 2200)
        const palette = buildPalette(theme)

        const profileDataUrl = await resolveProfileDataUrl({
            profileImageUrl,
            profileSvgMarkup,
            profileSvgPublicPath,
        })

        // --- construit le rendu ---
        const satoriInput = buildSatoriInput({
            W,
            H,
            profileDataUrl,
            firstName,
            lastName,
            headline,
            timeAgo,
            textMarkdown,
            reactions,
            comments,
            reposts,
            palette,
            platformStyle, // ✅ synchronisé avec PostInput
        }) as unknown as ReactNode

        const options: SatoriOptions = { width: W, height: H, fonts }
        const svg = await satori(satoriInput, options)

        // --- conversion SVG → PNG ---
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
            { status: 500 },
        )
    }
}
