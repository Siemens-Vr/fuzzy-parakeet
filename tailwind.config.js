/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",    // if you use app router
    "./pages/**/*.{js,ts,jsx,tsx}",      // if you use pages router
    "./components/**/*.{js,ts,jsx,tsx}", // your components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
