/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#231709",
        brown: "#5D3E14",
        primary: "#AA500F",
        muted: "#D9D9D9",
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
};