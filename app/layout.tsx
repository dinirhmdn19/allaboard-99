import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'AllAboard!@99', description: 'Your 99 Group onboarding journey.' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html> }
