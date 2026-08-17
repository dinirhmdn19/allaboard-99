export type Language = 'en' | 'id'
export type Employee = { id: string; email: string; name: string | null; alias: string | null; department: string | null }
export type StepKind = 'welcome' | 'video' | 'task' | 'form' | 'linkedin' | 'reflection' | 'manager' | 'complete' | 'thanks'
export type Step = { number: number; kind: StepKind; title: string; description?: string; videoId?: string; externalUrl?: string; optional?: boolean }
export type Progress = { current_step: number; completed_at: string | null }
