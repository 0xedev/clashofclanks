/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './frame/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'coc-purple': '#8b5cf6',
        'coc-pink': '#ec4899',
        'coc-blue': '#3b82f6',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
