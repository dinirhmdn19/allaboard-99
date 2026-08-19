'use client'
import { useEffect, useState } from 'react'
import { steps, reflectionQuestions } from '@/config/steps'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { clearSession, getLanguage, getSession, saveLanguage, saveSession } from '@/lib/session'
import { translations } from '@/translations'
import type { Employee, Language } from '@/types'
import { Button, ExternalLink, LanguageToggle, ProgressBar, VideoEmbed } from './ui'

const TEAM_URL = 'https://script.google.com/a/macros/99.co/s/AKfycbz_Jc4g49bqxmcxW_6TtCIgv2NFthp6lNEj_Yrk9IE5jd_rxO1taTEKRR3g5B99UtVc/exec?pli=1'
const friendlyTitles: Record<number, string> = {
  3: 'Onboarding Video: Our Story, Mission and Leaders',
  4: 'Onboarding Video: Our Flywheel, Operations and Systems',
  5: 'Onboarding Video: Our Values, Culture and Environment',
  6: 'Onboarding Video: Our Resources, Support and Community',
}

export default function Onboarding() {
  const [language, setLanguage] = useState<Language>('en'); const [employee, setEmployee] = useState<Employee | null>(null)
  const [current, setCurrent] = useState(1); const [, setCompleted] = useState<number[]>([]); const [ready, setReady] = useState(false)
  const [email, setEmail] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const t = translations[language]; const step = steps[current - 1]
  useEffect(() => { setLanguage(getLanguage()); const found = getSession(); if (found) { setEmployee(found); hydrate(found) } else setReady(true) }, [])
  const changeLanguage = (l: Language) => { setLanguage(l); saveLanguage(l) }
  async function hydrate(person: Employee) { if (!supabase) { setReady(true); return } const [progress, stepProgress] = await Promise.all([supabase.from('onboarding_progress').select('current_step, completed_at').eq('employee_id', person.id).maybeSingle(), supabase.from('onboarding_step_progress').select('step_number').eq('employee_id', person.id).eq('completed', true)]); if (progress.data) setCurrent(Math.min(progress.data.current_step || 1, 16)); if (stepProgress.data) setCompleted(stepProgress.data.map(x => x.step_number)); setReady(true) }
  async function lookup(e: React.FormEvent) { e.preventDefault(); const normalised = email.trim().toLowerCase(); if (!/^\S+@\S+\.\S+$/.test(normalised)) { setError(t.emailError); return } if (!supabase || !isSupabaseConfigured) { setError('This site is not configured yet. Please contact the People Team.'); return } setBusy(true); setError(''); const { data } = await supabase.from('onboarding_employees').select('id,email,name,alias,department,employee_status').eq('email', normalised).maybeSingle(); const status = String(data?.employee_status || '').toLowerCase(); if (!data || status !== 'active') { setError(t.notFound); setBusy(false); return } const person: Employee = { id: data.id, email: data.email, name: data.name, alias: data.alias, department: data.department }; saveSession(person); setEmployee(person); const { data: existing } = await supabase.from('onboarding_progress').select('current_step').eq('employee_id', person.id).maybeSingle(); if (!existing) await supabase.from('onboarding_progress').insert({ employee_id: person.id, current_step: 1, started_at: new Date().toISOString() }); await hydrate(person); setBusy(false) }
  async function persistStep(stepNumber: number, final = false) { if (!employee || !supabase) return true; setBusy(true); const now = new Date().toISOString(); const one = await supabase.from('onboarding_step_progress').upsert({ employee_id: employee.id, step_number: stepNumber, completed: true, completed_at: now }, { onConflict: 'employee_id,step_number' }); const two = await supabase.from('onboarding_progress').upsert({ employee_id: employee.id, current_step: Math.min(stepNumber + 1, 16), ...(final ? { completed_at: now } : {}) }, { onConflict: 'employee_id' }); setBusy(false); if (one.error || two.error) { setError(t.saveError); return false } setCompleted(prev => prev.includes(stepNumber) ? prev : [...prev, stepNumber]); return true }
  async function advance() { setError(''); const final = current === 15; if (await persistStep(current, final)) setCurrent(Math.min(16, current + 1)) }
  function back() { setError(''); setCurrent(Math.max(1, current - 1)) }
  if (!ready) return <main className="grid min-h-screen place-items-center p-6 text-ink"><p className="animate-pulse">{t.loading}</p></main>
  if (!employee) return <main className="mx-auto grid min-h-screen max-w-xl place-items-center p-6"><section className="w-full rounded-[2rem] bg-cream p-7 shadow-soft sm:p-10"><header className="mb-14 flex items-center justify-between"><p className="inline-flex rounded-full bg-cream px-4 py-2 text-xl font-black tracking-tight">AllAboard!<span className="text-coral">@99</span></p><LanguageToggle language={language} onChange={changeLanguage} /></header><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-leaf">99 Group</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t.emailTitle}</h1><p className="mt-4 max-w-md text-lg leading-relaxed text-ink/70">One person. One journey. One step at a time.</p><form className="mt-10" onSubmit={lookup}><label className="mb-2 block font-semibold" htmlFor="email">{t.emailQuestion}</label><input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.emailPlaceholder} autoComplete="email" className="w-full rounded-2xl border border-ink/20 px-4 py-3.5 transition focus:border-leaf" /><p className="mt-2 min-h-5 text-sm text-red-700" role="alert">{error}</p><Button type="submit" disabled={busy} className="mt-5 w-full">{busy ? t.loading : t.continue}</Button></form></section></main>
  return <main className="mx-auto min-h-screen max-w-4xl p-4 sm:p-8"><header className="mb-6 flex items-center justify-between"><p className="inline-flex rounded-full bg-cream px-4 py-2 text-xl font-black tracking-tight">AllAboard!<span className="text-coral">@99</span></p><LanguageToggle language={language} onChange={changeLanguage} /></header><section className="min-h-[580px] rounded-[2rem] bg-cream p-6 shadow-soft sm:p-10"><div className="mb-9"><p className="font-semibold">{t.journey}</p><p className="mt-1 text-sm text-ink/60">{t.step} {current} {t.of} 16</p><div className="mt-4"><ProgressBar current={current} /></div></div><div key={`${current}-${language}`} className="step-enter"><StepContent step={step} employee={employee} t={t} language={language} onAdvance={advance} busy={busy} error={error} setError={setError} /><nav className="mt-10 flex flex-wrap justify-between gap-3 border-t border-ink/10 pt-6">{current > 1 ? <Button variant="secondary" onClick={back}>← {t.previous}</Button> : <span />}{current !== 16 && <Button onClick={advance} disabled={busy}>{current === 15 ? t.done : step.optional ? t.skip : t.next}</Button>}</nav></div><button onClick={() => { clearSession(); setEmployee(null); setCurrent(1); setCompleted([]) }} className="mt-8 text-xs font-semibold text-ink/60 underline">{t.signOut}</button></section></main>
}

function StepContent({ step, employee, t, language, onAdvance, busy, error, setError }: { step: typeof steps[number]; employee: Employee; t: typeof translations.en; language: Language; onAdvance: () => Promise<void>; busy: boolean; error: string; setError: (s: string) => void }) {
  const [question, setQuestion] = useState('');
const [saved, setSaved] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);
const [answers, setAnswers] = useState<Record<string,string>>({});
const [questions, setQuestions] = useState<{step_number:number;question:string}[]>([]);
const [copied, setCopied] = useState(false);

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
  useEffect(() => { if (step.kind === 'manager' && supabase) supabase.from('onboarding_questions').select('step_number,question').eq('employee_id', employee.id).in('step_number', [3,4,5,6]).then(({data}) => setQuestions(data || [])) }, [step.kind, employee.id])
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
  async function saveReflections() {
    if (!supabase) return;
    const records = Object.entries(answers)
      .filter(([, answer]) => answer.trim())
      .map(([question, answer]) => ({
        employee_id: employee.id,
        question,
        answer
      }));

    if (!records.length) return;

    setError('');
    const { error } = await supabase
      .from('onboarding_reflections')
      .insert(records);

    if (error) {
      console.error(error);
      setError(t.saveError);
      return;
    }

    setReflectionSaved(true);
  }
  const managerMessage = `Hi,\n\nI have a few questions from my AllAboard!@99 onboarding:\n\n${questions.map(q => `• ${q.question}`).join('\n') || 'No questions this time.'}\n\nThanks!`
  if (step.number === 1) return <><p className="text-sm font-bold uppercase tracking-[.16em] text-leaf">{t.step} 1</p><h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Welcome aboard, {employee.alias || 'there'}</h1><h2 className="mt-5 text-xl font-semibold">Your journey at the 99 Group starts here.</h2><p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">Take a few minutes to get familiar with who we are, how we work, and where to find the things you'll need along the way.</p></>
  if (step.number === 2) return <><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">You&apos;re joining the {employee.department || '99 Group'} team.</h1><p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/70">Here&apos;s a quick look at the 99ers you&apos;ll be working with.</p><ExternalLink href={TEAM_URL} className="mt-8">See who&apos;s in your team</ExternalLink></>
  if (step.kind === 'video') return <><p className="text-sm font-bold uppercase tracking-[.16em] text-leaf">{t.step} {step.number}</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{friendlyTitles[step.number]}</h1><div className="mt-8">{step.videoId && <VideoEmbed id={step.videoId} title={step.title} />}</div><label className="mt-7 block font-semibold">{t.question}<textarea value={question} onChange={e => { setQuestion(e.target.value); setSaved(false) }} placeholder={t.questionPlaceholder} className="mt-2 min-h-28 w-full rounded-2xl border border-ink/20 p-4" /></label><Button variant="secondary" onClick={saveQuestion} disabled={!question.trim()} className="mt-3">{saved ? t.saved : t.saveQuestion}</Button></>
  if (step.kind === 'reflection') return <><h1 className="text-4xl font-bold tracking-tight">A note to your future self.</h1><p className="mt-4 max-w-2xl leading-relaxed text-ink/70">{t.reflection}</p>{reflectionSaved ? <div className="mt-7 rounded-2xl bg-leaf/10 p-6 text-lg font-semibold text-leaf">Thank you for sharing your thoughts. We’ll bring them back to you on your 30th day here.</div> : <><div className="mt-7 space-y-5">{reflectionQuestions.map(q => <label key={q} className="block font-semibold">{q}<textarea value={answers[q] || ''} onChange={e => setAnswers({...answers,[q]:e.target.value})} className="mt-2 min-h-24 w-full rounded-2xl border border-ink/20 p-4 font-normal" /></label>)}</div><Button variant="secondary" onClick={saveReflections} className="mt-4">{t.done}</Button></>}</>
  if (step.kind === 'manager') return <><h1 className="text-4xl font-bold tracking-tight">Questions for your manager.</h1><p className="mt-4 leading-relaxed text-ink/70">{t.manager}</p><div className="mt-7 rounded-2xl bg-ink/5 p-5 whitespace-pre-wrap">{questions.length ? managerMessage : t.noQuestions}</div><div className="mt-4 flex gap-3"><Button variant="secondary" onClick={() => { navigator.clipboard.writeText(managerMessage); setCopied(true) }}>{copied ? t.copied : t.copyQuestions}</Button><ExternalLink href="https://99dotco.slack.com/team/U06JQRW0YLW">{t.openSlack}</ExternalLink></div></>
  if (step.kind === 'complete') return <><div className="grid h-16 w-16 place-items-center rounded-full bg-leaf text-3xl text-white">✓</div><h1 className="mt-6 text-5xl font-bold tracking-tight">You’re all set.</h1><p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/70">Now you are ready for your #YourWayHome journey.</p><p className="mt-8 rounded-2xl bg-leaf/10 p-4 font-semibold text-leaf">{t.allDone}</p></>
  if (step.kind === 'thanks') return <><div className="text-6xl">✦</div><h1 className="mt-5 text-5xl font-bold tracking-tight">Thank you.</h1><p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/70">Your AllAboard!@99 journey is complete. We’re excited to have you with us.</p>{step.externalUrl && <ExternalLink href={step.externalUrl} className="mt-8">{t.checkPlatforms}</ExternalLink>}</>
  if (step.kind === 'form') return <><h1 className="text-4xl font-bold tracking-tight">Fill out your Declaration Form.</h1><p className="mt-4 text-ink/70">{t.formFallback}</p><div className="mt-7 overflow-hidden rounded-3xl border border-ink/10"><iframe title="Declaration Form" className="h-[390px] w-full" src={step.externalUrl} loading="lazy" /></div>{step.externalUrl && <ExternalLink href={step.externalUrl} className="mt-5">Open Declaration Form</ExternalLink>}</>
  if (step.kind === 'linkedin') return <><h1 className="text-4xl font-bold tracking-tight">Update your LinkedIn profile.</h1><p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">Show the world that you're a proud 99er. Add our special Proud 99er LinkedIn badge and 99 Group LinkedIn banner to your profile and let your network know you're part of the team.</p><div className="mt-7 grid gap-4 sm:grid-cols-2"><ExternalLink href="https://drive.usercontent.google.com/download?id=1PLqiJtAULCCn5onEThpgxgJawB0hHYV_&export=download&authuser=0&confirm=t&uuid=62150135-e542-4b67-8a77-b004d2c61476&at=AFYLz4MmJN93TOmrJa0cBlxswg0t:1786611872173">Download Banner</ExternalLink><ExternalLink href="https://www.supertwibbon.com/99ersLinkedInProfile">Create LinkedIn Badge</ExternalLink></div><div className="mt-7 flex justify-center">
  <img
    src="/linkedinprofilepreview.jpeg"
    alt="Proud 99er LinkedIn profile preview"
    className="w-full max-w-2xl rounded-2xl border border-ink/10 shadow-sm"
  />
</div>{step.externalUrl && <ExternalLink href={step.externalUrl} className="mt-6">Edit your LinkedIn profile</ExternalLink>}</>
  const details: Record<number, { title: string; copy: string; action: string }> = { 1: { title: 'Welcome aboard.', copy: 'One person. One journey. One step at a time.', action: '' }, 7: { title: 'Update your Slack profile.', copy: 'To help everyone recognise and connect with you easily, please update your profile photo, add your manager, and include your role and department.', action: t.openSlack }, 10: { title: 'Set up your email signature.', copy: 'Use the shared template to make your email recognisably 99.', action: 'Open email signature template' }, 11: { title: 'Check your onboarding schedule.', copy: 'Keep track of the important moments in your first few weeks and make sure you don’t miss any of your onboarding sessions. Don’t forget to RSVP to the meetings you’ve been invited to.', action: 'Open Google Calendar' }, 12: { title: 'You’re almost all set.', copy: 'From here, 99ers Home has everything else — benefits, forms, and the processes you may use along the way.', action: 'Explore 99ers Home' } }
  const detail = details[step.number] || { title: step.title, copy: '', action: t.resource }; return <><p className="text-sm font-bold uppercase tracking-[.16em] text-leaf">{t.step} {step.number}</p><h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{detail.title}</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/70">{detail.copy}</p>{step.externalUrl && <ExternalLink href={step.externalUrl} className="mt-8">{detail.action}</ExternalLink>}{error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}</>
}
