// src/lib/og/fontStacks.ts
import { hasFamily } from './fonts'

export type PlatformStyle = 'windows' | 'mac' | 'ios' | 'android'

/** Famille primaire attendue par plateforme (pour les logs / checks) */
export function primaryFamilyFor(style: PlatformStyle): string {
    switch (style) {
        case 'windows': return 'Segoe UI'
        case 'android': return 'Roboto'
        case 'mac':
        case 'ios': return 'SF Pro Text'
    }
}

/**
 * Construit une stack où la police native demandée est *toujours* prioritaire,
 * même si elle n’est pas chargée localement (pour cohérence de fallback visuel).
 */
export function getLocalFontStack(style: PlatformStyle): string {
    const stack: string[] = []

    // On met toujours la famille native demandée en tête
    const primary = primaryFamilyFor(style)
    if (primary) stack.push(`"${primary}"`)

    // Si la famille native est absente localement, Inter servira de base
    if (hasFamily('Inter')) stack.push('Inter')

    // Fallbacks étendus (pour les glyphes/emoji)
    if (hasFamily('Roboto') && primary !== 'Roboto') stack.push('Roboto')
    if (hasFamily('Noto Color Emoji') && primary == "Roboto") stack.push('"Noto Color Emoji"')
    if (hasFamily('Segoe UI') && primary !== 'Segoe UI') stack.push('"Segoe UI"')
    if (hasFamily('Segoe UI Emoji') && primary == 'Segoe UI') stack.push('Segoe UI Emoji')
    if (hasFamily('SF Pro Text') && primary !== 'SF Pro Text') stack.push('"SF Pro Text"')

    // Sécurité finale : Inter toujours présent
    if (!stack.includes('Inter')) stack.push('Inter')

    return stack.join(', ')
}
