/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0E0D0D',
        'bg-2': '#171614',
        surface: '#1a1816',
        card: '#1f1d1b',
        'card-2': '#26241f',
        accent: '#D11537',
        'accent-d': '#a30f29',
        'accent-2': '#e63b58',
        green: '#00e07a',
        'green-d': '#00a85c',
        gold: '#f0c040',
        fg: '#ffffff',
        'fg-2': 'rgba(255,255,255,0.7)',
        'fg-3': 'rgba(255,255,255,0.5)',
        'fg-4': 'rgba(255,255,255,0.3)',
        line: 'rgba(255,255,255,0.07)',
        'line-2': 'rgba(255,255,255,0.14)',
      },
      fontFamily: {
        display: ['Unbounded_700Bold', 'Unbounded_800ExtraBold'],
        body: ['Inter_500Medium', 'Inter_600SemiBold'],
        mono: ['JetBrainsMono_400Regular', 'JetBrainsMono_500Medium'],
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '18px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};
