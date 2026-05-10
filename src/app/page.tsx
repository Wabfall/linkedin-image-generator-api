'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type PlatformStyle = 'windows' | 'mac' | 'ios' | 'android'
type DevicePreview = 'mobile' | 'tablet' | 'desktop'
type TypePreview = 'more' | 'less'
type AvatarMode = 'url' | 'svg' | 'public'

type Form = {
  firstName: string
  lastName: string
  headline: string
  timeAgo: string
  textMarkdown: string
  reactions: number | ''
  comments: number | ''
  reposts: number | ''
  platformStyle: PlatformStyle
  devicePreview: DevicePreview
  typePreview: TypePreview
  sizeWidth: string
  sizeHeight: string
  themeBackground: string
  themeCard: string
  themeText: string
  themeSubtext: string
  themeDivider: string
  avatarMode: AvatarMode
  profileImageUrl: string
  profileSvgMarkup: string
  profileSvgPublicPath: string
  attachmentsUrls: string[]
}

const DEFAULTS: Form = {
  firstName: 'Alex',
  lastName: 'Martin',
  headline: 'Software Engineer @ Acme Corp',
  timeAgo: '• 2 h',
  textMarkdown:
    'Excited to share my **new open-source project** 🚀\n\nBuilt with #NextJS and #TypeScript.\n\n[Check it out on GitHub](https://github.com)',
  reactions: 247,
  comments: 38,
  reposts: 12,
  platformStyle: 'windows',
  devicePreview: 'desktop',
  typePreview: 'more',
  sizeWidth: '',
  sizeHeight: '',
  themeBackground: '#EEF2F5',
  themeCard: '#FFFFFF',
  themeText: '#000000e6',
  themeSubtext: '#00000099',
  themeDivider: '#E5E7EB',
  avatarMode: 'url',
  profileImageUrl: '',
  profileSvgMarkup: '',
  profileSvgPublicPath: '',
  attachmentsUrls: [],
}

// ─── Small reusable primitives ───────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em' }}>
      {children}
    </span>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '6px 8px',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  fontSize: 13,
  color: '#1e293b',
  background: '#fff',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
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
        type="number"
        min={0}
        value={value}
        onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        style={inputStyle}
      />
    </div>
  )
}

function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Label>{label}</Label>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid',
              borderColor: value === o.value ? '#6366f1' : '#cbd5e1',
              background: value === o.value ? '#6366f1' : '#fff',
              color: value === o.value ? '#fff' : '#475569',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: value === o.value ? 600 : 400,
            }}
          >
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
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            flexShrink: 0,
            border: '1px solid #cbd5e1',
            background: value || '#fff',
          }}
        />
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ ...inputStyle, fontSize: 12 }}
        />
      </div>
    </div>
  )
}

function Section({
  emoji,
  title,
  children,
  defaultOpen = true,
}: {
  emoji: string
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderBottom: '1px solid #e2e8f0' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 13,
          color: '#334155',
          textAlign: 'left',
        }}
      >
        <span>
          {emoji} {title}
        </span>
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
  const [form, setForm] = useState<Form>(DEFAULTS)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const blobRef = useRef<Blob | null>(null)

  const set = useCallback(<K extends keyof Form>(key: K, value: Form[K]) => {
    setForm(f => ({ ...f, [key]: value }))
  }, [])

  const generate = useCallback(async (f: Form) => {
    setLoading(true)
    setError(null)

    const body: Record<string, unknown> = {
      firstName: f.firstName,
      lastName: f.lastName,
      headline: f.headline || undefined,
      timeAgo: f.timeAgo || undefined,
      textMarkdown: f.textMarkdown,
      reactions: f.reactions === '' ? undefined : f.reactions,
      comments: f.comments === '' ? undefined : f.comments,
      reposts: f.reposts === '' ? undefined : f.reposts,
      platformStyle: f.platformStyle,
      devicePreview: f.devicePreview,
      typePreview: f.typePreview,
      theme: {
        background: f.themeBackground,
        card: f.themeCard,
        text: f.themeText,
        subtext: f.themeSubtext,
        divider: f.themeDivider,
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
        setError(json.error ?? 'Erreur inconnue')
        return
      }

      const blob = await res.blob()
      blobRef.current = blob
      const url = URL.createObjectURL(blob)
      setImageUrl(prev => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!form.firstName.trim() || !form.lastName.trim() || !form.textMarkdown.trim()) return

    timerRef.current = setTimeout(() => {
      void generate(form)
    }, 500)

    return () => clearTimeout(timerRef.current)
  }, [form, generate])

  function download() {
    if (!blobRef.current) return
    const a = document.createElement('a')
    const url = URL.createObjectURL(blobRef.current)
    a.href = url
    a.download = 'linkedin-post.png'
    a.click()
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
        input:focus, textarea:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 2px rgba(99,102,241,.15);
        }
        button:focus-visible { outline: 2px solid #6366f1; outline-offset: 2px; }
      `}</style>

      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* ── Header ── */}
        <header
          style={{
            background: '#1e293b',
            color: '#f1f5f9',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            height: 52,
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 800, fontSize: 16, color: '#818cf8', whiteSpace: 'nowrap' }}>
            LinkedIn Post Generator
          </span>
          <span style={{ color: '#64748b', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Génère des aperçus PNG de posts LinkedIn depuis un payload JSON
          </span>
          <a
            href="https://github.com/votre-username/linkedin-post-generator"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: 'auto', color: '#818cf8', fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            ⭐ GitHub →
          </a>
        </header>

        {/* ── Split body ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

          {/* LEFT: scrollable form */}
          <div
            style={{
              width: '45%',
              minWidth: 300,
              maxWidth: 560,
              borderRight: '1px solid #e2e8f0',
              overflowY: 'auto',
              background: '#fff',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: '8px 16px',
                background: '#f1f5f9',
                borderBottom: '1px solid #e2e8f0',
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '.08em',
                flexShrink: 0,
              }}
            >
              Paramètres
            </div>

            <Section emoji="👤" title="Identité">
              <div style={{ display: 'flex', gap: 8 }}>
                <TextInput label="Prénom *" value={form.firstName} onChange={v => set('firstName', v)} placeholder="Alex" />
                <TextInput label="Nom *" value={form.lastName} onChange={v => set('lastName', v)} placeholder="Martin" />
              </div>
              <TextInput label="Titre (headline)" value={form.headline} onChange={v => set('headline', v)} placeholder="Software Engineer @ Acme" />
              <TextInput label="Temps affiché" value={form.timeAgo} onChange={v => set('timeAgo', v)} placeholder="• 2 h" />
            </Section>

            <Section emoji="✍️" title="Contenu">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Label>Texte du post * (markdown : **gras**, *italique*, #hashtag, [lien](url))</Label>
                <textarea
                  value={form.textMarkdown}
                  onChange={e => set('textMarkdown', e.target.value)}
                  rows={6}
                  placeholder="Votre texte ici…"
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    fontSize: 13,
                    color: '#1e293b',
                    background: '#fff',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    width: '100%',
                  }}
                />
              </div>
            </Section>

            <Section emoji="📊" title="Statistiques">
              <div style={{ display: 'flex', gap: 8 }}>
                <NumberInput label="Réactions" value={form.reactions} onChange={v => set('reactions', v)} />
                <NumberInput label="Commentaires" value={form.comments} onChange={v => set('comments', v)} />
                <NumberInput label="Reposts" value={form.reposts} onChange={v => set('reposts', v)} />
              </div>
            </Section>

            <Section emoji="📐" title="Layout">
              <RadioGroup
                label="Plateforme"
                value={form.platformStyle}
                onChange={v => set('platformStyle', v)}
                options={[
                  { value: 'windows', label: 'Windows' },
                  { value: 'mac', label: 'Mac' },
                  { value: 'ios', label: 'iOS' },
                  { value: 'android', label: 'Android' },
                ]}
              />
              <RadioGroup
                label="Appareil"
                value={form.devicePreview}
                onChange={v => set('devicePreview', v)}
                options={[
                  { value: 'mobile', label: 'Mobile (800px)' },
                  { value: 'tablet', label: 'Tablet (1000px)' },
                  { value: 'desktop', label: 'Desktop (1200px)' },
                ]}
              />
              <RadioGroup
                label="Mode aperçu"
                value={form.typePreview}
                onChange={v => set('typePreview', v)}
                options={[
                  { value: 'more', label: 'More (complet)' },
                  { value: 'less', label: 'Less (tronqué)' },
                ]}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <TextInput label="Largeur (px)" value={form.sizeWidth} onChange={v => set('sizeWidth', v)} placeholder="auto" />
                <TextInput label="Hauteur (px ou auto)" value={form.sizeHeight} onChange={v => set('sizeHeight', v)} placeholder="auto" />
              </div>
            </Section>

            <Section emoji="🎨" title="Thème" defaultOpen={false}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <ColorField label="Background" value={form.themeBackground} onChange={v => set('themeBackground', v)} />
                <ColorField label="Card" value={form.themeCard} onChange={v => set('themeCard', v)} />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <ColorField label="Texte" value={form.themeText} onChange={v => set('themeText', v)} />
                <ColorField label="Sous-texte" value={form.themeSubtext} onChange={v => set('themeSubtext', v)} />
                <ColorField label="Séparateur" value={form.themeDivider} onChange={v => set('themeDivider', v)} />
              </div>
            </Section>

            <Section emoji="🖼️" title="Avatar" defaultOpen={false}>
              <RadioGroup
                label="Mode"
                value={form.avatarMode}
                onChange={v => set('avatarMode', v)}
                options={[
                  { value: 'url', label: 'URL distante' },
                  { value: 'svg', label: 'SVG markup' },
                  { value: 'public', label: 'Fichier public' },
                ]}
              />
              {form.avatarMode === 'url' && (
                <TextInput
                  label="URL de l'image"
                  value={form.profileImageUrl}
                  onChange={v => set('profileImageUrl', v)}
                  placeholder="https://…"
                />
              )}
              {form.avatarMode === 'svg' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Label>SVG markup</Label>
                  <textarea
                    value={form.profileSvgMarkup}
                    onChange={e => set('profileSvgMarkup', e.target.value)}
                    rows={3}
                    placeholder="<svg …>…</svg>"
                    style={{
                      padding: '6px 8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      fontSize: 12,
                      color: '#1e293b',
                      background: '#fff',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'monospace',
                      width: '100%',
                    }}
                  />
                </div>
              )}
              {form.avatarMode === 'public' && (
                <TextInput
                  label="Chemin dans /public"
                  value={form.profileSvgPublicPath}
                  onChange={v => set('profileSvgPublicPath', v)}
                  placeholder="icons/avatar-default.svg"
                />
              )}
            </Section>

            <Section emoji="📎" title="Pièces jointes (URLs)" defaultOpen={false}>
              {urls.map((url, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                  <TextInput
                    label={`Image ${i + 1}`}
                    value={url}
                    onChange={v => {
                      const next = [...urls]
                      next[i] = v
                      set('attachmentsUrls', next)
                    }}
                    placeholder="https://…"
                  />
                  <button
                    onClick={() => set('attachmentsUrls', urls.filter((_, j) => j !== i))}
                    style={{
                      flexShrink: 0,
                      padding: '6px 10px',
                      border: '1px solid #fca5a5',
                      borderRadius: 6,
                      background: '#fff',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: 13,
                      marginBottom: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {urls.length < 6 && (
                <button
                  onClick={() => set('attachmentsUrls', [...urls, ''])}
                  style={{
                    padding: '6px 12px',
                    border: '1px dashed #6366f1',
                    borderRadius: 6,
                    background: '#fff',
                    color: '#6366f1',
                    cursor: 'pointer',
                    fontSize: 13,
                    alignSelf: 'flex-start',
                  }}
                >
                  + Ajouter une URL
                </button>
              )}
            </Section>
          </div>

          {/* RIGHT: sticky preview */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: '8px 16px',
                background: '#f1f5f9',
                borderBottom: '1px solid #e2e8f0',
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '.08em',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, flexShrink: 0, display: 'inline-block' }} />
              Prévisualisation live
              {imageUrl && (
                <button
                  onClick={download}
                  style={{
                    marginLeft: 'auto',
                    padding: '3px 12px',
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ⬇ Télécharger PNG
                </button>
              )}
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f0f4f8',
                overflow: 'auto',
                padding: 24,
                gap: 12,
                position: 'relative',
              }}
            >
              {loading && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(248,250,252,.7)',
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      border: '3px solid #e2e8f0',
                      borderTopColor: '#6366f1',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                </div>
              )}

              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Aperçu du post LinkedIn généré"
                  style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,.15)' }}
                />
              ) : !error ? (
                <div style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', userSelect: 'none' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🖼️</div>
                  Remplis les champs <strong>Prénom</strong>, <strong>Nom</strong> et <strong>Texte</strong> pour générer l&apos;aperçu
                </div>
              ) : null}

              {error && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderRadius: 8,
                    padding: '10px 16px',
                    color: '#dc2626',
                    fontSize: 13,
                    maxWidth: 400,
                    textAlign: 'center',
                  }}
                >
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
