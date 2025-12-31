import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Background colors
    'bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-elevated', 'bg-card',
    // Text colors
    'text-primary', 'text-secondary', 'text-muted',
    // Accent colors
    'bg-accent', 'text-accent', 'border-accent',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Backgrounds
        'bg-primary': '#1a1d27',
        'bg-secondary': '#21242f',
        'bg-tertiary': '#282c38',
        'bg-elevated': '#2f3442',
        'bg-card': '#252833',

        // Text
        'text-primary': '#f8f8fa',
        'text-secondary': '#b0b2bc',
        'text-muted': '#6a6d78',

        // Accent (Gold)
        accent: {
          DEFAULT: '#c9a962',
          hover: '#dfc07a',
        },
        gold: '#c9a962',
        'accent-hover': '#dfc07a',

        // Semantic
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#f87171',
        info: '#60a5fa',
      },
      // Professional border radius (6-16px)
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
      },
      // Font families
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      // Spacing scale (4px increments)
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        '24': '96px',
      },
      // Animations
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeDown: {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-up": "fadeUp 0.6s ease-out",
        "fade-down": "fadeDown 0.6s ease-out",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin": "spin 1s linear infinite",
      },
      // Dark theme shadows
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'md': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'lg': '0 8px 40px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 30px rgba(201, 169, 98, 0.15)',
        'focus': '0 0 0 3px rgba(201, 169, 98, 0.2)',
      },
      // Typography scale - Proclusive v5 Design System
      // Headers and body use font-weight 300 (light) for elegance
      fontSize: {
        'display-1': ['60px', { lineHeight: '1.1', fontWeight: '300', letterSpacing: '0.15em' }],
        'display-2': ['48px', { lineHeight: '1.1', fontWeight: '300', letterSpacing: '0.15em' }],
        'h1': ['36px', { lineHeight: '1.2', fontWeight: '300', letterSpacing: '0.15em' }],
        'h2': ['30px', { lineHeight: '1.3', fontWeight: '300', letterSpacing: '-0.02em' }],
        'h3': ['24px', { lineHeight: '1.4', fontWeight: '300', letterSpacing: '-0.02em' }],
        'body': ['15px', { lineHeight: '1.6', fontWeight: '300' }],
        'ui': ['14px', { lineHeight: '1.5', fontWeight: '500' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '300' }],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
