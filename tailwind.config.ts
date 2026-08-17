import type { Config } from 'tailwindcss'
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#17362c', leaf: '#4f9e72', cream: '#fbfaf4', coral: '#ef8b69' }, boxShadow: { soft: '0 16px 40px rgba(20, 56, 42, .10)' } } }, plugins: [] }
export default config
