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

      colors: {
        'primary-button': 'bg-gradient-to-r from-[#2E0485] via-[#3A0A9C] to-[#310093]',
        'warning-button': 'bg-[#826FF9]',
        'secondary-color': 'text-[#C6CACF]'
      }
    }
  },
  plugins: []
}
export default config
