import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    screens: {
      'sm': '640px',  // => @media (min-width: 640px) { ... }
      'md': '768px',  // => @media (min-width: 768px) { ... }
      'lg': '1024px', // => @media (min-width: 1024px) { ... }
      'xl': '1280px', // => @media (min-width: 1280px) { ... }
      '2xl': '1536px' // => @media (min-width: 1536px) { ... }
    },
    extend: {

      animation : {
        'spin-fast': 'spin 0.5s linear infinite', // Faster spin
        'spin-slow': 'spin 2s linear infinite',   // Slower spin
      },

      colors: {
        'primary-button': 'bg-gradient-to-r from-[#2E0485] via-[#3A0A9C] to-[#310093]',
        'warning-button': 'bg-[#826FF9]',
        'secondary-color': 'text-[#C6CACF]',
        'bgColor': '#160238',
        'primary': '#836EF9',
        'primary2': '#6453c6',
        'secondary1': '#22064f',
        'secondary2': '#1F0050',
        'textSecondary': '#696c80',
        'blue7': '#7365ce',
      },
      fontFamily: {
        fira: ['var(--font-fira-code)']
      }
    }
  },
  plugins: []
}
export default config
