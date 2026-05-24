/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Outfit", "sans-serif"],
      },
      // ─── Custom micro typography scale ───────────────────────────────
      // text-4xs (8px), text-3xs (9px), text-2xs (10px) used across 30+ components
      fontSize: {
        '4xs': ['0.8125rem', { lineHeight: '1.125rem' }],  // 13px / 18px
        '3xs': ['0.875rem', { lineHeight: '1.25rem' }],   // 14px / 20px
        '2xs': ['0.9375rem', { lineHeight: '1.375rem' }],  // 15px / 22px
      },
      // ─── Custom shadow scale ─────────────────────────────────────────
      // shadow-xs / shadow-2xs / shadow-3xs used across 20+ components
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.08)',
        '2xs': '0 1px 2px 0 rgb(0 0 0 / 0.06)',
        '3xs': '0 1px 1px 0 rgb(0 0 0 / 0.04)',
      },
      // ─── Custom backdrop blur scale ──────────────────────────────────
      backdropBlur: {
        'xs': '2px',
      },
      // ─── Custom border width (border-l-3 used in TaskCard, KanbanColumn) ──
      borderWidth: {
        '3': '3px',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-subtle": "pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
    },
  },
  plugins: [],
}
