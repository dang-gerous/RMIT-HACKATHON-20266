import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useStore, countdown, type Doc } from '../store'
import { Badge, Card, btnGhost, btnPrimary, btnSun } from './ui'

const CATEGORIES = ['ID', 'Income', 'Identity', 'Study', 'Other']

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)

const cipherOf = (d: Doc) => cipher(d.image ? d.id + d.image.slice(-48) : d.content)
const cipher = (s: string) => btoa(unescape(encodeURIComponent(s))).slice(0, 36) + '…'

function DocRow({ doc }: { doc: Doc }) {
  const { state, me, now, requestAccess, approve, deny, revoke } = useStore()
  const [asking, setAsking] = useState(false)
  const [reason, setReason] = useState('')
  const [reveal, setReveal] = useState(false)
  const owner = state.users.find((u) => u.id === doc.ownerId)
  const isOwner = me?.id === doc.ownerId
  const isLandlord = me?.role === 'landlord'
  const visible = doc.status === 'granted' ? isLandlord || isOwner : isOwner && reveal

  const badge =
    doc.status === 'granted' ? (
      <Badge tone="blue">Open · {countdown((doc.expiresAt ?? now) - now)}</Badge>
    ) : doc.status === 'requested' ? (
      <Badge tone="yellow">Access requested</Badge>
    ) : (
      <Badge tone="gray">Locked</Badge>
    )

  return (
    <li className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <LockIcon />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-semibold">{doc.title}</p>
            {badge}
          </div>
          <p className="text-sm text-ink-soft">
            {isOwner ? 'You' : owner?.name} · {doc.category}
          </p>

          <div className="mt-3 rounded-xl bg-canvas px-4 py-3 text-sm">
            {visible ? (
              <div className="space-y-2">
                {doc.image && <img src={doc.image} alt={doc.title} className="max-h-72 w-full rounded-lg object-contain bg-ink/5" />}
                {doc.content && <p className="font-medium">{doc.content}</p>}
              </div>
            ) : (
              <p className="font-mono text-xs break-all text-ink-soft">{cipherOf(doc)}</p>
            )}
          </div>

          {doc.reason && doc.status !== 'locked' && (
            <p className="mt-2 text-sm text-ink-soft">
              <span className="font-semibold text-ink">Reason:</span> {doc.reason}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {isOwner && doc.status === 'locked' && (
              <button className={btnGhost} onClick={() => setReveal(!reveal)}>
                {reveal ? 'Hide' : 'View my copy'}
              </button>
            )}
            {isOwner && doc.status === 'requested' && (
              <>
                <button className={btnPrimary} onClick={() => approve(doc.id)}>
                  Allow for 24 hours
                </button>
                <button className={btnGhost} onClick={() => deny(doc.id)}>
                  Decline
                </button>
              </>
            )}
            {isOwner && doc.status === 'granted' && (
              <button className={btnGhost} onClick={() => revoke(doc.id)}>
                Revoke access now
              </button>
            )}
            {isLandlord && doc.status === 'locked' && !asking && (
              <button className={btnSun} onClick={() => setAsking(true)}>
                Request access
              </button>
            )}
          </div>

          {asking && (
            <form
              className="mt-3 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                if (!reason.trim()) return
                requestAccess(doc.id, reason.trim())
                setAsking(false)
                setReason('')
              }}
            >
              <input
                autoFocus
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why do you need this? (e.g. residence registration)"
                className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
              <div className="flex gap-2">
                <button type="submit" className={btnPrimary}>
                  Send · 24h
                </button>
                <button type="button" className={btnGhost} onClick={() => setAsking(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </li>
  )
}

function Upload() {
  const { addDoc } = useStore()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [content, setContent] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [camError, setCamError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraOn(false)
  }
  useEffect(() => stopCamera, [])
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current
  }, [cameraOn])

  const openCamera = async () => {
    setCamError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError('Camera is not available in this browser. Choose a photo instead.')
      return
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      setPhoto(null)
      setCameraOn(true)
    } catch {
      setCamError('Camera access was blocked. Allow it in your browser settings, or choose a photo instead.')
    }
  }

  const shrink = (src: CanvasImageSource, w: number, h: number) => {
    const scale = Math.min(1, 1000 / Math.max(w, h))
    const c = document.createElement('canvas')
    c.width = Math.round(w * scale)
    c.height = Math.round(h * scale)
    c.getContext('2d')?.drawImage(src, 0, 0, c.width, c.height)
    return c.toDataURL('image/jpeg', 0.7)
  }

  const capture = () => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    setPhoto(shrink(v, v.videoWidth, v.videoHeight))
    stopCamera()
  }

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    const img = new Image()
    const url = URL.createObjectURL(f)
    img.onload = () => {
      setPhoto(shrink(img, img.naturalWidth, img.naturalHeight))
      URL.revokeObjectURL(url)
      setCamError(null)
    }
    img.src = url
  }

  const canSave = title.trim() && (content.trim() || photo)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    addDoc(title.trim(), category, content.trim(), photo ?? undefined)
    setTitle('')
    setContent('')
    setPhoto(null)
  }
  const input =
    'w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100'

  return (
    <Card>
      <h2 className="text-lg font-bold">Add a document</h2>
      <p className="text-sm text-ink-soft">It's encrypted on your device. Your landlord can't open it unless you say so.</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
          <input className={input} placeholder="Title, e.g. Passport" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className={input} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {cameraOn ? (
          <div className="overflow-hidden rounded-xl bg-ink">
            <video ref={videoRef} autoPlay playsInline muted className="max-h-80 w-full object-contain" />
            <div className="flex justify-center gap-2 bg-ink p-3">
              <button type="button" className={btnSun} onClick={capture}>
                Take photo
              </button>
              <button type="button" className="rounded-xl px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10" onClick={stopCamera}>
                Cancel
              </button>
            </div>
          </div>
        ) : photo ? (
          <div className="relative overflow-hidden rounded-xl bg-canvas">
            <img src={photo} alt="Captured document" className="max-h-64 w-full object-contain" />
            <div className="absolute top-2 right-2 flex gap-2">
              <button type="button" className={btnGhost + ' !py-1.5'} onClick={openCamera}>
                Retake
              </button>
              <button type="button" className={btnGhost + ' !py-1.5'} onClick={() => setPhoto(null)}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-line p-4">
            <button type="button" className={btnSun + ' inline-flex items-center gap-2'} onClick={openCamera}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
              Use camera
            </button>
            <button type="button" className="text-sm font-semibold text-brand-600 hover:underline" onClick={() => fileRef.current?.click()}>
              or choose a photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          </div>
        )}
        {camError && (
          <p role="alert" className="rounded-xl bg-sun-100 px-4 py-3 text-sm font-medium">
            {camError}
          </p>
        )}

        <textarea className={input} rows={2} placeholder="Notes or document details (optional with a photo)" value={content} onChange={(e) => setContent(e.target.value)} />
        <button type="submit" className={btnPrimary} disabled={!canSave}>
          Encrypt & save
        </button>
      </form>
    </Card>
  )
}

export default function DocsView() {
  const { state, me } = useStore()
  const isLandlord = me?.role === 'landlord'
  const docs = state.docs
    .filter((d) => isLandlord || d.ownerId === me?.id)
    .sort((a, b) => Number(b.status === 'requested') - Number(a.status === 'requested'))

  return (
    <div className="space-y-6">
      {!isLandlord && <Upload />}
      <Card>
        <h2 className="text-lg font-bold">{isLandlord ? 'Tenant documents' : 'My documents'}</h2>
        <p className="mb-5 text-sm text-ink-soft">
          {isLandlord
            ? 'Documents stay locked. Ask a tenant for time-limited access when you need one.'
            : 'Approve or decline requests. Access ends automatically after 24 hours.'}
        </p>
        {docs.length === 0 ? (
          <p className="rounded-xl bg-canvas px-4 py-8 text-center text-sm text-ink-soft">No documents yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {docs.map((d) => (
              <DocRow key={d.id} doc={d} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
