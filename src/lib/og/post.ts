// src/lib/og/post.ts
import type { Palette } from './theme'
import { paragraphsWithWrap, splitParagraphs } from './markdown'
import { IconGlobe } from './icons'
import { loadReactiveIcons, ReactionBadge } from './reactions'
import { ActionsBar } from './actions'

import type { PlatformStyle } from './fontStacks'
import { getLocalFontStack } from './fontStacks'

export type PostInput = {
    W: number
    H: number
    profileDataUrl: string | null
    firstName: string
    lastName: string
    headline: string
    timeAgo: string
    textMarkdown: string
    reactions: number
    comments: number
    reposts: number
    palette: Palette
    /** windows | mac | ios | android */
    platformStyle: PlatformStyle
    previewMode: "more" | "less"
}

export function buildSatoriInput(input: PostInput) {
    const {
        W, H, profileDataUrl,
        firstName, lastName, headline, timeAgo,
        textMarkdown, reactions, comments, reposts, palette,
        platformStyle, previewMode = 'more',
    } = input

    const NAME_NUDGE_Y = -4
    const fontFamily = getLocalFontStack(platformStyle)
    const CONTENT_W = Math.min(920, W - 160)

    // --- BODY
    let bodyNodes: any[] = []

    bodyNodes = paragraphsWithWrap(
        splitParagraphs(textMarkdown),
        {
            color: palette.text,
            fontSize: 20,
            lineHeight: 1.4,
            maxWidth: CONTENT_W,
        }
    )

    const reactiveSvgs = loadReactiveIcons()

    return {
        type: 'div',
        props: {
            style: {
                width: W,
                height: H,
                backgroundColor: palette.background,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily,
            },
            children: {
                type: 'div',
                props: {
                    style: {
                        width: CONTENT_W,
                        backgroundColor: palette.card,
                        borderRadius: 16,
                        boxShadow: '0 8px 28px rgba(0,0,0,0.06)',
                        padding: 28,
                        display: 'flex',
                        flexDirection: 'column',
                    },
                    children: [
                        // Header
                        {
                            type: 'div',
                            props: {
                                style: { display: 'flex', alignItems: 'center' },
                                children: [
                                    profileDataUrl
                                        ? {
                                            type: 'img',
                                            props: {
                                                src: profileDataUrl,
                                                width: 64,
                                                height: 64,
                                                style: { borderRadius: 32, objectFit: 'cover', border: '1px solid #E5E7EB' },
                                            },
                                        }
                                        : {
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
                                            style: { marginLeft: 14, display: 'flex', flexDirection: 'column', marginTop: NAME_NUDGE_Y },
                                            children: [
                                                { type: 'div', props: { style: { fontSize: 20, fontWeight: 500, color: palette.text, lineHeight: 1.2 }, children: `${firstName} ${lastName}` } },
                                                { type: 'div', props: { style: { fontSize: 14, color: palette.subtext, marginTop: 0 }, children: headline } },
                                                {
                                                    type: 'div',
                                                    props: {
                                                        style: { marginTop: 2, display: 'flex', alignItems: 'center', gap: 8, color: palette.subtext, fontSize: 14, lineHeight: 1, whiteSpace: 'nowrap' },
                                                        children: [
                                                            { type: 'span', props: { children: (timeAgo || '').replace(/^\s*•\s*/, '') } },
                                                            { type: 'span', props: { children: '•' } },
                                                            { type: 'div', props: { style: { marginLeft: -2, display: 'flex' }, children: IconGlobe() } },
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        },

                        // Spacer
                        { type: 'div', props: { style: { height: 16 } } },

                        // Body
                        { type: 'div', props: { style: { display: 'flex', flexDirection: 'column' }, children: bodyNodes } },

                        // Divider
                        { type: 'div', props: { style: { height: 20 } } },
                        { type: 'div', props: { style: { height: 12 } } },

                        // Reactions + comments + reposts
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
                                                ...(reactiveSvgs.length ? reactiveSvgs.map((src, i) => ReactionBadge(src, i)) : []),
                                                {
                                                    type: 'div',
                                                    props: {
                                                        style: { marginLeft: 8, fontSize: 20, color: palette.subtext },
                                                        children: `${reactions.toLocaleString()} reactions`
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        type: 'div',
                                        props: {
                                            style: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, color: palette.subtext, whiteSpace: 'nowrap' },
                                            children: [
                                                `${comments.toLocaleString()} comments`,
                                                { type: 'span', props: { style: { opacity: 0.6 }, children: '•' } },
                                                `${reposts.toLocaleString()} reposts`
                                            ]
                                        }
                                    }
                                ]
                            }
                        },

                        // Divider between reactions and action buttons
                        { type: 'div', props: { style: { height: 12 } } },
                        { type: 'div', props: { style: { height: 1, backgroundColor: palette.divider } } },
                        { type: 'div', props: { style: { height: 8 } } },

                        // Action buttons
                        ActionsBar(palette.subtext),
                    ]
                }
            }
        }
    } as any
}
