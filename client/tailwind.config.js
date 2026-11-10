/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d0dbe7',
          300: '#a7bdd4',
          400: '#769cbd',
          500: '#537ea6',
          600: '#3f658c',
          700: '#345272',
          800: '#2d455f',
          900: '#293b4f',
          950: '#1b2634',
        },
        editorial: {
          paper: '#fdfbf7',
          ink: '#1a1a1a',
          muted: '#6b7280',
          border: '#e5e7eb',
          darkBg: '#0f172a',
          darkCard: '#1e293b',
          darkBorder: '#334155',
        }
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'Cambria', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
