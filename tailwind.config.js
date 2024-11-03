/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",

    // Path to the tremor module
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Nunito", "sans-serif"],
        sans: ["Cabin", "sans-serif"],
      },
      colors: {
        surface: {
          light: "#F5F8FA",
          DEFAULT: "#F5F8FA",
          dark: "#212121",
        },
        onSurface: {
          light: "#1B1B1B",
          DEFAULT: "#1B1B1B",
          dark: "#F5F8FA",
        },
        surfaceContainer: {
          light: "#FCFEFF",
          DEFAULT: "#FCFEFF",
          dark: "#313131",
        },
        primary: {
          light: "#008DDE",
          DEFAULT: "#008DDE",
          dark: "#65C7FF",
        },
        onPrimary: {
          light: "#FFFFFF",
          DEFAULT: "#FFFFFF",
          dark: "#1E1E1E",
        },
        secondary: {
          light: "#6E6E6E",
          DEFAULT: "#6E6E6E",
          dark: "#B7B7B7",
        },
        onSecondary: {
          light: "#FFFFFF",
          DEFAULT: "#FFFFFF",
          dark: "#1E1E1E",
        },
        accent: {
          light: "#FFAA00",
          DEFAULT: "#FFAA00",
          dark: "#FFC95D",
        },
        border: {
          light: "#D2D2D2",
          DEFAULT: "#D2D2D2",
          dark: "#616161",
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents, theme }) {
      addComponents({
        ".label-md": {
          fontWeight: "700",
          fontSize: "0.875rem",
          fontFamily: '"Nunito", sans-serif',
          textTransform: "uppercase",
        },
        ".label-lg": {
          fontWeight: "700",
          fontSize: "1rem",
          fontFamily: '"Nunito", sans-serif',
          textTransform: "uppercase",
        },
      });
    }),
  ],
};
