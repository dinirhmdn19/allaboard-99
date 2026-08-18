import type { Config } from 'tailwindcss'
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#07183A', leaf: '#063799', cream: '#F4F7F9', coral: '#847552' }, boxShadow: { soft: '0 16px 40px rgba(7, 24, 58, .10)' } } }, plugins: [] }
export default config
