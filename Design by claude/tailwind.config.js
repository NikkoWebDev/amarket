/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Core brand palette ──────────────────────────────
        petal: {
          50:  "#fff5f8",
          100: "#ffe8f0",
          200: "#ffd0e3",
          300: "#ffaece",
          400: "#ff7db2",
          500: "#ff4d94",
          600: "#f0277a",
          700: "#cc1562",
          800: "#a8144f",
          900: "#8c1544",
        },
        blush: {
          50:  "#fdf2f7",
          100: "#fce7f1",
          200: "#fad0e5",
          300: "#f7acd1",
          400: "#f27bb7",
          500: "#e9509d",
          600: "#d42e81",
          700: "#b01f67",
        },
        lavender: {
          50:  "#f4f0ff",
          100: "#ece5ff",
          200: "#daccff",
          300: "#c0a8ff",
          400: "#a27bff",
          500: "#8b52ff",
          600: "#7a30f5",
          700: "#6820d9",
          800: "#571cb5",
          900: "#481a93",
        },
        mauve: {
          50:  "#faf5ff",
          100: "#f4e8ff",
          200: "#ead4ff",
          300: "#d9b4fe",
          400: "#c48afc",
          500: "#ac5ef7",
          600: "#9333ea",
        },
        // ── Neutral surface palette ─────────────────────────
        canvas: {
          50:  "#fefcfd",
          100: "#fdf8fb",
          200: "#faf0f6",
          300: "#f5e4ef",
        },
        mist: {
          50:  "#f9f8fc",
          100: "#f2f0f9",
          200: "#e6e2f5",
          300: "#d1cbe9",
          400: "#b0a7d4",
          500: "#8e84b8",
          600: "#6b5f97",
          700: "#4e4470",
          800: "#352f50",
          900: "#201c33",
        },
      },

      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        body:    ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },

      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },

      boxShadow: {
        "soft":      "0 2px 12px 0 rgba(180, 80, 140, 0.08)",
        "soft-md":   "0 4px 24px 0 rgba(180, 80, 140, 0.12)",
        "soft-lg":   "0 8px 40px 0 rgba(180, 80, 140, 0.16)",
        "soft-xl":   "0 16px 60px 0 rgba(180, 80, 140, 0.22)",
        "float":     "0 -4px 20px rgba(255, 80, 148, 0.25), 0 8px 30px rgba(180, 80, 140, 0.20)",
        "glow-petal":"0 0 24px rgba(255, 77, 148, 0.40)",
        "glow-lav":  "0 0 24px rgba(139, 82, 255, 0.35)",
        "card":      "0 1px 3px rgba(180,80,140,0.06), 0 4px 16px rgba(180,80,140,0.08)",
        "card-hover":"0 4px 12px rgba(180,80,140,0.08), 0 12px 36px rgba(180,80,140,0.14)",
        "inner-soft":"inset 0 1px 4px rgba(180,80,140,0.08)",
      },

      backgroundImage: {
        "gradient-petal":   "linear-gradient(135deg, #ffe8f0 0%, #f4e8ff 100%)",
        "gradient-ai":      "linear-gradient(135deg, #ffd0e3 0%, #daccff 40%, #c0a8ff 100%)",
        "gradient-aurora":  "linear-gradient(135deg, rgba(255,208,227,0.6) 0%, rgba(218,204,255,0.6) 50%, rgba(192,168,255,0.5) 100%)",
        "gradient-card":    "linear-gradient(160deg, #fff5f8 0%, #faf0f6 100%)",
        "gradient-nav":     "linear-gradient(180deg, rgba(253,248,251,0) 0%, rgba(253,248,251,0.95) 30%, #fdf8fb 100%)",
        "mesh-pink":        "radial-gradient(ellipse at 20% 20%, rgba(255,174,206,0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(192,168,255,0.35) 0%, transparent 60%), radial-gradient(ellipse at 50% 50%, rgba(253,242,247,1) 0%, transparent 100%)",
      },

      animation: {
        "float-up":    "floatUp 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "slide-in":    "slideIn 0.35s ease-out forwards",
        "fade-in":     "fadeIn 0.3s ease-out forwards",
        "badge-pop":   "badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "progress":    "progressFill 1.2s cubic-bezier(0.4,0,0.2,1) forwards",
        "shimmer":     "shimmer 2.5s linear infinite",
        "bubble-in":   "bubbleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "pulse-glow":  "pulseGlow 2.5s ease-in-out infinite",
      },

      keyframes: {
        floatUp: {
          "0%":   { transform: "translateY(14px) scale(0.96)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)",       opacity: "1" },
        },
        slideIn: {
          "0%":   { transform: "translateX(-16px)", opacity: "0" },
          "100%": { transform: "translateX(0)",     opacity: "1" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        badgePop: {
          "0%":   { transform: "scale(0)", opacity: "0" },
          "70%":  { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        progressFill: {
          "0%":   { width: "0%" },
          "100%": { width: "var(--progress-width)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        bubbleIn: {
          "0%":   { transform: "scale(0.8) translateY(8px)", opacity: "0" },
          "100%": { transform: "scale(1) translateY(0)",      opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%":      { opacity: "1",   transform: "scale(1.04)" },
        },
      },
    },
  },
  plugins: [],
};
