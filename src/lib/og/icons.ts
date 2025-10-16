// src/lib/og/icons.ts
type Node = any

/** Like (filled, inherits currentColor) */
export function IconLike(): Node {
    return {
        type: 'svg',
        props: {
            width: 20,
            height: 20,
            viewBox: '0 0 16 16',
            style: { display: 'block' },
            children: [
                {
                    type: 'path',
                    props: {
                        d: 'M12.91 7l-2.25-2.57a8.21 8.21 0 01-1.5-2.55L9 1.37A2.08 2.08 0 007 0a2.08 2.08 0 00-2.06 2.08v1.17a5.81 5.81 0 00.31 1.89l.28.86H2.38A1.47 1.47 0 001 7.47a1.45 1.45 0 00.64 1.21 1.48 1.48 0 00-.37 2.06 1.54 1.54 0 00.62.51h.05a1.6 1.6 0 00-.19.71A1.47 1.47 0 003 13.42v.1A1.46 1.46 0 004.4 15h4.83a5.61 5.61 0 002.48-.58l1-.42H14V7zM12 12.11l-1.19.52a3.59 3.59 0 01-1.58.37H5.1a.55.55 0 01-.53-.4l-.14-.48-.49-.21a.56.56 0 01-.34-.6l.09-.56-.42-.42a.56.56 0 01-.09-.68L3.55 9l-.4-.61A.28.28 0 013.3 8h5L7.14 4.51a4.15 4.15 0 01-.2-1.26V2.08A.09.09 0 017 2a.11.11 0 01.08 0l.18.51a10 10 0 001.9 3.24l2.84 3z',
                        fill: 'currentColor',
                        stroke: 'none',
                    },
                },
            ],
        },
    }
}

/** Comment (filled, inherits currentColor) */
export function IconComment(): Node {
    return {
        type: 'svg',
        props: {
            width: 20,
            height: 20,
            viewBox: '0 0 16 16',
            style: { display: 'block' },
            children: [
                {
                    type: 'path',
                    props: {
                        d: 'M5 8h5v1H5zm11-.5v.08a6 6 0 01-2.75 5L8 16v-3H5.5A5.51 5.51 0 010 7.5 5.62 5.62 0 015.74 2h4.76A5.5 5.5 0 0116 7.5zm-2 0A3.5 3.5 0 0010.5 4H5.74A3.62 3.62 0 002 7.5 3.53 3.53 0 005.5 11H10v1.33l2.17-1.39A4 4 0 0014 7.58zM5 7h6V6H5z',
                        fill: 'currentColor',
                        stroke: 'none',
                    },
                },
            ],
        },
    }
}

/** Repost (filled, inherits currentColor) */
export function IconRepost(): Node {
    return {
        type: 'svg',
        props: {
            width: 20,
            height: 20,
            viewBox: '0 0 16 16',
            style: { display: 'block' },
            children: [
                {
                    type: 'path',
                    props: {
                        d: 'M4 10H2V5c0-1.66 1.34-3 3-3h3.85L7.42 0h2.44L12 3 9.86 6H7.42l1.43-2H5c-.55 0-1 .45-1 1v5zm8-4v5c0 .55-.45 1-1 1H7.15l1.43-2H6.14L4 13l2.14 3h2.44l-1.43-2H11c1.66 0 3-1.34 3-3V6h-2z',
                        fill: 'currentColor',
                        stroke: 'none',
                    },
                },
            ],
        },
    }
}

/** Send (filled, inherits currentColor) */
export function IconSend(): Node {
    return {
        type: 'svg',
        props: {
            width: 20,
            height: 20,
            viewBox: '0 0 16 16',
            style: { display: 'block' },
            children: [
                {
                    type: 'path',
                    props: {
                        d: 'M14.06 1.94a.8.8 0 011.1 1.1l-4.9 11.64a.8.8 0 01-1.48-.08l-1.1-3.06-3.06-1.1a.8.8 0 01-.08-1.48L14.06 1.94ZM7.5 9.5l1 2.75L12.2 4.4 7.5 9.5Zm-1-.5-2.75-1L11.6 3.8 6.5 9Z',
                        fill: 'currentColor',
                        stroke: 'none',
                    },
                },
            ],
        },
    }
}

// src/lib/og/icons.ts (ajoute ceci)
export function IconGlobe(): any {
    return {
        type: 'svg',
        props: {
            width: 16,
            height: 16,
            viewBox: '0 0 16 16',
            style: { display: 'block' },
            children: [
                {
                    type: 'path',
                    props: {
                        d: 'M8 1a7 7 0 107 7 7 7 0 00-7-7zM3 8a5 5 0 011-3l.55.55A1.5 1.5 0 015 6.62v1.07a.75.75 0 00.22.53l.56.56a.75.75 0 00.53.22H7v.69a.75.75 0 00.22.53l.56.56a.75.75 0 01.22.53V13a5 5 0 01-5-5zm6.24 4.83l2-2.46a.75.75 0 00.09-.8l-.58-1.16A.76.76 0 0010 8H7v-.19a.51.51 0 01.28-.45l.38-.19a.74.74 0 01.68 0L9 7.5l.38-.7a1 1 0 00.12-.48v-.85a.78.78 0 01.21-.53l1.07-1.09a5 5 0 01-1.54 9z',
                        fill: 'currentColor',
                        stroke: 'none',
                    },
                },
            ],
        },
    }
}

/** Action button: icon + label, inherits color from parent */
export function ActionButton(iconNode: Node, label: string, color = '#000000bf'): Node {
    return {
        type: 'div',
        props: {
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color,
                fontSize: 20,
                lineHeight: 1,
            },
            children: [{ ...iconNode }, { type: 'span', props: { children: label } }],
        },
    }
}
