// src/lib/og/icons.ts
type Node = any

export function IconLike(): Node {
    return {
        type: 'svg',
        props: {
            width: 20, height: 20, viewBox: '0 0 16 16', style: { display: 'block' },
            children: [{
                type: 'path',
                props: {
                    d: 'M6.25 13.5h4.63c.62 0 1.15-.41 1.3-1.01l1.07-4.05c.2-.76-.37-1.49-1.16-1.49H9.38c.39-1.17.53-2.07.53-2.62 0-1.2-.7-1.83-1.45-1.83-.54 0-.91.25-1.15.75-.26.55-.67 1.52-1.21 2.35-.25.38-.5.66-.79.86-.3.2-.61.29-.96.29H2.5v6.75h2.36c.56 0 1.07.24 1.39.7.06.08.12.2.2.35.22.45.83.75 1.2.75Z',
                    fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round', strokeLinecap: 'round'
                }
            }]
        }
    }
}
export function IconComment(): Node {
    return {
        type: 'svg',
        props: {
            width: 20, height: 20, viewBox: '0 0 16 16', style: { display: 'block' },
            children: [{
                type: 'path',
                props: {
                    d: 'M3 3h10a2 2 0 0 1 2 2v4.5a2 2 0 0 1-2 2H8l-3.5 2V11H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z',
                    fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round'
                }
            }]
        }
    }
}
export function IconRepost(): Node {
    return {
        type: 'svg',
        props: {
            width: 20, height: 20, viewBox: '0 0 16 16', style: { display: 'block' },
            children: [
                { type: 'path', props: { d: 'M11 4l2.5 2.5L11 9', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' } },
                { type: 'path', props: { d: 'M13.5 6.5H8A3.5 3.5 0 0 0 4.5 10v2.5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' } },
                { type: 'path', props: { d: 'M5 12L2.5 9.5 5 7', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' } },
                { type: 'path', props: { d: 'M2.5 9.5H8A3.5 3.5 0 0 0 11.5 6V3.5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' } },
            ]
        }
    }
}
export function IconShare(): Node {
    return {
        type: 'svg',
        props: {
            width: 20, height: 20, viewBox: '0 0 16 16', style: { display: 'block' },
            children: [
                { type: 'path', props: { d: 'M10.5 5.5L14 2v4.5M14 2h-4.5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' } },
                { type: 'path', props: { d: 'M7 4H5.5A3.5 3.5 0 0 0 2 7.5v3A3.5 3.5 0 0 0 5.5 14h3A3.5 3.5 0 0 0 12 10.5V9', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' } },
            ]
        }
    }
}
export function IconSend(): Node {
    return {
        type: 'svg',
        props: {
            width: 20, height: 20, viewBox: '0 0 16 16', style: { display: 'block' },
            children: [
                { type: 'path', props: { d: 'M13.87 2.13L2.62 6.47c-.9.34-.94 1.62-.06 2.04l3.55 1.69c.27.13.49.35.62.62l1.69 3.55c.42.88 1.7.84 2.04-.06l4.34-11.25c.29-.76-.5-1.55-1.26-1.26Z', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round' } },
                { type: 'path', props: { d: 'M13.5 2.5L6.5 9.5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' } },
            ]
        }
    }
}
export function ActionButton(iconNode: Node, label: string, color = '#5E6A75'): Node {
    return {
        type: 'div',
        props: {
            style: { display: 'flex', alignItems: 'center', gap: 8, color, fontSize: 20, lineHeight: 1 },
            children: [{ ...iconNode }, { type: 'span', props: { children: label } }]
        }
    }
}
