/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/hooks/**/*.{js,jsx,ts,tsx}",
    "./src/services/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        dark: "#231709",
        chocolate: "#5D3E14",
        orange: "#AA500F",
        bone: "#D9D9D9",
        white: "#FFFFFF",
        green:"#037E11",
        red: "#A70000"
      },
    },
  },
  plugins: [],
};