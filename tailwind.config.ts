import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    screens: {
      sm: '640px', // => @media (min-width: 640px) { ... }
      md: '768px', // => @media (min-width: 768px) { ... }
      lg: '1024px', // => @media (min-width: 1024px) { ... }
      xl: '1280px', // => @media (min-width: 1280px) { ... }
      '2xl': '1636px' // => @media (min-width: 1536px) { ... }
    },
    extend: {

      backgroundImage: {
        poolImage: "url('../../static')"
      },
      animation: {
        'spin-fast': 'spin 0.5s linear infinite', // Faster spin
        'spin-slow': 'spin 2s linear infinite' // Slower spin
      },
      dropShadow: {
        glow: [
          '0 0px 20px rgba(255,255, 255, 0.35)',
          '0 0px 65px rgba(255, 255,255, 0.2)'
        ]
      },
      // add all colors vars used here and refactor the dapp style color
      colors: {
        bgColor: '#210158',
        primary: '#836EF9',
        error: '#FF1010',
        darkPurple: '#1B0344',
        yellow: '#F3EC5D',
        blueviolet: '#5D6EF3',
        success: '#74DE1D',
        highlight: '#8438FF',
        primary2: '#6453c6',
        secondary1: '#22064f',
        secondary2: '#1F0050',
        secondary3: '#2a016b',
        textSecondary: '#8a8ea8',
        blue7: '#7365ce'
      },
      fontFamily: {
        fira: ['var(--font-fira-code)'],
        clash: ['Clash', 'sans-serif'],
        regular: ['Clash-regular', 'sans-serif']
      },
      fontSize: {
        normal: '16px'
      },
      transitionProperty: {
        height: 'height'
      }
    }
  },
  plugins: []
}
export default config
