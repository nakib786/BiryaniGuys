/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E67E22",   // Orange for Biryani theme
        secondary: "#2E8B57", // Forest green accent
        accent: "#D35400",    // Deeper orange for highlights
        biryaniYellow: "#F4D03F", // Saffron color
        biryaniRed: "#C0392B",    // Spice red
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

