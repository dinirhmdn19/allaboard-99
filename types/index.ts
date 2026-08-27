export type Language = 'en' | 'id'
export type Employee = { id: string; email: string; name: string | null; alias: string | null; department: string | null; job_title: string | null; manager_name: string | null }
export type StepKind = 'welcome' | 'video' | 'task' | 'form' | 'linkedin' | 'reflection' | 'manager' | 'complete' | 'thanks'
export type Step = { number: number; kind: StepKind; title: string; description?: string; videoId?: string; externalUrl?: string; optional?: boolean }

export type OnboardingVideo = {
  step_number: number
  title: string
  storage_path: string
  is_active: boolean
}
export type Progress = { current_step: number; completed_at: string | null }
