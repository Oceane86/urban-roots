/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {backdropBlur: {
      sm: '4px',
      // vous pouvez ajouter d'autres niveaux de flou ici
    }},
  },
  plugins: [],
}
