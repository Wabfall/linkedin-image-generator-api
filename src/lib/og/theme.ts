// src/lib/og/theme.ts
export type Palette = {
    background: string
    card: string
    text: string
    subtext: string
    divider: string
}

export function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n))
}

export function buildPalette(theme?: Partial<Palette>): Palette {
    return {
        background: theme?.background ?? '#EEF2F5',
        card: theme?.card ?? '#FFFFFF',
        text: theme?.text ?? '#000000e6', // nom & prénom
        subtext: theme?.subtext ?? '#00000099', // titre, heure, planète
        divider: theme?.divider ?? '#E5E7EB',
    }
}
