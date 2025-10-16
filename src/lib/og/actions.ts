// src/lib/og/actions.ts
import { ActionButton, IconLike, IconComment, IconRepost, IconShare, IconSend } from '@/lib/og/icons'

export function ActionsBar(color: string) {
    return {
        type: 'div',
        props: {
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, paddingBottom: 4 },
            children: [
                ActionButton(IconLike(), 'Like', color),
                ActionButton(IconComment(), 'Comment', color),
                ActionButton(IconRepost(), 'Repost', color),
                ActionButton(IconShare(), 'Share', color),
                ActionButton(IconSend(), 'Send', color),
            ]
        }
    }
}
