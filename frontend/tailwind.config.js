/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'canvas-bg': '#F4F1EA',
        'canvas-card': '#FAF8F5',
        'canvas-sunken': '#ECE7DE',
        'ink-primary': '#1A1A18',
        'ink-muted': '#6B675E',
        'ink-subtle': '#969186',
        'rule-hairline': '#D8D3C8',
        'rule-strong': '#B8B2A4',
        'accent-primary': '#C2410C',
        'accent-hover': '#9A3412',
        'status-pass': '#2F6B4F',
        'status-pass-bg': '#E7F0EB',
        'status-fail': '#991B1B',
        'status-fail-bg': '#FBEAEA',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px',
        md: '3px',
        none: '0px'
      }
    },
  },
  plugins: [],
};
