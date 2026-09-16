import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          500: "#25D366",
          600: "#1da851",
          700: "#128C7E",
          800: "#075E54",
        },
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        hospital: {
          blue: "#0284c7",
          sky: "#e0f2fe",
          emerald: "#059669",
          amber: "#d97706",
          slate: "#0f172a",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(13, 148, 136, 0.08)",
        card: "0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 12px -2px rgba(0, 0, 0, 0.02)",
        glow: "0 0 25px -5px rgba(13, 148, 136, 0.3)",
        "glow-emerald": "0 0 25px -5px rgba(37, 211, 102, 0.4)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-subtle": "pulse-subtle 3s infinite ease-in-out",
        "shimmer": "shimmer 2.5s infinite linear",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.94", transform: "scale(0.99)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

