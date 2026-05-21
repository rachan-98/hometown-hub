export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Primary brand color (orange-red)
        primary: {
          50:  '#fef3ee',
          100: '#fde4d3',
          200: '#fbc5a5',
          300: '#f89e70',
          400: '#f56a38',
          500: '#f34c14',
          600: '#e33209',
          700: '#bc2709',
          800: '#95220f',
          900: '#7a1e0f',
        },
        // Surface/neutral grays
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}