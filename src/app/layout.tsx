import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LinkedIn Post Generator',
  description: 'Generate pixel-perfect LinkedIn post PNG images from a JSON payload.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
