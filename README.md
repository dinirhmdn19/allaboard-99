# AllAboard!@99

Warm, bilingual onboarding for new 99 Group employees. It is a Next.js 14, TypeScript, Tailwind CSS and Supabase application designed as one resumable 16-step journey.

## Run locally

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local` and set the public Supabase URL and anonymous key.
3. Run `pnpm dev`.

Only these browser-safe variables are used:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Never add service-role keys, database passwords, Slack webhooks, or other secrets to this app.

## Supabase assumptions

The application reads `employees`, `onboarding_progress`, `onboarding_step_progress`, and `onboarding_questions` from the existing project. Work emails are trimmed and lowercased, and records must have an `employee_status` of `active` (case-insensitive).

Progress is created on the first verified email lookup, then each completed step is upserted. A small, non-secret verified employee record is kept in local storage so a user can resume after refresh. Proper identity-based authentication and RLS policies are still needed before production release; this MVP intentionally never disables RLS.

Step 13 needs `onboarding_reflections`. The reviewed, optional migration is in [supabase/reflections.sql](supabase/reflections.sql). It enables RLS but deliberately does not create a broad public policy. Add a narrow policy once the authentication model is chosen.

## Structure

- `config/steps.ts` – the complete data-driven 16-step configuration
- `components/onboarding.tsx` – journey and step behaviour
- `components/ui.tsx` – reusable buttons, progress, language switcher and embeds
- `lib/supabase.ts` – browser-safe Supabase client
- `translations/index.ts` – English and Bahasa Indonesia copy
- `types/` – shared domain types

## External services and future integrations

Google Drive videos and Forms attempt to embed, while retaining an external-tab fallback. Slack, LinkedIn, Calendar and 99ers Home always use safe external links. The manager message is copied rather than sent; no Slack API integration is claimed. Completion currently uses an honest on-screen notification and keeps the notification boundary suitable for a future server-side integration.

## Deployment

Deploy to Vercel as a standard Next.js project and set the two public environment variables in Vercel. No custom server configuration is required. Before production, verify RLS policies for the anonymous-session flow or replace it with proper authentication.
