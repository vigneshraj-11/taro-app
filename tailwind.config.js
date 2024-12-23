/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        goldenrod: "#DAA520",
        lightgoldenrod: "#D7AE46",
      },
      animation: {
        blink: "blink 2s linear infinite",
      },
      keyframes: {
        blink: {
          "0%": { backgroundColor: "#f87171" },
          "50%": { backgroundColor: "#fff" },
          "100%": { backgroundColor: "#f87171" },
        },
      },
    },
  },
  plugins: [],
};
