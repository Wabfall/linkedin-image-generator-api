// src/lib/og/actions.ts
import { ActionButton, IconLike, IconComment, IconRepost, IconSend } from '@/lib/og/icons'

export function ActionsBar(color: string) {
    return {
        type: 'div',
        props: {
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                gap: 12,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 20,
                paddingRight: 20,
            },
            children: [
                ActionButton(IconLike(), 'Like', color),
                ActionButton(IconComment(), 'Comment', color),
                ActionButton(IconRepost(), 'Repost', color),
                ActionButton(IconSend(), 'Send', color),
            ]
        }
    }
}

