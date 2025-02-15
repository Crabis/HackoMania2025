/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {},
    },
    corePlugins: {
      preflight: true,  // Ensures base styles load properly
    },
    plugins: [],
  };
  