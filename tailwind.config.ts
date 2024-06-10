import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        'primary-button': 'bg-gradient-to-r from-[#2E0485] via-[#3A0A9C] to-[#310093]',
        'warning-button': 'bg-[#826FF9]'
      }
    }
  },
  plugins: []
}
export default config
