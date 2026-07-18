import type { Config } from "tailwindcss";

export const mvDesignPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1F3863",
          dark: "#13233F",
          light: "#E9EEF6",
          accent: "#C8A45D",
          "accent-light": "#F6F0E4",
        },
        canvas: "#F7F8FA",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#172033",
          muted: "#5C667A",
        },
        border: "#D9DEE8",
        success: "#1F7A4D",
        warning: "#A86500",
        danger: "#B42318",
        info: "#1769AA",
        focus: "#2F6FED",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(16,24,40,0.06)",
        card: "0 4px 16px rgba(16,24,40,0.08)",
        overlay: "0 16px 40px rgba(16,24,40,0.16)",
      },
      transitionDuration: {
        fast: "140ms",
        standard: "220ms",
        slow: "360ms",
      },
      maxWidth: {
        content: "1280px",
        reading: "760px",
      },
    },
  },
};
