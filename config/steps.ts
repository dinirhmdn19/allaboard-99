import type { Step } from '@/types'

export const steps: Step[] = [
  { number: 1, kind: 'welcome', title: 'Welcome' },
  { number: 2, kind: 'welcome', title: 'Meet Your Team' },
  { number: 3, kind: 'video', title: 'Our Story, Mission & Leaders', videoId: '1lN0IN4_lRBhsbvqpNDuSy0EmQWUxQ6ob' },
  { number: 4, kind: 'video', title: 'How 99 Works', videoId: '1VA7M_PCA1mwpEk9wMAdAuBJHcrt1qgVw' },
  { number: 5, kind: 'video', title: 'Life at 99', videoId: '1VIdNBTTrFcBNc_6a1PNcVDzSHPnfVEpa' },
  { number: 6, kind: 'video', title: 'Your 99er Toolkit', videoId: '1zB8jyX9PEgVlkTloNRZMyLPMV2xBpQMX' },
  { number: 7, kind: 'task', title: 'Update Your Slack Profile', externalUrl: 'https://99dotco.slack.com/team/U06JQRW0YLW' },
  { number: 8, kind: 'form', title: 'Declaration Form', externalUrl: 'https://docs.google.com/forms/d/1fhIb6u-y80kltfePl3JYzimZjloOgYdtf7d1hzrpu70/viewform?edit_requested=true' },
  { number: 9, kind: 'linkedin', title: 'Update Your LinkedIn', optional: true, externalUrl: 'https://www.linkedin.com/in/me/edit/intro/' },
  { number: 10, kind: 'task', title: 'Email Signature', optional: true, externalUrl: 'https://docs.google.com/document/d/1xm4BQg5dqKvDqZieW0PixA6831SnLui7lQLTAXMAWoQ/edit?tab=t.0' },
  { number: 11, kind: 'task', title: 'Google Calendar', externalUrl: 'https://calendar.google.com/' },
  { number: 12, kind: 'task', title: '99ers Home', externalUrl: 'https://sites.google.com/99.co/99ers-home/about-the-team' },
  { number: 13, kind: 'reflection', title: 'Note to Self' },
  { number: 14, kind: 'manager', title: 'Ask Your Manager' },
  { number: 15, kind: 'complete', title: "You're All Set" },
  { number: 16, kind: 'thanks', title: 'Thank You', externalUrl: 'https://sites.google.com/99.co/99ers-home/onboarding-process#h.7ypgqvjuk7hv' }
]
export const reflectionQuestions = [
  'What are you hoping to learn during your first month?',
  'What do you want to remember about how you feel on your first day?',
  'What would make you feel that your first month at 99 has been a good one?',
  'Is there anything you’re nervous, curious or excited about?'
]
