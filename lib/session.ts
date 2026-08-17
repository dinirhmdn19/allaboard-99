import type { Employee, Language } from '@/types'
const KEY = 'allaboard-session'
export const getSession = (): Employee | null => { try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : null } catch { return null } }
export const saveSession = (employee: Employee) => localStorage.setItem(KEY, JSON.stringify(employee))
export const clearSession = () => localStorage.removeItem(KEY)
export const getLanguage = (): Language => { const stored = localStorage.getItem('allaboard-language'); if (stored === 'en' || stored === 'id') return stored; return navigator.language.toLowerCase().startsWith('id') ? 'id' : 'en' }
export const saveLanguage = (language: Language) => localStorage.setItem('allaboard-language', language)
