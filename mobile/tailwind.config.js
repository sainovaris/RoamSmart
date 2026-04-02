/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      button: "#d05203",
      bg : "#7d391e",

      primary: "#FF7A00",
      secondary: "#E85D04",
      accent: "#FFB703",

      background: "#FFFFFF",
      surface: "#FFF3E6",

      textPrimary: "#2C2C2C",
      textSecondary: "#6B6B6B",
    },
  },
  plugins: [],
}