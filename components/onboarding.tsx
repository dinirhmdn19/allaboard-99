'use client'
import { useEffect, useRef, useState } from 'react'
import { steps } from '@/config/steps'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { clearSession, getLanguage, getSession, saveLanguage, saveSession } from '@/lib/session'
import { translations } from '@/translations'
import type { Employee, Language, OnboardingVideo } from '@/types'
import { Button, ExternalLink, LanguageToggle, ProgressBar, VideoEmbed } from './ui'

const TEAM_URL = 'https://script.google.com/a/macros/99.co/s/AKfycbz_Jc4g49bqxmcxW_6TtCIgv2NFthp6lNEj_Yrk9IE5jd_rxO1taTEKRR3g5B99UtVc/exec?pli=1'
const REQUIRED_VIDEO_STEPS = new Set([4, 5, 6, 7])
const VIDEO_URLS: Record<number, string> = {
  4: 'https://jjxkerecburodqgabafh.supabase.co/storage/v1/object/public/videos/videos:step-3.mp4',
  5: 'https://jjxkerecburodqgabafh.supabase.co/storage/v1/object/public/videos/videos:step-4.mp4',
  6: 'https://jjxkerecburodqgabafh.supabase.co/storage/v1/object/public/videos/videos:step-5.mp4',
  7: 'https://jjxkerecburodqgabafh.supabase.co/storage/v1/object/public/videos/videos:step-6.mp4',
}
const DEPARTMENT_MATCHES: Array<{ title: string; keywords: string[]; url: string }> = [
  { title: 'Product', keywords: ['product'], url: 'https://sites.google.com/99.co/99ers-home/about-the-team/regional/product' },
  { title: 'Engineering', keywords: ['engineering'], url: 'https://sites.google.com/99.co/99ers-home/about-the-team/regional/engineering' },
  { title: 'Data', keywords: ['data'], url: 'https://sites.google.com/99.co/99ers-home/about-the-team/regional/data' },
  { title: 'Marketing', keywords: ['marketing'], url: 'https://sites.google.com/99.co/99ers-home/about-the-team/regional/marketing' },
  { title: 'Finance', keywords: ['finance'], url: 'https://sites.google.com/99.co/99ers-home/about-the-team/regional/finance' },
  { title: 'People', keywords: ['people'], url: 'https://sites.google.com/99.co/99ers-home/about-the-team/regional/people' },
  { title: 'ARMs', keywords: ['arms'], url: 'https://sites.google.com/99.co/99ers-home/about-the-team/singapore/arms' },
  { title: 'Performance Marketing', keywords: ['performance marketing', 'performance'], url: 'https://sites.google.com/99.co/99ers-home/about-the-team/singapore/performance-marketing' },
  { title: 'Partner Success Group', keywords: ['partner success', 'partner'], url: 'https://sites.google.com/99.co/99ers-home/about-the-team/singapore/partner-success-group' },
  { title: 'Listing Business', keywords: ['listing business', 'listing'], url: 'https://sites.google.com/99.co/99ers-home/about-the-team/indonesia/listing-business' },
  { title: 'Developer Business', keywords: ['developer business', 'developer'], url: 'https://sites.google.com/99.co/99ers-home/about-the-team/indonesia/developer-business' },
  { title: 'Bank and Media Sales', keywords: ['bank media', 'bank and media sales', 'media sales'], url: 'https://sites.google.com/99.co/99ers-home/about-the-team/indonesia/bank-media-sales' },
]

type EndingSocialLink = { label: string; href: string; icon: string }
type EndingStoreLink = { href: string; icon: string; label: string; name: string }
type EndingSocialGroup = { title: string; links: EndingSocialLink[] }

type EndingSection = {
  title: string
  logo: string
  website?: { label: string; href: string }
  appCopy?: string
  appLinks?: EndingStoreLink[]
  socialTitle?: string
  socialLinks?: EndingSocialLink[]
  socialGroups?: EndingSocialGroup[]
}

const ENDING_PAGE_SECTIONS: EndingSection[] = [
  {
    title: '99 GROUP',
    logo: '/images/platforms/99-group-logo.svg',
    socialTitle: 'Social Media:',
    socialLinks: [
      { label: 'Instagram', href: 'https://www.instagram.com/lifeat99group/', icon: '/images/platforms/instagram-icon.svg' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/99-co', icon: '/images/platforms/linkedin-icon.svg' },
      { label: 'TikTok', href: 'https://www.tiktok.com/@lifeat99group', icon: '/images/platforms/tiktok-icon.svg' },
    ],
  },
  {
    title: 'RUMAH123',
    logo: '/images/platforms/rumah123-logo.svg',
    website: { label: 'Go to Rumah123 Site', href: 'http://rumah123.com/' },
    appCopy: "Download Rumah123's app on mobile.",
    appLinks: [
      { name: 'Apple App Store', label: 'App Store', href: 'https://apps.apple.com/id/app/rumah123-com/id644854546', icon: '/images/platforms/apple-store-icon.svg' },
      { name: 'Google Play', label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.rumah123', icon: '/images/platforms/google-play-icon.svg' },
    ],
    socialTitle: 'Social Media:',
    socialLinks: [
      { label: 'Instagram', href: 'http://instagram.com/rumah123com/', icon: '/images/platforms/instagram-icon.svg' },
      { label: 'LinkedIn', href: 'http://linkedin.com/company/rumah123', icon: '/images/platforms/linkedin-icon.svg' },
      { label: 'TikTok', href: 'https://www.tiktok.com/@rumah123com', icon: '/images/platforms/tiktok-icon.svg' },
      { label: 'YouTube', href: 'https://www.youtube.com/channel/UCQRpkeIymZhbrMHsvgRxf2Q?sub_confirmation=1', icon: '/images/platforms/youtube-icon.svg' },
      { label: 'X', href: 'https://twitter.com/rumah123', icon: '/images/platforms/x-icon.svg' },
      { label: 'Facebook', href: 'https://www.facebook.com/Rumah123/', icon: '/images/platforms/facebook-icon.svg' },
    ],
  },
  {
    title: '99.CO',
    logo: '/images/platforms/99co-logo.svg',
    website: { label: 'Go to 99.co Site', href: 'http://99.co/' },
    appCopy: "Download 99.co's app on mobile.",
    appLinks: [
      { name: 'Apple App Store', label: 'App Store', href: 'https://apps.apple.com/cn/app/99-co-indonesia/id787339517?l=en', icon: '/images/platforms/apple-store-icon.svg' },
      { name: 'Google Play', label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.urbanindo.android&hl=en&gl=US', icon: '/images/platforms/google-play-icon.svg' },
    ],
    socialGroups: [
      {
        title: 'Indonesia',
        links: [
          { label: 'Indonesia Instagram', href: 'https://www.instagram.com/99indonesia/', icon: '/images/platforms/instagram-icon.svg' },
          { label: 'Indonesia YouTube', href: 'https://bit.ly/42N7VFz', icon: '/images/platforms/youtube-icon.svg' },
          { label: 'Indonesia X', href: 'https://twitter.com/99dotco_IDN', icon: '/images/platforms/x-icon.svg' },
          { label: 'Indonesia Facebook', href: 'https://www.facebook.com/99indonesia', icon: '/images/platforms/facebook-icon.svg' },
        ],
      },
      {
        title: 'Singapore',
        links: [
          { label: 'Singapore Instagram', href: 'https://www.instagram.com/99.co', icon: '/images/platforms/instagram-icon.svg' },
          { label: 'Singapore YouTube', href: 'https://www.youtube.com/channel/UCTFNrxXF9L1XZUlZNq07VKA', icon: '/images/platforms/youtube-icon.svg' },
          { label: 'Singapore TikTok', href: 'https://www.tiktok.com/@99dotco', icon: '/images/platforms/tiktok-icon.svg' },
          { label: 'Singapore Facebook', href: 'https://www.facebook.com/99dotco', icon: '/images/platforms/facebook-icon.svg' },
        ],
      },
    ],
  },
  {
    title: 'SRX',
    logo: '/images/platforms/srx-logo.svg',
    website: { label: 'Go to SRX Site', href: 'https://www.srx.com.sg/' },
  },
]

const REFLECTION_STEP_NUMBER = steps.find((step) => step.kind === 'reflection')?.number ?? 14
const RATING_STEP_NUMBER = steps.find((step) => step.kind === 'complete')?.number ?? 15

function normalizeDepartmentName(value: string | null | undefined) {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getDepartmentOnboarding(department: string | null) {
  const normalized = normalizeDepartmentName(department)
  const found = DEPARTMENT_MATCHES.find((departmentEntry) =>
    departmentEntry.keywords.some((keyword) => normalized.includes(keyword))
  )
  return {
    title: found?.title || department || 'Department',
    url: found?.url ?? null,
    found: Boolean(found),
  }
}

function SocialButton({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white transition hover:border-ink/30 hover:bg-white"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
      <img src={icon} alt={label} className="h-5 w-5" />
    </a>
  )
}

function StoreButton({ href, label, name, icon }: { href: string; label: string; name: string; icon: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} ${label}`}
      className="inline-flex h-12 min-w-[162px] items-center justify-center gap-2 rounded-full border border-ink/20 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-ink/5"
    >
      <img src={icon} alt="" className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
      <span className="text-xs" aria-hidden="true">↗︎</span>
    </a>
  )
}

function EndingPlatformIconLinks({ links }: { links: EndingSocialLink[] }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {links.map((item) => (
        <SocialButton key={`${item.label}-${item.href}`} href={item.href} label={item.label} icon={item.icon} />
      ))}
    </div>
  )
}

function EndingLandingSection({ section }: { section: EndingSection }) {
  return (
    <article className="mx-auto w-full max-w-2xl space-y-5 rounded-2xl border border-ink/10 bg-white p-5 text-center">
      <EndingSectionLogo section={section} />
      {section.website ? (
        <ExternalLink href={section.website.href}>
          {section.website.label}
        </ExternalLink>
      ) : null}
      {section.appCopy ? <p className="text-base text-ink/70">{section.appCopy}</p> : null}
      {section.appLinks ? (
        <div className="flex flex-wrap justify-center gap-2.5">
          {section.appLinks.map((app) => (
            <StoreButton key={`${section.title}-${app.label}`} href={app.href} label={app.label} name={app.name} icon={app.icon} />
          ))}
        </div>
      ) : null}
      {section.socialTitle ? <p className="text-xs font-bold uppercase tracking-[.16em] text-ink/60">{section.socialTitle}</p> : null}
      {section.socialLinks ? <EndingPlatformIconLinks links={section.socialLinks} /> : null}
      {section.socialGroups ? (
        <div className="space-y-4">
          {section.socialGroups.map((group) => (
            <div key={`${section.title}-${group.title}`} className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-ink/60">{group.title}</p>
              <EndingPlatformIconLinks links={group.links} />
            </div>
          ))}
        </div>
      ) : null}
    </article>
  )
}

function EndingSectionLogo({ section }: { section: EndingSection }) {
  return (
    <img
      src={section.logo}
      alt={section.title}
      className="mx-auto h-12 w-auto object-contain sm:h-14"
      loading="lazy"
    />
  )
}

function EndingLandingPage({ employee, onSignOut, language, onChangeLanguage }: { employee: Employee; onSignOut: () => void; language: Language; onChangeLanguage: (language: Language) => void }) {
  const dept = getDepartmentOnboarding(employee.department)

  return (
    <main className="mx-auto min-h-screen max-w-4xl p-4 sm:p-8">
      <header className="mb-6 flex items-center justify-between">
        <p className="inline-flex rounded-full bg-cream px-4 py-2 text-xl font-black tracking-tight">AllAboard!<span className="text-coral">@99</span></p>
        <LanguageToggle language={language} onChange={onChangeLanguage} />
      </header>

      <section className="min-h-[580px] rounded-[2rem] bg-cream p-6 shadow-soft sm:p-10">
        <div className="mb-9">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-leaf">Onboarding is complete</p>
        </div>

        <section className="mb-12 space-y-2">
          <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">You&apos;re all set.</h1>
          <div className="mt-4 max-w-3xl text-base leading-relaxed text-ink/70 sm:text-lg">
            <p>Your onboarding is complete.</p>
            <p>Now you&apos;re ready for your #YourWayHome journey at the 99 Group.</p>
          </div>
        </section>

        <section className="space-y-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-ink">Explore Our Platforms!</h2>
            <p className="max-w-2xl text-base leading-relaxed text-ink/70">
              Scroll through our platforms via websites, connect with us on social media, or download our mobile apps!
            </p>
          </div>

          <div className="space-y-10">
            {ENDING_PAGE_SECTIONS.map((section) => (
              <EndingLandingSection key={section.title} section={section} />
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-3">
          <h2 className="text-2xl font-bold text-ink">Begin your department onboarding.</h2>
          <p className="max-w-2xl text-base leading-relaxed text-ink/70">Department: {dept.title}</p>
          {dept.found ? (
            <>
              <p className="max-w-2xl text-base leading-relaxed text-ink/70">If the embedded page cannot be loaded, use the button below.</p>
              <iframe
                title="Department onboarding"
                src={dept.url as string}
                className="mt-4 h-64 w-full rounded-xl border border-ink/15"
                loading="lazy"
              />
              <ExternalLink href={dept.url as string}>Open Site in a New Tab</ExternalLink>
            </>
          ) : (
            <p className="rounded-xl bg-ink/5 p-4 text-sm text-ink">
              We couldn&apos;t match an exact department onboarding page. Use the links above to open the general 99ers onboarding hub.
            </p>
          )}
        </section>

        <section className="mt-12 space-y-3">
          <h2 className="text-2xl font-bold text-ink">Ready to take your Online Meetings?</h2>
          <p className="max-w-2xl text-base leading-relaxed text-ink/70">Use our virtual backgrounds to keep your meetings on-brand.</p>
          <ExternalLink href="https://sites.google.com/99.co/99ers-home/brand-assets-template#h.rrq9ebn8zv2n">
            Pick and Download now
          </ExternalLink>
        </section>

        <button onClick={onSignOut} className="mt-10 text-xs font-semibold text-ink/60 underline">
          Sign out
        </button>
      </section>
    </main>
  )
}
const SYSTEMS_CHECK_STEP_NUMBER = 3
const SYSTEMS_CHECK_QUESTIONS = [
  { id: 'slack', label: 'Have you installed Slack on your device?' },
  { id: 'talentaMobile', label: '[Indonesia only] Have you installed Talenta on your mobile phone?' },
  { id: 'talentaClock', label: '[Indonesia only] Have you tried clocking in on Talenta?' },
  { id: 'whyzehr', label: '[Singapore only] Can you access your WhyzeHR account?' },
] as const
const INITIAL_SYSTEMS_CHECK_RESPONSES = {
  slack: { answer: '', issue: '' },
  talentaMobile: { answer: '', issue: '' },
  talentaClock: { answer: '', issue: '' },
  whyzehr: { answer: '', issue: '' },
}
type SystemsCheckAnswer = 'yes' | 'no' | ''
type SystemsCheckResponse = {
  answer: SystemsCheckAnswer
  issue: string
}
type SystemsCheckState = typeof INITIAL_SYSTEMS_CHECK_RESPONSES
type SystemsCheckStorageRow = {
  question_key: keyof SystemsCheckState
  answer: SystemsCheckAnswer
  issue: string | null
}

export default function Onboarding() {
  const [language, setLanguage] = useState<Language>('en'); const [employee, setEmployee] = useState<Employee | null>(null)
  const [current, setCurrent] = useState(1); const [completed, setCompleted] = useState<number[]>([]); const [ready, setReady] = useState(false)
  const [videos, setVideos] = useState<OnboardingVideo[]>([])
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const [declarationStatus, setDeclarationStatus] = useState<'idle' | 'checking' | 'found' | 'not_found' | 'error'>('idle')
  const [onboardingCompletedAt, setOnboardingCompletedAt] = useState<string | null>(null)
  const [reflectionSaved, setReflectionSaved] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [systemsCheckSubmitted, setSystemsCheckSubmitted] = useState(false)
  const [systemsCheckResponses, setSystemsCheckResponses] = useState<SystemsCheckState>(INITIAL_SYSTEMS_CHECK_RESPONSES)
  const declarationPollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const declarationPollActiveRef = useRef(false)
  const t = translations[language]; const step = steps[current - 1]
  const DECLARATION_POLL_INTERVAL_MS = 10_000
  const DECLARATION_POLL_TIMEOUT_MS = 45_000

  const clearCallbackFromUrl = () => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    url.search = ''
    url.hash = ''
    window.history.replaceState({}, '', url.toString())
  }
  const getAuthError = (errorDescription: string | null, errorCode: string | null) => {
    if (errorDescription) return errorDescription
    if (errorCode) return `Sign-in failed: ${errorCode}`
    return 'Unable to sign in with Google. Please try again or contact the People Team.'
  }
  async function handleOAuthCallback() {
    if (!supabase || typeof window === 'undefined') return false

    const url = new URL(window.location.href)
    const params = url.searchParams
    const error = params.get('error')
    const errorDescription = params.get('error_description')

    if (error) {
      setError(getAuthError(errorDescription, error))
      clearCallbackFromUrl()
      return false
    }

    const authCode = params.get('code')
    if (authCode) {
      const exchangeCode = params.get('sb_flow_id')
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode, exchangeCode ? { flowId: exchangeCode } : undefined)

      if (exchangeError) {
        console.error('Failed exchangeCodeForSession', exchangeError)
        setError('Unable to establish Google session. Please try again or contact the People Team.')
        clearCallbackFromUrl()
        return false
      }

      clearCallbackFromUrl()
      return true
    }

    const hash = url.hash
    const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (accessToken && refreshToken) {
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (setSessionError) {
        console.error('Failed setSession', setSessionError)
        setError('Unable to establish Google session. Please try again or contact the People Team.')
        clearCallbackFromUrl()
        return false
      }

      clearCallbackFromUrl()
      return true
    }

    return false
  }

  const ensureAuthState = async () => {
    if (!supabase) {
      setReady(true)
      return
    }

    const found = getSession()
    const callbackHandled = await handleOAuthCallback()

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('getSession failed', sessionError)
      setError('Unable to verify your account. Please contact the People Team.')
      setReady(true)
      return
    }

    if (session?.user?.email) {
      await loadGoogleEmployee(session.user.email, { force: true })
      return
    }

    if (found) {
      if (callbackHandled) {
        setError('Your Google sign-in did not return a valid session. Please try again.')
      }

      clearSession()
      setEmployee(null)
      setCurrent(1)
      setCompleted([])
      setFeedbackRating(0)
      setFeedbackSubmitted(false)
      setSystemsCheckSubmitted(false)
      setSystemsCheckResponses(INITIAL_SYSTEMS_CHECK_RESPONSES)
      setReady(true)
      return
    }

    setReady(true)
  }

  useEffect(() => {
    setLanguage(getLanguage())

    if (!supabase) {
      setReady(true)
      return
    }

    ensureAuthState()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        await loadGoogleEmployee(session.user.email, { force: true })
        return
      }

      if (event === 'SIGNED_OUT') {
        clearSession()
        setEmployee(null)
        setCurrent(1)
        setCompleted([])
        setOnboardingCompletedAt(null)
        setFeedbackRating(0)
        setFeedbackSubmitted(false)
        setSystemsCheckSubmitted(false)
        setSystemsCheckResponses(INITIAL_SYSTEMS_CHECK_RESPONSES)
        setReady(true)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])
  const changeLanguage = (l: Language) => { setLanguage(l); saveLanguage(l) }
  async function hydrate(person: Employee) {
    if (!supabase) { setReady(true); return }

    const [progress, stepProgress, responses, videoConfig, feedbackRecord] = await Promise.all([
      supabase.from('onboarding_progress').select('current_step, completed_at').eq('employee_id', person.id).maybeSingle(),
      supabase.from('onboarding_step_progress').select('step_number').eq('employee_id', person.id).eq('completed', true),
      supabase.from('onboarding_systems_check_responses').select('question_key,answer,issue').eq('employee_id', person.id),
      supabase.from('onboarding_videos').select('step_number,title,storage_path,is_active').in('step_number', [4,5,6,7]).eq('is_active', true).order('step_number'),
      supabase.from('onboarding_feedback').select('rating').eq('employee_id', person.id).maybeSingle(),
    ])

    if (progress.error) console.error('Failed to load onboarding progress', progress.error)
    if (stepProgress.error) console.error('Failed to load completed steps', stepProgress.error)
    if (responses.error) console.error('Failed to load systems check answers', responses.error)
    if (videoConfig.error) console.error('Failed to load videos', videoConfig.error)
    if (feedbackRecord.error) console.error('Failed to load existing feedback', feedbackRecord.error)

    const resolvedCurrent = Math.min(progress.data?.current_step || 1, steps.length)
    if (progress.data) setCurrent(resolvedCurrent)
    setOnboardingCompletedAt(progress.data?.completed_at || null)

    if (stepProgress.data) {
      setCompleted(stepProgress.data.map(x => x.step_number))
      const hasSystemsCheckStepCompletion = stepProgress.data.some(x => x.step_number === SYSTEMS_CHECK_STEP_NUMBER)
      setSystemsCheckSubmitted(hasSystemsCheckStepCompletion && resolvedCurrent > SYSTEMS_CHECK_STEP_NUMBER)
      setDeclarationStatus(stepProgress.data.some(x => x.step_number === 9) ? 'found' : 'idle')
    }

    if (responses.data) {
      const restoredResponses = { ...INITIAL_SYSTEMS_CHECK_RESPONSES }
      responses.data.forEach((row: SystemsCheckStorageRow) => {
        const key = row.question_key
        if (key in restoredResponses && (row.answer === 'yes' || row.answer === 'no')) {
          restoredResponses[key] = {
            answer: row.answer,
            issue: row.issue || '',
          }
        }
      })
      setSystemsCheckResponses(restoredResponses)
    }

    if (videoConfig.data) {
      setVideos(videoConfig.data)
    }

    if (feedbackRecord.data) {
      setFeedbackRating(feedbackRecord.data.rating || 0)
      setFeedbackSubmitted(true)
    } else {
      setFeedbackRating(0)
      setFeedbackSubmitted(false)
    }

    setReady(true)
  }
  async function signInWithGoogle() {
    if (!supabase || !isSupabaseConfigured) {
      setError('This site is not configured yet. Please contact the People Team.')
      return
    }

    setBusy(true)
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      setError('Unable to sign in with Google. Please try again or contact the People Team.')
      setBusy(false)
    }
  }

  async function loadGoogleEmployee(userEmail: string, options: { force?: boolean } = {}) {
    if (!supabase) return

    const normalised = userEmail.trim().toLowerCase()
    setBusy(true)
    setError('')
    setDeclarationStatus('idle')
    const stored = getSession()
    if (options.force && stored && stored.email.toLowerCase() !== normalised) {
      clearSession()
      setEmployee(null)
      setCurrent(1)
      setCompleted([])
      setOnboardingCompletedAt(null)
      setFeedbackRating(0)
      setFeedbackSubmitted(false)
      setSystemsCheckSubmitted(false)
      setSystemsCheckResponses(INITIAL_SYSTEMS_CHECK_RESPONSES)
    }

    const { data, error } = await supabase
      .from('onboarding_employees')
      .select('id,email,name,alias,department,job_title,employee_status,manager_name')
      .eq('email', normalised)
      .maybeSingle()

    if (error) {
      setError('Unable to verify your account. Please contact the People Team.')
      setBusy(false)
      setReady(true)
      return
    }

    const status = String(data?.employee_status || '').toLowerCase()

    if (!data || status !== 'active') {
      setError('Your Google account is not registered for AllAboard@99. Please contact the People Team.')
      await supabase.auth.signOut()
      setBusy(false)
      setReady(true)
      return
    }

    const person: Employee = {
      id: data.id,
      email: data.email,
      name: data.name,
      alias: data.alias,
      department: data.department,
      job_title: data.job_title,
      manager_name: data.manager_name,
    }

    saveSession(person)
    setEmployee(person)
    setReflectionSaved(false)
    setFeedbackRating(0)
    setFeedbackSubmitted(false)
    setSystemsCheckSubmitted(false)
    setSystemsCheckResponses(INITIAL_SYSTEMS_CHECK_RESPONSES)

    const { data: existing, error: existingError } = await supabase
      .from('onboarding_progress')
      .select('current_step, completed_at')
      .eq('employee_id', person.id)
      .maybeSingle()

    if (existingError) {
      console.error('Failed to load onboarding progress', existingError)
      setError(t.saveError)
      setBusy(false)
      setReady(true)
      return
    }

    if (!existing) {
      const { error: insertError } = await supabase
        .from('onboarding_progress')
        .insert({
          employee_id: person.id,
          current_step: 1,
          started_at: new Date().toISOString(),
        })
      if (insertError) {
        console.error('Failed to create onboarding progress', insertError)
        setError(t.saveError)
        setBusy(false)
        setReady(true)
        return
      }
    }

    await hydrate(person)
    setBusy(false)
  }

  async function persistStep(stepNumber: number, final = false) {
    if (!employee || !supabase) {
      setError(t.saveError)
      return false
    }

    setBusy(true)
    setError('')
    const now = new Date().toISOString()
    try {
      const one = await supabase.from('onboarding_step_progress').upsert({
        employee_id: employee.id,
        step_number: stepNumber,
        completed: true,
        completed_at: now,
      }, { onConflict: 'employee_id,step_number' })

      const two = await supabase.from('onboarding_progress').upsert({
        employee_id: employee.id,
        current_step: Math.min(stepNumber + 1, steps.length),
        ...(final ? { completed_at: now } : {}),
      }, { onConflict: 'employee_id' })

      if (one.error || two.error) {
        console.error('Failed to persist onboarding step', { oneError: one.error?.message, twoError: two.error?.message })
        setError(t.saveError)
        return false
      }

      setCompleted(prev => prev.includes(stepNumber) ? prev : [...prev, stepNumber])
      if (final) setOnboardingCompletedAt(now)
      return true
    } finally {
      setBusy(false)
    }
  }

  async function signOutFromApp() {
    setBusy(true)
    await supabase?.auth.signOut()
    clearSession()
    setDeclarationStatus('idle')
    setEmployee(null)
    setCurrent(1)
    setCompleted([])
    setOnboardingCompletedAt(null)
    setReflectionSaved(false)
    setFeedbackRating(0)
    setFeedbackSubmitted(false)
    setSystemsCheckSubmitted(false)
    setSystemsCheckResponses(INITIAL_SYSTEMS_CHECK_RESPONSES)
    setBusy(false)
    setError('')
    setReady(true)
  }

  async function advance() {
    setError('')
    if (current === REFLECTION_STEP_NUMBER && !reflectionSaved) return
    if (current === RATING_STEP_NUMBER && !feedbackSubmitted) return
    const final = current === steps.length
    if (await persistStep(current, final)) setCurrent(Math.min(steps.length, current + 1))
  }

  function canSubmitSystemsCheck() {
    return SYSTEMS_CHECK_QUESTIONS.every((question) => {
      const response = systemsCheckResponses[question.id]
      if (!response) return false
      if (response.answer !== 'yes' && response.answer !== 'no') return false
      if (response.answer === 'no' && !response.issue.trim()) return false
      return true
    })
  }

  function updateSystemsCheckResponse(questionId: keyof SystemsCheckState, values: Partial<SystemsCheckResponse>) {
    setSystemsCheckResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...values,
      },
    }))
  }

  async function persistSystemsCheckResponses() {
    if (!employee || !supabase) {
      setError(t.saveError)
      return false
    }

    const rows = SYSTEMS_CHECK_QUESTIONS.map((question) => {
      const response = systemsCheckResponses[question.id]
      return {
        employee_id: employee.id,
        step_number: SYSTEMS_CHECK_STEP_NUMBER,
        question_key: question.id,
        question_text: question.label,
        answer: response.answer,
        issue: response.answer === 'no' ? response.issue.trim() : null,
      }
    })

    const upsertResponse = await supabase
      .from('onboarding_systems_check_responses')
      .upsert(rows, {
        onConflict: 'employee_id,question_key',
      })

    if (!upsertResponse.error) {
      return true
    }

    const legacyRows = SYSTEMS_CHECK_QUESTIONS.map((question) => {
      const response = systemsCheckResponses[question.id]
      return {
        employee_id: employee.id,
        step_number: SYSTEMS_CHECK_STEP_NUMBER,
        question_key: question.id,
        question_text: question.label,
        answer: response.answer,
        issue: response.answer === 'no' ? response.issue.trim() : null,
      }
    })

    const fallbackDelete = await supabase
      .from('onboarding_systems_check_responses')
      .delete()
      .eq('employee_id', employee.id)
      .eq('step_number', SYSTEMS_CHECK_STEP_NUMBER)

    if (fallbackDelete.error) {
      console.error('Failed to upsert systems check responses', upsertResponse.error)
      console.error('Failed to clear old systems check responses', fallbackDelete.error)
      setError(t.saveError)
      return false
    }

    const { error: fallbackInsertError } = await supabase
      .from('onboarding_systems_check_responses')
      .insert(legacyRows)

    if (fallbackInsertError) {
      console.error('Failed to persist systems check responses (fallback insert)', fallbackInsertError)
      setError(t.saveError)
      return false
    }

    return true
  }

  async function submitSystemsCheck() {
    if (!canSubmitSystemsCheck()) {
      setError('Please complete all systems check questions before continuing.')
      return false
    }

    const savedResponses = await persistSystemsCheckResponses()
    if (!savedResponses) return false

    const saved = await persistStep(SYSTEMS_CHECK_STEP_NUMBER)
    if (saved) {
      setSystemsCheckSubmitted(true)
      setError('')
      return true
    }
    return false
  }

  async function submitFeedback() {
    if (!employee || !supabase) {
      setError(t.saveError)
      return false
    }

    if (!feedbackRating) {
      setError('Please select a rating before continuing.')
      return false
    }

    setBusy(true)
    setError('')
    try {
      const { data: existing, error: existingError } = await supabase
        .from('onboarding_feedback')
        .select('id, rating')
        .eq('employee_id', employee.id)
        .maybeSingle()

      if (existingError) {
        console.error('Failed to check existing feedback', existingError)
        setError(t.saveError)
        return false
      }

      if (existing) {
        if (existing.rating) setFeedbackRating(existing.rating)
        setFeedbackSubmitted(true)
        return true
      }

      const { error: insertError } = await supabase
        .from('onboarding_feedback')
        .insert({
          employee_id: employee.id,
          rating: feedbackRating,
        })

      if (insertError) {
        const errorCode = (insertError as { code?: string }).code
        if (errorCode === '23505') {
          const { data: existingFeedback } = await supabase
            .from('onboarding_feedback')
            .select('rating')
            .eq('employee_id', employee.id)
            .maybeSingle()

          if (existingFeedback?.rating) setFeedbackRating(existingFeedback.rating)
          setFeedbackSubmitted(true)
          return true
        }

        console.error('Failed to submit feedback', insertError)
        setError(t.saveError)
        return false
      }

      setFeedbackSubmitted(true)
      return true
    } finally {
      setBusy(false)
    }
  }

  async function submitFeedbackAndFinish() {
    const submitted = await submitFeedback()
    if (!submitted) return false
    return true
  }

  async function checkDeclarationSubmission() {
    if (!employee || !supabase || declarationPollActiveRef.current) return

    setDeclarationStatus('checking')
    declarationPollActiveRef.current = true
    setError('')
      const startedAt = Date.now()

    const clearDeclarationPollTimeout = () => {
      if (declarationPollTimeoutRef.current) {
        clearTimeout(declarationPollTimeoutRef.current)
        declarationPollTimeoutRef.current = null
      }
    }

    const stopDeclarationPolling = () => {
      declarationPollActiveRef.current = false
      clearDeclarationPollTimeout()
    }

    const scheduleDeclarationPoll = (nextCheckInMs: number) => {
      declarationPollTimeoutRef.current = setTimeout(() => {
        if (!declarationPollActiveRef.current) return
        void checkDeclarationOnce(startedAt)
      }, nextCheckInMs)
    }

    const finishDeclarationPollNotFound = () => {
      stopDeclarationPolling()
      setDeclarationStatus('not_found')
    }

    const finishDeclarationPollError = () => {
      stopDeclarationPolling()
      setError('We couldn’t check your submission. Please try again.')
      setDeclarationStatus('error')
    }

    const checkDeclarationOnce = async (pollStartedAt: number) => {
      if (!declarationPollActiveRef.current || !employee || !supabase) return

      try {
        const normalizedEmail = employee.email.trim().toLowerCase()
        const { data, error } = await supabase
          .from('declaration_submissions')
          .select('id')
          .ilike('email', normalizedEmail)
          .limit(1)
          .maybeSingle()

        if (!declarationPollActiveRef.current) return

        if (error) {
          console.error('Failed to check declaration submission', error)
          finishDeclarationPollError()
          return
        }

        if (data) {
          stopDeclarationPolling()
          setDeclarationStatus('found')
          return
        }

        const elapsed = Date.now() - pollStartedAt
        const remainingTime = DECLARATION_POLL_TIMEOUT_MS - elapsed

        if (remainingTime <= 0) {
          finishDeclarationPollNotFound()
          return
        }

        if (remainingTime <= DECLARATION_POLL_INTERVAL_MS) {
          declarationPollTimeoutRef.current = setTimeout(() => {
            if (declarationPollActiveRef.current) finishDeclarationPollNotFound()
          }, remainingTime)
          return
        }

        scheduleDeclarationPoll(DECLARATION_POLL_INTERVAL_MS)
      } catch (error) {
        console.error('Failed to check declaration submission', error)
        if (!declarationPollActiveRef.current) return
        finishDeclarationPollError()
      }
    }

    await checkDeclarationOnce(startedAt)
  }
  useEffect(() => {
    if (current === 9) return

    if (declarationPollTimeoutRef.current) {
      clearTimeout(declarationPollTimeoutRef.current)
      declarationPollTimeoutRef.current = null
    }

    if (declarationStatus === 'checking') {
      declarationPollActiveRef.current = false
      setDeclarationStatus('idle')
    }
  }, [current, declarationStatus])

  useEffect(() => {
    return () => {
      declarationPollActiveRef.current = false
      if (declarationPollTimeoutRef.current) {
        clearTimeout(declarationPollTimeoutRef.current)
        declarationPollTimeoutRef.current = null
      }
    }
  }, [])
  function back() { setError(''); setCurrent(Math.max(1, current - 1)) }
  if (!ready) return <main className="grid min-h-screen place-items-center p-6 text-ink"><p className="animate-pulse">{t.loading}</p></main>
  if (!employee) return <main className="mx-auto grid min-h-screen max-w-xl place-items-center p-6"><section className="w-full rounded-[2rem] bg-cream p-7 shadow-soft sm:p-10">
    <header className="mb-14 flex items-center justify-between">
      <p className="inline-flex rounded-full bg-cream px-4 py-2 text-xl font-black tracking-tight">AllAboard!<span className="text-coral">@99</span></p>
      <LanguageToggle language={language} onChange={changeLanguage} />
    </header>

    <p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-leaf">99 Group</p>
    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t.emailTitle}</h1>
    <p className="mt-4 max-w-md text-lg leading-relaxed text-ink/70">One person. One journey. One step at a time.</p>

    <div className="mt-10">
      <Button type="button" onClick={signInWithGoogle} disabled={busy} className="w-full">
        {busy ? t.loading : 'Continue with Google'}
      </Button>
      {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
    </div>
  </section></main>

  const isRequiredVideoStep = step.kind === 'video' && REQUIRED_VIDEO_STEPS.has(step.number)
  const isVideoCompleted = isRequiredVideoStep && completed.includes(step.number)
  const isDeclarationSubmitted = declarationStatus === 'found' || completed.includes(9)
  const isSystemsCheckSubmitted = systemsCheckSubmitted
  if (onboardingCompletedAt) {
    return <EndingLandingPage employee={employee} language={language} onChangeLanguage={changeLanguage} onSignOut={signOutFromApp} />
  }
  return <main className="mx-auto min-h-screen max-w-4xl p-4 sm:p-8"><header className="mb-6 flex items-center justify-between"><p className="inline-flex rounded-full bg-cream px-4 py-2 text-xl font-black tracking-tight">AllAboard!<span className="text-coral">@99</span></p><LanguageToggle language={language} onChange={changeLanguage} /></header><section className="min-h-[580px] rounded-[2rem] bg-cream p-6 shadow-soft sm:p-10"><div className="mb-9"><p className="font-semibold">{t.journey}</p><p className="mt-1 text-sm text-ink/60">{t.step} {current} {t.of} {steps.length}</p><div className="mt-4"><ProgressBar current={current} total={steps.length} /></div></div><div key={`${current}-${language}`} className="step-enter"><StepContent step={step} employee={employee} t={t} language={language} videos={videos} onAdvance={advance} busy={busy} error={error} setError={setError} isVideoCompleted={isVideoCompleted} declarationStatus={declarationStatus} isDeclarationSubmitted={isDeclarationSubmitted} onCheckDeclaration={checkDeclarationSubmission} onVideoEnd={() => { setCompleted(prev => prev.includes(step.number) ? prev : [...prev, step.number]) }} reflectionSaved={reflectionSaved} setReflectionSaved={setReflectionSaved} isSystemsCheckSubmitted={isSystemsCheckSubmitted} systemsCheckResponses={systemsCheckResponses} updateSystemsCheckResponse={updateSystemsCheckResponse} canSubmitSystemsCheck={canSubmitSystemsCheck()} submitSystemsCheck={submitSystemsCheck} feedbackRating={feedbackRating} feedbackSubmitted={feedbackSubmitted} setFeedbackRating={setFeedbackRating} submitFeedback={submitFeedbackAndFinish} /><nav className="mt-10 flex flex-wrap justify-between gap-3 border-t border-ink/10 pt-6">{current > 1 ? <Button variant="secondary" onClick={back}>← {t.previous}</Button> : <span />}{(current < steps.length || current === RATING_STEP_NUMBER) && (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={advance}
        disabled={busy || (isRequiredVideoStep && !isVideoCompleted) || (step.number === 9 && !isDeclarationSubmitted) || (step.number === REFLECTION_STEP_NUMBER && !reflectionSaved) || (step.number === RATING_STEP_NUMBER && !feedbackSubmitted) || (step.number === SYSTEMS_CHECK_STEP_NUMBER && !isSystemsCheckSubmitted)}
      >
        {(current === 10 || current === 11) ? t.next : step.optional ? t.skip : t.next}
      </Button>
      {isRequiredVideoStep && !isVideoCompleted && (
        <p className="text-xs text-ink/60">
          Watch the video until the end to continue.
        </p>
      )}
      {step.number === SYSTEMS_CHECK_STEP_NUMBER && !isSystemsCheckSubmitted && (
        <p className="text-xs text-ink/60">
          Please submit the systems check before continuing.
        </p>
      )}
      {step.number === REFLECTION_STEP_NUMBER && !reflectionSaved && (
        <p className="text-xs text-ink/60">
          {language === 'id' ? 'Silakan kirim jawaban refleksi Anda sebelum melanjutkan.' : 'Please submit your reflections before continuing.'}
        </p>
      )}
      {step.number === RATING_STEP_NUMBER && !feedbackSubmitted && (
        <p className="text-xs text-ink/60">
          Please submit your feedback before continuing.
        </p>
      )}
    </div>
  )}</nav></div><button onClick={signOutFromApp} className="mt-8 text-xs font-semibold text-ink/60 underline">{t.signOut}</button></section></main>
}

function StepContent({ step, employee, t, language, videos, onAdvance, busy, error, setError, isVideoCompleted, onVideoEnd, declarationStatus = 'idle', isDeclarationSubmitted = false, onCheckDeclaration, reflectionSaved, setReflectionSaved, isSystemsCheckSubmitted, systemsCheckResponses, updateSystemsCheckResponse, canSubmitSystemsCheck, submitSystemsCheck, feedbackRating, feedbackSubmitted, setFeedbackRating, submitFeedback }: {
  step: typeof steps[number]
  employee: Employee
  t: typeof translations.en
  language: Language
  videos: OnboardingVideo[]
  onAdvance: () => Promise<void>
  busy: boolean
  error: string
  setError: (s: string) => void
  isVideoCompleted: boolean
  onVideoEnd: () => void
  declarationStatus?: 'idle' | 'checking' | 'found' | 'not_found' | 'error'
  isDeclarationSubmitted?: boolean
  onCheckDeclaration?: () => Promise<void>
  reflectionSaved: boolean
  setReflectionSaved: (value: boolean) => void
  isSystemsCheckSubmitted: boolean
  systemsCheckResponses: SystemsCheckState
  updateSystemsCheckResponse: (questionId: keyof SystemsCheckState, values: Partial<SystemsCheckResponse>) => void
  canSubmitSystemsCheck: boolean
  submitSystemsCheck: () => Promise<boolean>
  feedbackRating: number
  feedbackSubmitted: boolean
  setFeedbackRating: (value: number) => void
  submitFeedback: () => Promise<boolean>
}) {
  const [question, setQuestion] = useState('');
	const [saved, setSaved] = useState(false);
  const [videoLocked, setVideoLocked] = useState(false)
  const [videoWatchedUntil, setVideoWatchedUntil] = useState(0)
  const [answers, setAnswers] = useState<Record<string,string>>({});
const [questions, setQuestions] = useState<{step_number:number;question:string}[]>([]);
const [copied, setCopied] = useState(false);
const [reflectionSaving, setReflectionSaving] = useState(false);
const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
const feedbackLabels: Record<number, string> = {
  1: '1 out of 5',
  2: '2 out of 5',
  3: '3 out of 5',
  4: '4 out of 5',
  5: '5 out of 5',
}
  const slackProfileGuidelineUrl = supabase?.storage.from('slack guideline').getPublicUrl('slack-photo-guideline.jpg').data.publicUrl
  const slackTutorialGuidelineUrl = supabase?.storage.from('slack guideline').getPublicUrl('slack-tutorial.gif').data.publicUrl
  const slackEmployeeData = employee ? (employee as Employee & { job_title?: string | null; manager_name?: string | null }) : null

  const isRequiredVideo = step.kind === 'video' && REQUIRED_VIDEO_STEPS.has(step.number)

	useEffect(() => {
	  setVideoLocked(isRequiredVideo && !isVideoCompleted)
	  setVideoWatchedUntil(0)
	}, [isVideoCompleted, isRequiredVideo, step.number]);
  const onVideoTimeUpdate = (event: { currentTarget: HTMLVideoElement }) => {
    const currentTime = event.currentTarget.currentTime
    if (!videoLocked || !isRequiredVideo) return
    if (currentTime > videoWatchedUntil) setVideoWatchedUntil(currentTime)
  }
  const onVideoSeeking = (event: { currentTarget: HTMLVideoElement }) => {
    if (!videoLocked || !isRequiredVideo) return
    const video = event.currentTarget
    if (video.currentTime > videoWatchedUntil) video.currentTime = videoWatchedUntil
  }
  const handleVideoEnd = () => {
    setVideoLocked(false)
    onVideoEnd()
  }

	useEffect(() => {
  if (step.kind !== 'video' || !supabase) return;

  supabase
    .from('onboarding_questions')
    .select('question')
    .eq('employee_id', employee.id)
    .eq('step_number', step.number)
    .maybeSingle()
    .then(({ data }) => {
      if (data?.question) {
        setQuestion(data.question);
        setSaved(true);
      }
    });
}, [step.kind, step.number, employee.id]);
  useEffect(() => { if (step.kind === 'manager' && supabase) supabase.from('onboarding_questions').select('step_number,question').eq('employee_id', employee.id).in('step_number', [4,5,6,7]).then(({data}) => setQuestions(data || [])) }, [step.kind, employee.id])
  async function saveQuestion() {
  if (!question.trim() || !supabase) return;

  setError('');

  const { error } = await supabase
    .from('onboarding_questions')
    .upsert(
      {
        employee_id: employee.id,
        step_number: step.number,
        question: question.trim(),
      },
      {
        onConflict: 'employee_id,step_number',
      }
    );

  if (error) {
    setError(t.saveError);
    return;
  }

  setSaved(true);
}
  async function submitFeedbackRating() {
    setFeedbackSubmitting(true)
    try {
      await submitFeedback()
    } finally {
      setFeedbackSubmitting(false)
    }
  }
  const reflectionQuestions = language === 'id'
    ? [
      'Hal apa yang ingin saya ingat dari hari pertama saya?',
      'Apa satu hal yang ingin saya mulai melakukan?',
      'Apa satu hal yang ingin saya hentikan agar tidak menghambat diri saya?',
      'Apa saja hobi Anda, dan komunitas seperti apa yang ingin Anda temukan di sini?',
    ]
    : [
      'What do I want to remember about my first day?',
      'What is one thing I want to start doing?',
      'What is one thing I want to stop holding myself back from?',
      'What are your hobbies, and what kind of community would you like to find here?',
    ]
  async function saveReflections() {
    if (!supabase) {
      console.error('Supabase client unavailable while saving reflections')
      setError(t.saveError)
      setReflectionSaved(false)
      return
    }

    setReflectionSaved(false)
    const client = supabase
    const records = reflectionQuestions
      .map(question => ({ question, answer: (answers[question] || '').trim() }))
      .filter((q): q is { question: string; answer: string } => Boolean(q.answer))

    setError('')
    if (!records.length) return

    setReflectionSaving(true)
    try {
      const { data: existing, error: queryError } = await supabase
        .from('onboarding_reflections')
        .select('id, question, answer')
        .eq('employee_id', employee.id)
        .in('question', reflectionQuestions)

      if (queryError) {
        console.error(queryError)
        setError(t.saveError)
        return
      }

      const existingByQuestion = new Map<string, string[]>()
      existing?.forEach((row: { question: string; id: string }) => {
        const list = existingByQuestion.get(row.question) || []
        existingByQuestion.set(row.question, [...list, row.id])
      })

      const now = new Date().toISOString()
      const updates = records
        .filter(({ question }) => existingByQuestion.has(question))
        .flatMap(({ question, answer }) =>
          (existingByQuestion.get(question) || []).map(id =>
            client
              .from('onboarding_reflections')
              .update({ answer, updated_at: now })
              .eq('id', id)
          )
        )

      const inserts = records
        .filter(({ question }) => !existingByQuestion.has(question))
        .map(({ question, answer }) => ({
          employee_id: employee.id,
          question,
          answer,
        }))

      const updateResponses = await Promise.all(updates.map(update => update))
      const updateError = updateResponses.find(response => response.error)?.error
      if (updateError) {
        console.error(updateError)
        setError(t.saveError)
        setReflectionSaved(false)
        return
      }

      if (inserts.length) {
        const { error: insertError } = await supabase
          .from('onboarding_reflections')
          .insert(inserts)

        if (insertError) {
          console.error(insertError)
          setError(t.saveError)
          setReflectionSaved(false)
          return
        }
      }

      setError('')
      setReflectionSaved(true)
    } finally {
      setReflectionSaving(false)
    }
  }
  const managerMessage = `Hi,\n\nI have a few questions from my AllAboard!@99 onboarding:\n\n${questions.map(q => `• ${q.question}`).join('\n') || 'No questions this time.'}\n\nThanks!`
  const systemsCheckPrompt =
    step.number >= 4 && step.number <= 7
      ? 'Have a question? Note it down below'
      : t.question
  if (step.number === 1) return <><h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Welcome aboard, {employee.alias || 'there'}</h1><h2 className="mt-5 text-xl font-semibold">Your journey at the 99 Group starts here.</h2><p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">Take a few minutes to get familiar with who we are, how we work, and where to find the things you'll need along the way.</p></>
  if (step.number === 2) return (
  <>
    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
      You&apos;re joining the {employee.department || '99 Group'} team.
    </h1>

    <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/70">
      Here&apos;s a quick look at the 99ers you&apos;ll be working with.
    </p>

    <p className="mt-6 text-sm font-bold uppercase tracking-[.16em] text-leaf">
      How to explore your team
    </p>

    <p className="mt-2 max-w-xl text-base leading-relaxed text-ink/70">
      Click your team name in the left-side menu to see your teammates. You can also browse other teams to get a better sense of who&apos;s who across 99 Group.
    </p>

    <div className="mt-8 overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm">
      <iframe
        title="99 Group Team Directory"
        src={TEAM_URL}
        className="h-[600px] w-full border-0"
        loading="lazy"
      />
    </div>

    <ExternalLink href={TEAM_URL} className="mt-5">
      Open the site in a new tab
    </ExternalLink>
  </>
)
  if (step.number === SYSTEMS_CHECK_STEP_NUMBER) return <>
    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Systems check</h1>
    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/70">
      Make sure you have access to the tools you’ll use during your journey.
    </p>
    <div className="mt-7 space-y-5">
      {SYSTEMS_CHECK_QUESTIONS.map((question) => {
        const response = systemsCheckResponses[question.id]
        const isNo = response.answer === 'no'

        return (
          <div key={question.id} className="rounded-2xl border border-ink/10 bg-white p-4">
            <p className="font-semibold">{question.label}</p>
            <div className="mt-3 flex gap-2">
        <Button
          variant="secondary"
          onClick={() => updateSystemsCheckResponse(question.id, { answer: 'yes' })}
          aria-pressed={response.answer === 'yes'}
          className={response.answer === 'yes' ? 'border-ink/60 !bg-ink/20 !text-ink' : '!bg-white !text-ink/60'}
        >
          Yes
        </Button>
        <Button
          variant="secondary"
          onClick={() => updateSystemsCheckResponse(question.id, { answer: 'no' })}
          aria-pressed={response.answer === 'no'}
          className={response.answer === 'no' ? 'border-ink/60 !bg-ink/20 !text-ink' : '!bg-white !text-ink/60'}
        >
          No
        </Button>
      </div>
            {isNo ? (
              <label className="mt-3 block font-semibold">
                What&apos;s the issue?
                <textarea
                  value={response.issue}
                  onChange={e => updateSystemsCheckResponse(question.id, { issue: e.target.value })}
                  className="mt-2 min-h-24 w-full rounded-2xl border border-ink/20 p-4"
                  placeholder="Describe the issue here."
                />
              </label>
            ) : null}
          </div>
        )
      })}
    </div>
    <Button variant="secondary" onClick={submitSystemsCheck} disabled={busy || isSystemsCheckSubmitted || !canSubmitSystemsCheck} className="mt-6">
      Submit
    </Button>
    {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
    {isSystemsCheckSubmitted && <p className="mt-3 rounded-2xl bg-leaf/10 p-4 text-leaf font-semibold">Systems check submitted ✓</p>}
  </>
  if (step.number === RATING_STEP_NUMBER) return <>
    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Rate your AllAboard!@99 Experience</h1>
    <div className="mt-7 flex gap-3">
      {[1, 2, 3, 4, 5].map((value) => (
        <Button
          type="button"
          key={value}
          variant="secondary"
          onClick={() => {
            if (!feedbackSubmitted) setFeedbackRating(value)
          }}
          aria-label={feedbackLabels[value]}
          aria-pressed={feedbackRating === value}
          disabled={feedbackSubmitted}
          className={feedbackRating >= value ? 'border-ink/70 !bg-ink/20 !text-ink' : '!text-ink/50'}
        >
          {feedbackRating >= value ? '★' : '☆'}
        </Button>
      ))}
    </div>
    <Button
      type="button"
      variant="secondary"
      onClick={submitFeedbackRating}
      disabled={feedbackSubmitting || busy || feedbackSubmitted || !feedbackRating}
      className="mt-5"
    >
      Submit
    </Button>
    {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
    {feedbackSubmitted && <p className="mt-3 rounded-2xl bg-leaf/10 p-4 text-leaf font-semibold">Thank you for your feedback.</p>}
  </>
		  if (step.kind === 'video') {
	    const configuredVideo = videos.find(v => v.step_number === step.number)
	    const videoSrc = VIDEO_URLS[step.number] || null

	    return <>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{step.title}</h1>
      <div className="mt-8">
        {videoSrc ? (
          <VideoEmbed
            src={videoSrc}
            title={step.title}
            onSeeking={isRequiredVideo ? onVideoSeeking : undefined}
            onTimeUpdate={isRequiredVideo ? onVideoTimeUpdate : undefined}
            onEnded={isRequiredVideo ? handleVideoEnd : undefined}
          />
        ) : (
          <p className="rounded-2xl bg-ink/5 p-5 text-ink/60">Video unavailable.</p>
        )}
      </div>
      <label className="mt-7 block font-semibold">
        {systemsCheckPrompt}
        <textarea
          value={question}
          onChange={e => { setQuestion(e.target.value); setSaved(false) }}
          placeholder={t.questionPlaceholder}
          className="mt-2 min-h-28 w-full rounded-2xl border border-ink/20 p-4"
        />
      </label>
      <Button variant="secondary" onClick={saveQuestion} disabled={!question.trim()} className="mt-3">
        {saved ? t.saved : t.saveQuestion}
      </Button>
    </>
  }
  if (step.kind === 'reflection') return <><h1 className="text-4xl font-bold tracking-tight">A note to your future self.</h1><p className="mt-4 max-w-2xl leading-relaxed text-ink/70">{t.reflection}</p>{reflectionSaved ? <div className="mt-7 rounded-2xl bg-leaf/10 p-6 text-lg font-semibold text-leaf">Thank you for sharing your thoughts. We’ll bring them back to you on your 30th day here.</div> : <><div className="mt-7 space-y-5">{reflectionQuestions.map((q, index) => <label key={q} className="block font-semibold">{q}{index === 3 ? <input type="text" value={answers[q] || ''} onChange={e => setAnswers({ ...answers, [q]: e.target.value })} placeholder="e.g. Karaoke, Running, K-Pop, etc." className="mt-2 w-full rounded-2xl border border-ink/20 p-4" /> : <textarea value={answers[q] || ''} onChange={e => setAnswers({ ...answers, [q]: e.target.value })} className="mt-2 min-h-24 w-full rounded-2xl border border-ink/20 p-4 font-normal" />}</label>)}</div><Button variant="secondary" onClick={saveReflections} disabled={reflectionSaving} className="mt-4">{reflectionSaving ? 'Saving...' : (language === 'id' ? 'Kirim' : 'Submit')}</Button>{error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}</>}</>
  if (step.number === 8) return <>
    <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Update your Slack profile.</h1>
    <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">To help everyone recognise and connect with you easily, please update your profile photo, add your manager, and include your role and department.</p>
    <h2 className="mt-7 text-2xl font-bold">Slack Profile Update Tutorial</h2>
    {slackTutorialGuidelineUrl ? (
      <img
        src={slackTutorialGuidelineUrl}
        alt="Slack profile update tutorial"
        className="mt-4 w-full max-w-3xl rounded-2xl border border-ink/10 shadow-sm"
      />
    ) : (
      <p className="mt-4 rounded-2xl bg-ink/5 p-4 text-ink/60">Slack tutorial GIF unavailable.</p>
    )}
    <h2 className="mt-7 text-2xl font-bold">What to add to your Slack profile</h2>
    <div className="mt-4 space-y-4">
      <div className="rounded-xl bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-ink/60">Title</p>
        <p className="mt-1 text-base font-semibold text-ink">{slackEmployeeData?.job_title || 'Not set'}</p>
      </div>
      <div className="rounded-xl bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-ink/60">Department</p>
        <p className="mt-1 text-base font-semibold text-ink">{employee.department || 'Not set'}</p>
      </div>
      <div className="rounded-xl bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-ink/60">Manager</p>
        <p className="mt-1 text-base font-semibold text-ink">{slackEmployeeData?.manager_name?.trim() || 'Not set'}</p>
      </div>
    </div>
    <h2 className="mt-7 text-2xl font-bold">Photo Profile Guideline</h2>
    {slackProfileGuidelineUrl ? (
      <img
        src={slackProfileGuidelineUrl}
        alt="Slack profile photo guideline"
        className="mt-4 w-full max-w-3xl rounded-2xl border border-ink/10 shadow-sm"
      />
    ) : (
      <p className="mt-4 rounded-2xl bg-ink/5 p-4 text-ink/60">Guideline image unavailable.</p>
    )}
    {step.externalUrl && <ExternalLink href={step.externalUrl} className="mt-8">{t.openSlack}</ExternalLink>}
  </>
  if (step.kind === 'manager') return <><h1 className="text-4xl font-bold tracking-tight">Questions for your manager.</h1><p className="mt-4 leading-relaxed text-ink/70">{t.manager}</p><div className="mt-7 rounded-2xl bg-ink/5 p-5 whitespace-pre-wrap">{questions.length ? managerMessage : t.noQuestions}</div><div className="mt-4 flex gap-3"><Button variant="secondary" onClick={() => { navigator.clipboard.writeText(managerMessage); setCopied(true) }}>{copied ? t.copied : t.copyQuestions}</Button><ExternalLink href="https://99dotco.slack.com/team/U06JQRW0YLW">{t.openSlack}</ExternalLink></div></>
  if (step.kind === 'complete') return <><div className="grid h-16 w-16 place-items-center rounded-full bg-leaf text-3xl text-white">✓</div><h1 className="mt-6 text-5xl font-bold tracking-tight">You’re all set.</h1><p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/70">Now you are ready for your #YourWayHome journey.</p><p className="mt-8 rounded-2xl bg-leaf/10 p-4 font-semibold text-leaf">{t.allDone}</p></>
  if (step.kind === 'thanks') return <><div className="text-6xl">✦</div><h1 className="mt-5 text-5xl font-bold tracking-tight">Thank you.</h1><p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/70">Your AllAboard!@99 journey is complete. We’re excited to have you with us.</p>{step.externalUrl && <ExternalLink href={step.externalUrl} className="mt-8">{t.checkPlatforms}</ExternalLink>}</>
  if (step.kind === 'form') return <><h1 className="text-4xl font-bold tracking-tight">Fill out your Declaration Form.</h1><div className="mt-7 overflow-hidden rounded-3xl border border-ink/10"><iframe title="Declaration Form" className="h-[390px] w-full" src={step.externalUrl} loading="lazy" /></div>{onCheckDeclaration && !isDeclarationSubmitted && declarationStatus !== 'found' ? <Button onClick={onCheckDeclaration} disabled={declarationStatus === 'checking'} className="mt-4">{declarationStatus === 'checking' ? 'Checking your submission…' : declarationStatus === 'not_found' || declarationStatus === 'error' ? 'Try Again' : 'Check My Submissions'}</Button> : null}{declarationStatus === 'found' || isDeclarationSubmitted ? <p className="mt-3 rounded-2xl bg-leaf/10 p-4 text-leaf font-semibold">Declaration submitted ✓<br />We found your declaration form submission.</p> : null}{declarationStatus === 'not_found' ? <p className="mt-3 rounded-2xl bg-ink/5 p-4 text-ink/70">We couldn't find your submission yet. Please make sure you&apos;ve submitted the Declaration Form and try again.</p> : null}{declarationStatus === 'error' ? <p className="mt-3 rounded-2xl bg-red-100 p-4 text-sm text-red-700">We couldn’t check your submission. Please try again.</p> : null}</>
  if (step.kind === 'linkedin') return <><h1 className="text-4xl font-bold tracking-tight">Update your LinkedIn profile.</h1><p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">Show the world that you're a proud 99er. Add our special Proud 99er LinkedIn badge and 99 Group LinkedIn banner to your profile and let your network know you're part of the team.</p><div className="mt-7 grid gap-4 sm:grid-cols-2"><ExternalLink href="https://drive.usercontent.google.com/download?id=1PLqiJtAULCCn5onEThpgxgJawB0hHYV_&export=download&authuser=0&confirm=t&uuid=62150135-e542-4b67-8a77-b004d2c61476&at=AFYLz4MmJN93TOmrJa0cBlxswg0t:1786611872173">Download Banner</ExternalLink><ExternalLink href="https://www.supertwibbon.com/99ersLinkedInProfile">Create LinkedIn Badge</ExternalLink></div><div className="mt-7 flex justify-center">
    <img
    src="/linkedinprofilepreview.jpeg"
    alt="Proud 99er LinkedIn profile preview"
    className="w-full max-w-2xl rounded-2xl border border-ink/10 shadow-sm"
  />
</div>{step.externalUrl && <ExternalLink href={step.externalUrl} className="mt-6">Edit your LinkedIn profile</ExternalLink>}</>
	  const details: Record<number, { title: string; copy: string; action: string }> = { 1: { title: 'Welcome aboard.', copy: 'One person. One journey. One step at a time.', action: '' }, 8: { title: 'Update your Slack profile.', copy: 'To help everyone recognise and connect with you easily, please update your profile photo, add your manager, and include your role and department.', action: t.openSlack }, 11: { title: 'Set up your email signature.', copy: 'Use the shared template to make your email recognisably 99.', action: 'Open email signature template' }, 12: { title: 'Check your onboarding schedule.', copy: 'Keep track of the important moments in your first few weeks and make sure you don’t miss any of your onboarding sessions. Don’t forget to RSVP to the meetings you’ve been invited to.', action: 'Open Google Calendar' }, 13: { title: 'You’re almost all set.', copy: 'From here, 99ers Home has everything else — benefits, forms, and the processes you may use along the way.', action: 'Explore 99ers Home' } }
  const detail = details[step.number] || { title: step.title, copy: '', action: t.resource }; return <><h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{detail.title}</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/70">{detail.copy}</p>{step.externalUrl && <ExternalLink href={step.externalUrl} className="mt-8">{detail.action}</ExternalLink>}{error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}</>
}
