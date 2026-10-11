import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#084745",
          foreground: "#FFFFFF",
          50: "#E8F2F1",
          100: "#D1E5E3",
          200: "#A3CBC7",
          300: "#75B1AB",
          400: "#3D8A84",
          500: "#084745",
          600: "#063936",
          700: "#042B28",
          800: "#031D1B",
          900: "#020F0E",
        },
        secondary: {
          DEFAULT: "#F7E9DF",
          foreground: "#084745",
        },
        accent: {
          DEFAULT: "#0A5C58",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#00C853",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#FF9800",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#F44336",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F4F7F7",
          foreground: "#4A635F",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#084745",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, #084745 0%, #0A5C58 100%)",
        "gradient-accent":
          "linear-gradient(135deg, #084745 0%, #3D8A84 100%)",
        "gradient-hero":
          "radial-gradient(ellipse 70% 55% at 85% 15%, rgba(8, 71, 69, 0.09) 0%, transparent 55%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
