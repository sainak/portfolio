/** @type {import('prettier').Options}*/
module.exports = {
  semi: false,
  printWidth: 88,
  htmlWhitespaceSensitivity: "ignore",
  plugins: [
    require.resolve("prettier-plugin-tailwindcss"),
    require.resolve("prettier-plugin-astro"),
  ],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
}
