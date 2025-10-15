// /pages/api/linkedin-image.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import satori, { SatoriOptions } from 'satori'
import { Resvg } from '@resvg/resvg-js'

// --- Types d’input ---
interface Payload {
    profileImageUrl?: string
    firstName: string
    lastName: string
    headline?: string
    timeAgo?: string // ex: "3 h"
    textMarkdown: string
    reactions?: number // ex: 128
    comments?: number // ex: 24
    theme?: {
        background?: string
        card?: string
        text?: string
        subtext?: string
        divider?: string
    }
    size?: { width: number; height: number } // défaut 1200x1350
}


// --- Chargement des polices (facultatif mais recommandé) ---
let interRegular: ArrayBuffer | null = null
let interBold: ArrayBuffer | null = null

async function ensureFonts() {
    if (!interRegular) {
        try {
            const regular = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/fonts/Inter-Regular.ttf`).then(r => r.arrayBuffer())
            interRegular = regular
        } catch {
            interRegular = null
        }
    }
    if (!interBold) {
        try {
            const bold = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/fonts/Inter-Bold.ttf`).then(r => r.arrayBuffer())
            interBold = bold
        } catch {
            interBold = null
        }
    }
}