import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Navy colors
    'bg-navy-950', 'bg-navy-900', 'bg-navy-800', 'bg-navy-700', 'bg-navy-600',
    'text-navy-950', 'text-navy-900', 'text-navy-800', 'text-navy-700', 'text-navy-600',
    'border-navy-950', 'border-navy-900', 'border-navy-800', 'border-navy-700', 'border-navy-600',
    // Blue colors
    'bg-blue-600', 'bg-blue-500', 'bg-blue-400', 'bg-blue-300', 'bg-blue-100',
    'text-blue-600', 'text-blue-500', 'text-blue-400', 'text-blue-300', 'text-blue-100',
    // Orange colors
    'bg-orange-600', 'bg-orange-500', 'bg-orange-400', 'bg-orange-300', 'bg-orange-100',
    'text-orange-600', 'text-orange-500', 'text-orange-400', 'text-orange-300', 'text-orange-100',
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
        // Navy Foundation (#2C3E50)
        navy: {
          950: "hsl(210, 40%, 12%)",
          900: "hsl(210, 40%, 16%)",
          800: "hsl(210, 40%, 20%)",
          700: "hsl(210, 35%, 28%)",
          600: "hsl(210, 30%, 36%)",
        },
        // Interactive Blue (#3498DB)
        blue: {
          50: "#eff6ff",
          100: "hsl(204, 60%, 92%)",
          200: "#bfdbfe",
          300: "hsl(204, 77%, 72%)",
          400: "hsl(204, 88%, 58%)",
          500: "hsl(204, 94%, 44%)",
          600: "hsl(204, 96%, 27%)",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        // Value Orange (#E67E22)
        orange: {
          50: "#fff7ed",
          100: "hsl(24, 70%, 94%)",
          200: "#fed7aa",
          300: "hsl(24, 88%, 75%)",
          400: "hsl(24, 92%, 65%)",
          500: "hsl(24, 90%, 55%)",
          600: "hsl(24, 85%, 45%)",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        // Neutral Grays
        gray: {
          50: "hsl(var(--gray-50))",
          100: "hsl(var(--gray-100))",
          200: "hsl(var(--gray-200))",
          300: "hsl(var(--gray-300))",
          400: "hsl(var(--gray-400))",
          500: "hsl(var(--gray-500))",
          600: "hsl(var(--gray-600))",
          700: "hsl(var(--gray-700))",
          800: "hsl(var(--gray-800))",
          900: "hsl(var(--gray-900))",
        },
        // Semantic colors
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        badge: {
          compliance: "hsl(var(--badge-compliance))",
          capability: "hsl(var(--badge-capability))",
          reputation: "hsl(var(--badge-reputation))",
          enterprise: "hsl(var(--badge-enterprise))",
        },
      },
      // Professional border radius (6-16px)
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
      },
      // Inter font only
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "sans-serif"],
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
      // Minimal animations
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
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "spin": "spin 1s linear infinite",
      },
      // Subtle professional shadows
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 8px 0 rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
        'focus': '0 0 0 3px rgba(52, 152, 219, 0.2)',
      },
      // Typography scale
      fontSize: {
        'display-1': ['60px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-2': ['48px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h1': ['36px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.02em' }],
        'h2': ['30px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.02em' }],
        'h3': ['24px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '-0.02em' }],
        'body': ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'ui': ['14px', { lineHeight: '1.5', fontWeight: '500' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
