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
          DEFAULT: "#001A47", // NexaTech Navy
          foreground: "#FFFFFF",
          50: "#E6EBF4",
          100: "#CCD7E9",
          200: "#99AFD3",
          300: "#6687BD",
          400: "#335FA7",
          500: "#001A47", // Main
          600: "#001536",
          700: "#001028",
          800: "#000A1B",
          900: "#00050D",
        },
        secondary: {
          DEFAULT: "#FFFFFF",
          foreground: "#001A47",
        },
        accent: {
          DEFAULT: "#0066FF", // Bright Blue
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
          DEFAULT: "#F5F7FA",
          foreground: "#64748B",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#001A47",
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
        "gradient-primary": "linear-gradient(135deg, #001A47 0%, #003D8F 100%)",
        "gradient-accent": "linear-gradient(135deg, #0066FF 0%, #00C6FF 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
