// src/lib/og/fonts.ts
import fs from 'fs'
import path from 'path'
import type { SatoriOptions } from 'satori'

let interRegular: ArrayBuffer | null = null
let interBold: ArrayBuffer | null = null

export function ensureFontsLocalOnly() {
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
        const hint = `Place Inter-Regular.ttf and Inter-Bold.ttf in ${path.relative(process.cwd(), base)}`
        throw new Error(`Fonts not found: ${miss.join(', ')}. ${hint}`)
    }
}

export function getSatoriFonts(): SatoriOptions['fonts'] {
    const fonts: SatoriOptions['fonts'] = []
    if (interRegular) fonts.push({ name: 'Inter', data: interRegular, weight: 400, style: 'normal' })
    if (interBold) fonts.push({ name: 'Inter', data: interBold, weight: 700, style: 'normal' })
    return fonts
}
