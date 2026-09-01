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
          50: '#f0f9ff',
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        dark: {
          950: '#0b0f17',
          900: '#0f172a',
          850: '#131e36',
          800: '#1e293b',
          750: '#26344d',
          700: '#334155',
          600: '#475569',
        },
        editor: {
          bg: '#1e1e1e',
          gutter: '#181818',
          tab: '#252526',
          activeTab: '#1e1e1e',
          border: '#2d3748',
        },
        status: {
          valid: '#10b981',
          failed: '#ef4444',
          unsolved: '#64748b',
          easy: '#10b981',
          medium: '#f59e0b',
          hard: '#ef4444',
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
