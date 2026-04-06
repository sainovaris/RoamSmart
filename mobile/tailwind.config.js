/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: "#d05203",        // main button color 🔥
        brandDark: "#7d391e",    // app background

        primary: "#FF7A00",
        secondary: "#E85D04",

        bg: "#FFFFFF",
        surface: "#FFF3E6",

        text: "#2C2C2C",
        textLight: "#6B6B6B",
      }
    },
  },
  plugins: [],
}