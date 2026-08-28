import type { Language } from '@/types'

export function Button({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }) {
  const styles = variant === 'primary' ? 'bg-ink text-white hover:bg-[#235242]' : 'border border-ink/20 bg-white text-ink hover:bg-ink/5'
  return <button className={`rounded-full px-5 py-3 font-semibold transition duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`} {...props}>{children}</button>
}
export function ExternalLink({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  return <a className={`inline-flex rounded-full bg-leaf px-5 py-3 font-semibold text-white transition hover:brightness-95 focus-visible:outline ${className}`} href={href} target="_blank" rel="noopener noreferrer">{children} <span aria-hidden="true">↗</span></a>
}
export function LanguageToggle({ language, onChange }: { language: Language; onChange: (l: Language) => void }) {
  return <div className="flex rounded-full border border-ink/15 bg-cream p-1 text-sm shadow-sm" aria-label="Language selector"><button aria-pressed={language === 'en'} onClick={() => onChange('en')} className={`rounded-full px-3 py-1.5 transition ${language === 'en' ? 'bg-ink text-white' : 'text-ink/70'}`}>EN</button><button aria-pressed={language === 'id'} onClick={() => onChange('id')} className={`rounded-full px-3 py-1.5 transition ${language === 'id' ? 'bg-ink text-white' : 'text-ink/70'}`}>ID</button></div>
}
export function ProgressBar({ current, total = 16 }: { current: number; total?: number }) {
  const safeTotal = Math.max(total, 1)
  const clampedCurrent = Math.min(Math.max(current, 0), safeTotal)

  return <div className="h-2 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuemin={1} aria-valuemax={safeTotal} aria-valuenow={clampedCurrent}><div className="h-full rounded-full bg-coral transition-all duration-500" style={{ width: `${(clampedCurrent / safeTotal) * 100}%` }} /></div>
}
export function VideoEmbed({
  src,
  title,
  onEnded,
  onSeeking,
  onTimeUpdate,
}: {
  src: string
  title: string
  onEnded?: () => void
  onSeeking?: (event: { currentTarget: HTMLVideoElement }) => void
  onTimeUpdate?: (event: { currentTarget: HTMLVideoElement }) => void
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-ink/10 bg-ink/5">
      <video
        className="aspect-video w-full bg-black"
        src={src}
        title={title}
        controls
        playsInline
        preload="metadata"
        onEnded={onEnded}
        onSeeking={onSeeking}
        onTimeUpdate={onTimeUpdate}
      />
    </div>
  )
}
