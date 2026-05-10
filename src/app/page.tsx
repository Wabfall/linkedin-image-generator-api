'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── i18n ────────────────────────────────────────────────────────────────────

const LOCALES = {
  en: {
    tagline: 'Generate pixel-perfect LinkedIn post PNG images from a JSON payload',
    params: 'Parameters',
    livePreview: 'Live preview',
    download: '⬇ Download PNG',
    emptyState: 'Fill in First name, Last name and Text to generate the preview',
    sIdentity: 'Identity', sContent: 'Content', sStats: 'Statistics',
    sLayout: 'Layout', sTheme: 'Theme', sAvatar: 'Avatar', sAttachments: 'Attachments (URLs)',
    firstName: 'First name *', lastName: 'Last name *',
    headline: 'Headline', timeAgo: 'Time shown',
    textLabel: 'Post text * — markdown: **bold**, *italic*, #hashtag, [link](url)',
    textPlaceholder: 'Your text here…',
    reactions: 'Reactions', comments: 'Comments', reposts: 'Reposts',
    platform: 'Platform', device: 'Device', previewMode: 'Preview mode',
    width: 'Width (px)', height: 'Height (px or auto)',
    mobile: 'Mobile (800px)', tablet: 'Tablet (1000px)', desktop: 'Desktop (1200px)',
    more: 'More (full)', less: 'Less (truncated)',
    background: 'Background', card: 'Card', text: 'Text', subtext: 'Subtext', divider: 'Divider',
    avatarMode: 'Mode', avatarUrl: 'Remote URL', avatarSvg: 'SVG markup', avatarPublic: 'Public file',
    imageUrl: 'Image URL', publicPath: 'Path in /public',
    addUrl: '+ Add URL',
    imageN: (n: number) => `Image ${n}`,
    networkError: 'Network error', unknownError: 'Unknown error',
    imgAlt: 'Generated LinkedIn post preview',
  },
  fr: {
    tagline: 'Génère des aperçus PNG de posts LinkedIn depuis un payload JSON',
    params: 'Paramètres',
    livePreview: 'Prévisualisation live',
    download: '⬇ Télécharger PNG',
    emptyState: 'Remplis les champs Prénom, Nom et Texte pour générer l\'aperçu',
    sIdentity: 'Identité', sContent: 'Contenu', sStats: 'Statistiques',
    sLayout: 'Layout', sTheme: 'Thème', sAvatar: 'Avatar', sAttachments: 'Pièces jointes (URLs)',
    firstName: 'Prénom *', lastName: 'Nom *',
    headline: 'Titre (headline)', timeAgo: 'Temps affiché',
    textLabel: 'Texte du post * — markdown : **gras**, *italique*, #hashtag, [lien](url)',
    textPlaceholder: 'Votre texte ici…',
    reactions: 'Réactions', comments: 'Commentaires', reposts: 'Reposts',
    platform: 'Plateforme', device: 'Appareil', previewMode: 'Mode aperçu',
    width: 'Largeur (px)', height: 'Hauteur (px ou auto)',
    mobile: 'Mobile (800px)', tablet: 'Tablet (1000px)', desktop: 'Desktop (1200px)',
    more: 'More (complet)', less: 'Less (tronqué)',
    background: 'Arrière-plan', card: 'Carte', text: 'Texte', subtext: 'Sous-texte', divider: 'Séparateur',
    avatarMode: 'Mode', avatarUrl: 'URL distante', avatarSvg: 'SVG markup', avatarPublic: 'Fichier public',
    imageUrl: 'URL de l\'image', publicPath: 'Chemin dans /public',
    addUrl: '+ Ajouter une URL',
    imageN: (n: number) => `Image ${n}`,
    networkError: 'Erreur réseau', unknownError: 'Erreur inconnue',
    imgAlt: 'Aperçu du post LinkedIn généré',
  },
  es: {
    tagline: 'Genera imágenes PNG de posts de LinkedIn desde un payload JSON',
    params: 'Parámetros',
    livePreview: 'Vista previa en vivo',
    download: '⬇ Descargar PNG',
    emptyState: 'Rellena Nombre, Apellido y Texto para generar la vista previa',
    sIdentity: 'Identidad', sContent: 'Contenido', sStats: 'Estadísticas',
    sLayout: 'Layout', sTheme: 'Tema', sAvatar: 'Avatar', sAttachments: 'Archivos adjuntos (URLs)',
    firstName: 'Nombre *', lastName: 'Apellido *',
    headline: 'Título (headline)', timeAgo: 'Tiempo mostrado',
    textLabel: 'Texto del post * — markdown: **negrita**, *cursiva*, #hashtag, [enlace](url)',
    textPlaceholder: 'Tu texto aquí…',
    reactions: 'Reacciones', comments: 'Comentarios', reposts: 'Reposts',
    platform: 'Plataforma', device: 'Dispositivo', previewMode: 'Modo vista previa',
    width: 'Ancho (px)', height: 'Alto (px o auto)',
    mobile: 'Móvil (800px)', tablet: 'Tablet (1000px)', desktop: 'Escritorio (1200px)',
    more: 'Más (completo)', less: 'Menos (truncado)',
    background: 'Fondo', card: 'Tarjeta', text: 'Texto', subtext: 'Subtexto', divider: 'Divisor',
    avatarMode: 'Modo', avatarUrl: 'URL remota', avatarSvg: 'SVG markup', avatarPublic: 'Archivo público',
    imageUrl: 'URL de la imagen', publicPath: 'Ruta en /public',
    addUrl: '+ Agregar URL',
    imageN: (n: number) => `Imagen ${n}`,
    networkError: 'Error de red', unknownError: 'Error desconocido',
    imgAlt: 'Vista previa del post de LinkedIn generado',
  },
  de: {
    tagline: 'Generiert pixelgenaue LinkedIn-Post-PNG-Bilder aus einem JSON-Payload',
    params: 'Parameter',
    livePreview: 'Live-Vorschau',
    download: '⬇ PNG herunterladen',
    emptyState: 'Fülle Vorname, Nachname und Text aus, um die Vorschau zu generieren',
    sIdentity: 'Identität', sContent: 'Inhalt', sStats: 'Statistiken',
    sLayout: 'Layout', sTheme: 'Design', sAvatar: 'Avatar', sAttachments: 'Anhänge (URLs)',
    firstName: 'Vorname *', lastName: 'Nachname *',
    headline: 'Berufsbezeichnung', timeAgo: 'Zeitangabe',
    textLabel: 'Post-Text * — Markdown: **fett**, *kursiv*, #hashtag, [Link](url)',
    textPlaceholder: 'Dein Text hier…',
    reactions: 'Reaktionen', comments: 'Kommentare', reposts: 'Reposts',
    platform: 'Plattform', device: 'Gerät', previewMode: 'Vorschaumodus',
    width: 'Breite (px)', height: 'Höhe (px oder auto)',
    mobile: 'Mobil (800px)', tablet: 'Tablet (1000px)', desktop: 'Desktop (1200px)',
    more: 'Mehr (vollständig)', less: 'Weniger (gekürzt)',
    background: 'Hintergrund', card: 'Karte', text: 'Text', subtext: 'Untertext', divider: 'Trennlinie',
    avatarMode: 'Modus', avatarUrl: 'Remote-URL', avatarSvg: 'SVG-Markup', avatarPublic: 'Öffentliche Datei',
    imageUrl: 'Bild-URL', publicPath: 'Pfad in /public',
    addUrl: '+ URL hinzufügen',
    imageN: (n: number) => `Bild ${n}`,
    networkError: 'Netzwerkfehler', unknownError: 'Unbekannter Fehler',
    imgAlt: 'Vorschau des generierten LinkedIn-Posts',
  },
} as const

type LocaleKey = keyof typeof LOCALES

const LOCALE_FLAGS: Record<LocaleKey, string> = { en: '🇬🇧', fr: '🇫🇷', es: '🇪🇸', de: '🇩🇪' }

// ─── Form types ───────────────────────────────────────────────────────────────

type PlatformStyle = 'windows' | 'mac' | 'ios' | 'android'
type DevicePreview = 'mobile' | 'tablet' | 'desktop'
type TypePreview = 'more' | 'less'
type AvatarMode = 'url' | 'svg' | 'public'

type Form = {
  firstName: string; lastName: string; headline: string; timeAgo: string
  textMarkdown: string
  reactions: number | ''; comments: number | ''; reposts: number | ''
  platformStyle: PlatformStyle; devicePreview: DevicePreview; typePreview: TypePreview
  sizeWidth: string; sizeHeight: string
  themeBackground: string; themeCard: string; themeText: string
  themeSubtext: string; themeDivider: string
  avatarMode: AvatarMode
  profileImageUrl: string; profileSvgMarkup: string; profileSvgPublicPath: string
  attachmentsUrls: string[]
}

const DEFAULTS: Form = {
  firstName: 'Alex', lastName: 'Martin',
  headline: 'Software Engineer @ Acme Corp', timeAgo: '• 2 h',
  textMarkdown: 'Excited to share my **new open-source project** 🚀\n\nBuilt with #NextJS and #TypeScript.\n\n[Check it out on GitHub](https://github.com)',
  reactions: 247, comments: 38, reposts: 12,
  platformStyle: 'windows', devicePreview: 'desktop', typePreview: 'more',
  sizeWidth: '', sizeHeight: '',
  themeBackground: '#EEF2F5', themeCard: '#FFFFFF',
  themeText: '#000000e6', themeSubtext: '#00000099', themeDivider: '#E5E7EB',
  avatarMode: 'url', profileImageUrl: '', profileSvgMarkup: '', profileSvgPublicPath: '',
  attachmentsUrls: [],
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em' }}>
      {children}
    </span>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6,
  fontSize: 13, color: '#1e293b', background: '#fff', outline: 'none',
  width: '100%', boxSizing: 'border-box',
}

function TextInput({ label, value, onChange, placeholder }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
      {label && <Label>{label}</Label>}
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  )
}

function NumberInput({ label, value, onChange }: { label: string; value: number | ''; onChange: (v: number | '') => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
      <Label>{label}</Label>
      <input
        type="number" min={0} value={value}
        onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        style={inputStyle}
      />
    </div>
  )
}

function RadioGroup<T extends string>({ label, options, value, onChange }: {
  label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Label>{label}</Label>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            padding: '4px 10px', borderRadius: 6, border: '1px solid',
            borderColor: value === o.value ? '#6366f1' : '#cbd5e1',
            background: value === o.value ? '#6366f1' : '#fff',
            color: value === o.value ? '#fff' : '#475569',
            fontSize: 12, cursor: 'pointer', fontWeight: value === o.value ? 600 : 400,
          }}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 120 }}>
      <Label>{label}</Label>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, border: '1px solid #cbd5e1', background: value || '#fff' }} />
        <input value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, fontSize: 12 }} />
      </div>
    </div>
  )
}

function Section({ emoji, title, children, defaultOpen = true }: {
  emoji: string; title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderBottom: '1px solid #e2e8f0' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: '#fff', border: 'none', cursor: 'pointer',
        fontWeight: 600, fontSize: 13, color: '#334155', textAlign: 'left',
      }}>
        <span>{emoji} {title}</span>
        <span style={{ color: '#94a3b8', fontSize: 11 }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div style={{ padding: '8px 16px 14px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PlaygroundPage() {
  const [locale, setLocale] = useState<LocaleKey>('en')
  const [form, setForm] = useState<Form>(DEFAULTS)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const blobRef = useRef<Blob | null>(null)

  const t = LOCALES[locale]

  const set = useCallback(<K extends keyof Form>(key: K, value: Form[K]) => {
    setForm(f => ({ ...f, [key]: value }))
  }, [])

  const generate = useCallback(async (f: Form, networkErr: string, unknownErr: string) => {
    setLoading(true)
    setError(null)

    const body: Record<string, unknown> = {
      firstName: f.firstName, lastName: f.lastName,
      headline: f.headline || undefined, timeAgo: f.timeAgo || undefined,
      textMarkdown: f.textMarkdown,
      reactions: f.reactions === '' ? undefined : f.reactions,
      comments: f.comments === '' ? undefined : f.comments,
      reposts: f.reposts === '' ? undefined : f.reposts,
      platformStyle: f.platformStyle, devicePreview: f.devicePreview, typePreview: f.typePreview,
      theme: {
        background: f.themeBackground, card: f.themeCard, text: f.themeText,
        subtext: f.themeSubtext, divider: f.themeDivider,
      },
    }

    if (f.sizeWidth || f.sizeHeight) {
      body.size = {
        width: f.sizeWidth ? Number(f.sizeWidth) : undefined,
        height: f.sizeHeight === 'auto' ? 'auto' : f.sizeHeight ? Number(f.sizeHeight) : undefined,
      }
    }

    if (f.avatarMode === 'url' && f.profileImageUrl) body.profileImageUrl = f.profileImageUrl
    else if (f.avatarMode === 'svg' && f.profileSvgMarkup) body.profileSvgMarkup = f.profileSvgMarkup
    else if (f.avatarMode === 'public' && f.profileSvgPublicPath) body.profileSvgPublicPath = f.profileSvgPublicPath

    const urls = f.attachmentsUrls.filter(Boolean)
    if (urls.length) body.attachmentsUrls = urls

    try {
      const res = await fetch('/api/linkedin-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: string }
        setError(json.error ?? unknownErr)
        return
      }
      const blob = await res.blob()
      blobRef.current = blob
      const url = URL.createObjectURL(blob)
      setImageUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url })
    } catch {
      setError(networkErr)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!form.firstName.trim() || !form.lastName.trim() || !form.textMarkdown.trim()) return
    timerRef.current = setTimeout(() => {
      void generate(form, t.networkError, t.unknownError)
    }, 500)
    return () => clearTimeout(timerRef.current)
  }, [form, generate, t.networkError, t.unknownError])

  function download() {
    if (!blobRef.current) return
    const a = document.createElement('a')
    const url = URL.createObjectURL(blobRef.current)
    a.href = url; a.download = 'linkedin-post.png'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  const urls = form.attachmentsUrls
  const statusColor = loading ? '#f59e0b' : error ? '#ef4444' : imageUrl ? '#22c55e' : '#94a3b8'

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 2px rgba(99,102,241,.15); }
        button:focus-visible { outline: 2px solid #6366f1; outline-offset: 2px; }
      `}</style>

      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ── Header ── */}
        <header style={{
          background: '#1e293b', color: '#f1f5f9', padding: '0 20px',
          display: 'flex', alignItems: 'center', gap: 14, height: 52, flexShrink: 0,
        }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#818cf8', whiteSpace: 'nowrap' }}>
            LinkedIn Post Generator
          </span>
          <span style={{ color: '#64748b', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {t.tagline}
          </span>

          {/* Language switcher */}
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {(Object.keys(LOCALES) as LocaleKey[]).map(key => (
              <button key={key} onClick={() => setLocale(key)} style={{
                padding: '3px 8px', borderRadius: 6, border: '1px solid',
                borderColor: locale === key ? '#818cf8' : 'transparent',
                background: locale === key ? 'rgba(129,140,248,.15)' : 'transparent',
                color: locale === key ? '#c7d2fe' : '#64748b',
                fontSize: 12, cursor: 'pointer', fontWeight: locale === key ? 700 : 400,
              }}>
                {LOCALE_FLAGS[key]} {key.toUpperCase()}
              </button>
            ))}
          </div>

          <a href="https://github.com/your-username/linkedin-post-generator" target="_blank" rel="noopener noreferrer"
            style={{ color: '#818cf8', fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            ⭐ GitHub →
          </a>
        </header>

        {/* ── Split body ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

          {/* LEFT: scrollable form */}
          <div style={{
            width: '45%', minWidth: 300, maxWidth: 560,
            borderRight: '1px solid #e2e8f0', overflowY: 'auto',
            background: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0,
          }}>
            <div style={{
              padding: '8px 16px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0',
              fontSize: 11, fontWeight: 700, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '.08em', flexShrink: 0,
            }}>
              {t.params}
            </div>

            <Section emoji="👤" title={t.sIdentity}>
              <div style={{ display: 'flex', gap: 8 }}>
                <TextInput label={t.firstName} value={form.firstName} onChange={v => set('firstName', v)} placeholder="Alex" />
                <TextInput label={t.lastName} value={form.lastName} onChange={v => set('lastName', v)} placeholder="Martin" />
              </div>
              <TextInput label={t.headline} value={form.headline} onChange={v => set('headline', v)} placeholder="Software Engineer @ Acme" />
              <TextInput label={t.timeAgo} value={form.timeAgo} onChange={v => set('timeAgo', v)} placeholder="• 2 h" />
            </Section>

            <Section emoji="✍️" title={t.sContent}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Label>{t.textLabel}</Label>
                <textarea
                  value={form.textMarkdown} onChange={e => set('textMarkdown', e.target.value)}
                  rows={6} placeholder={t.textPlaceholder}
                  style={{
                    padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6,
                    fontSize: 13, color: '#1e293b', background: '#fff', outline: 'none',
                    resize: 'vertical', fontFamily: 'inherit', width: '100%',
                  }}
                />
              </div>
            </Section>

            <Section emoji="📊" title={t.sStats}>
              <div style={{ display: 'flex', gap: 8 }}>
                <NumberInput label={t.reactions} value={form.reactions} onChange={v => set('reactions', v)} />
                <NumberInput label={t.comments} value={form.comments} onChange={v => set('comments', v)} />
                <NumberInput label={t.reposts} value={form.reposts} onChange={v => set('reposts', v)} />
              </div>
            </Section>

            <Section emoji="📐" title={t.sLayout}>
              <RadioGroup label={t.platform} value={form.platformStyle} onChange={v => set('platformStyle', v)}
                options={[
                  { value: 'windows', label: 'Windows' }, { value: 'mac', label: 'Mac' },
                  { value: 'ios', label: 'iOS' }, { value: 'android', label: 'Android' },
                ]}
              />
              <RadioGroup label={t.device} value={form.devicePreview} onChange={v => set('devicePreview', v)}
                options={[
                  { value: 'mobile', label: t.mobile }, { value: 'tablet', label: t.tablet },
                  { value: 'desktop', label: t.desktop },
                ]}
              />
              <RadioGroup label={t.previewMode} value={form.typePreview} onChange={v => set('typePreview', v)}
                options={[{ value: 'more', label: t.more }, { value: 'less', label: t.less }]}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <TextInput label={t.width} value={form.sizeWidth} onChange={v => set('sizeWidth', v)} placeholder="auto" />
                <TextInput label={t.height} value={form.sizeHeight} onChange={v => set('sizeHeight', v)} placeholder="auto" />
              </div>
            </Section>

            <Section emoji="🎨" title={t.sTheme} defaultOpen={false}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <ColorField label={t.background} value={form.themeBackground} onChange={v => set('themeBackground', v)} />
                <ColorField label={t.card} value={form.themeCard} onChange={v => set('themeCard', v)} />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <ColorField label={t.text} value={form.themeText} onChange={v => set('themeText', v)} />
                <ColorField label={t.subtext} value={form.themeSubtext} onChange={v => set('themeSubtext', v)} />
                <ColorField label={t.divider} value={form.themeDivider} onChange={v => set('themeDivider', v)} />
              </div>
            </Section>

            <Section emoji="🖼️" title={t.sAvatar} defaultOpen={false}>
              <RadioGroup label={t.avatarMode} value={form.avatarMode} onChange={v => set('avatarMode', v)}
                options={[
                  { value: 'url', label: t.avatarUrl }, { value: 'svg', label: t.avatarSvg },
                  { value: 'public', label: t.avatarPublic },
                ]}
              />
              {form.avatarMode === 'url' && (
                <TextInput label={t.imageUrl} value={form.profileImageUrl} onChange={v => set('profileImageUrl', v)} placeholder="https://…" />
              )}
              {form.avatarMode === 'svg' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Label>SVG markup</Label>
                  <textarea value={form.profileSvgMarkup} onChange={e => set('profileSvgMarkup', e.target.value)}
                    rows={3} placeholder="<svg …>…</svg>"
                    style={{
                      padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6,
                      fontSize: 12, color: '#1e293b', background: '#fff', outline: 'none',
                      resize: 'vertical', fontFamily: 'monospace', width: '100%',
                    }}
                  />
                </div>
              )}
              {form.avatarMode === 'public' && (
                <TextInput label={t.publicPath} value={form.profileSvgPublicPath}
                  onChange={v => set('profileSvgPublicPath', v)} placeholder="icons/avatar-default.svg" />
              )}
            </Section>

            <Section emoji="📎" title={t.sAttachments} defaultOpen={false}>
              {urls.map((url, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                  <TextInput label={t.imageN(i + 1)} value={url}
                    onChange={v => { const next = [...urls]; next[i] = v; set('attachmentsUrls', next) }}
                    placeholder="https://…"
                  />
                  <button onClick={() => set('attachmentsUrls', urls.filter((_, j) => j !== i))}
                    style={{
                      flexShrink: 0, padding: '6px 10px', border: '1px solid #fca5a5',
                      borderRadius: 6, background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: 13,
                    }}>
                    ✕
                  </button>
                </div>
              ))}
              {urls.length < 6 && (
                <button onClick={() => set('attachmentsUrls', [...urls, ''])}
                  style={{
                    padding: '6px 12px', border: '1px dashed #6366f1', borderRadius: 6,
                    background: '#fff', color: '#6366f1', cursor: 'pointer', fontSize: 13, alignSelf: 'flex-start',
                  }}>
                  {t.addUrl}
                </button>
              )}
            </Section>
          </div>

          {/* RIGHT: preview */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '8px 16px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0',
              fontSize: 11, fontWeight: 700, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '.08em',
              display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, flexShrink: 0, display: 'inline-block' }} />
              {t.livePreview}
              {imageUrl && (
                <button onClick={download} style={{
                  marginLeft: 'auto', padding: '3px 12px', background: '#6366f1', color: '#fff',
                  border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>
                  {t.download}
                </button>
              )}
            </div>

            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: '#f0f4f8', overflow: 'auto', padding: 24, gap: 12, position: 'relative',
            }}>
              {loading && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(248,250,252,.7)', zIndex: 10,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: '3px solid #e2e8f0', borderTopColor: '#6366f1',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                </div>
              )}

              {imageUrl ? (
                <img src={imageUrl} alt={t.imgAlt}
                  style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,.15)' }} />
              ) : !error ? (
                <div style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', userSelect: 'none' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🖼️</div>
                  {t.emptyState}
                </div>
              ) : null}

              {error && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8,
                  padding: '10px 16px', color: '#dc2626', fontSize: 13, maxWidth: 400, textAlign: 'center',
                }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
