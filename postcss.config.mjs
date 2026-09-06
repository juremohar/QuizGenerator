/** Tailwind v4 ships as a PostCSS plugin; there is no tailwind.config.js any more -
    the theme lives in `@theme` inside styles/globals.css. */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
