/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        panel: "#172033",
        line: "#293447",
        electric: "#ff5a36",
        mint: "#75e6c8",
      },
    },
  },
  plugins: [],
};
