import type { Step } from '@/types'

export const steps: Step[] = [
  { number: 1, kind: 'welcome', title: 'Welcome' },
  { number: 2, kind: 'welcome', title: 'Meet Your Team' },
  { number: 3, kind: 'task', title: 'Systems Check' },
  { number: 4, kind: 'video', title: 'Watch Video: Our Story, Mission, and Leaders', videoId: '1lN0IN4_lRBhsbvqpNDuSy0EmQWUxQ6ob' },
  { number: 5, kind: 'video', title: 'Watch Video: Values, Culture, and Environment', videoId: '1VA7M_PCA1mwpEk9wMAdAuBJHcrt1qgVw' },
  { number: 6, kind: 'video', title: 'Watch Video: Flywheel, Operations, and Systems', videoId: '1VIdNBTTrFcBNc_6a1PNcVDzSHPnfVEpa' },
  { number: 7, kind: 'video', title: 'Watch Video: Resources, Support, and Community', videoId: '1zB8jyX9PEgVlkTloNRZMyLPMV2xBpQMX' },
  { number: 8, kind: 'task', title: 'Update Your Slack Profile', externalUrl: 'https://99dotco.slack.com/team/U06JQRW0YLW' },
  { number: 9, kind: 'form', title: 'Declaration Form', externalUrl: 'https://docs.google.com/forms/d/1fhIb6u-y80kltfePl3JYzimZjloOgYdtf7d1hzrpu70/viewform?edit_requested=true' },
  { number: 10, kind: 'linkedin', title: 'Update Your LinkedIn', optional: true, externalUrl: 'https://www.linkedin.com/in/me/edit/intro/' },
  { number: 11, kind: 'task', title: 'Email Signature', optional: true, externalUrl: 'https://docs.google.com/document/d/1xm4BQg5dqKvDqZieW0PixA6831SnLui7lQLTAXMAWoQ/edit?tab=t.0' },
  { number: 12, kind: 'task', title: 'Check your onboarding schedule.', externalUrl: 'https://calendar.google.com/' },
  { number: 13, kind: 'task', title: '99ers Home', externalUrl: 'https://sites.google.com/99.co/99ers-home/about-the-team' },
  { number: 14, kind: 'reflection', title: 'Note to Self' },
  { number: 15, kind: 'complete', title: 'Rate your AllAboard!@99 Experience' },
]
export const reflectionQuestions = [
  'What are you hoping to learn during your first month?',
  'What do you want to remember about how you feel on your first day?',
  'What would make you feel proud of your first month at 99?',
  'What are you most nervous, curious, or excited about as you start your journey at 99?'
]
