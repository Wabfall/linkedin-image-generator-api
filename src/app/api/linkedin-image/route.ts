// src/app/api/linkedin-image/route.ts
import { NextRequest, NextResponse } from 'next/server'
import satori, { type SatoriOptions } from 'satori'
import type { ReactNode } from 'react'
import { ensureFontsLocalOnly, getSatoriFonts } from '@/lib/og/fonts'
import { buildPalette, clamp } from '@/lib/og/theme'
import { buildSatoriInput } from '@/lib/og/post'
import { publicSvgToDataUrl } from '@/lib/og/reactions' // on réutilise l’utilitaire

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Payload = {
    profileImageUrl?: string
    /** code SVG inline (string) */
    profileSvgMarkup?: string
    /** chemin public vers un svg (ex: "icons/avatar-default.svg") */
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
}

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

/** Transforme un markup SVG inline en data URL */
function svgMarkupToDataUrl(markup: string): string {
    return `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`
}

/** Choisit la meilleure source d’avatar et renvoie une data URL */
async function resolveProfileDataUrl(input: {
    profileImageUrl?: string
    profileSvgMarkup?: string
    profileSvgPublicPath?: string
}) {
    const { profileImageUrl, profileSvgMarkup, profileSvgPublicPath } = input

    // 1) URL distante (png/jpg/webp/svg…)
    if (profileImageUrl) {
        const d = await imageToDataUrl(profileImageUrl)
        if (d) return d
    }

    // 2) SVG inline (string)
    if (profileSvgMarkup && profileSvgMarkup.trim()) {
        return svgMarkupToDataUrl(profileSvgMarkup)
    }

    // 3) Fichier public
    if (profileSvgPublicPath) {
        const d = publicSvgToDataUrl(profileSvgPublicPath)
        if (d) return d
    }

    // 4) Fallback → avatar par défaut
    return publicSvgToDataUrl('icons/avatar-default.svg') || null
}

export async function GET() {
    return NextResponse.json({ ok: true, message: 'POST an object to get a PNG back.' })
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as Payload
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
        } = body || {}

        if (!firstName || !lastName || !textMarkdown) {
            return NextResponse.json(
                { error: 'Missing required fields: firstName, lastName, textMarkdown' },
                { status: 400 }
            )
        }

        ensureFontsLocalOnly()
        const fonts = getSatoriFonts()
        if (!fonts.length) {
            return NextResponse.json(
                { error: 'Fonts missing. Put Inter-Regular.ttf and Inter-Bold.ttf in /public/fonts' },
                { status: 500 }
            )
        }

        const W = clamp(Number(size.width) || 1200, 600, 2000)
        const H = clamp(Number(size.height) || 1350, 800, 2200)
        const palette = buildPalette(theme)

        // ⬇️ Résolution de l’avatar (priorité: URL > markup > publicPath > défaut)
        const profileDataUrl = await resolveProfileDataUrl({
            profileImageUrl,
            profileSvgMarkup,
            profileSvgPublicPath,
        })

        const satoriInput = buildSatoriInput({
            W, H, profileDataUrl,
            firstName, lastName, headline, timeAgo,
            textMarkdown, reactions, comments, reposts,
            palette
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
            { error: 'Internal error while generating image', detail: (err && err.message) || String(err) },
            { status: 500 }
        )
    }
}
