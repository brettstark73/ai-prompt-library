module.exports = {
  "package.json": ["prettier --write"],
  "**/*.{js,jsx,mjs,cjs,html}": ["eslint --fix", "prettier --write"],
  "**/*.{json,md,yml,yaml}": ["prettier --write"],
  "*.{css,scss,sass,less,pcss}": ["stylelint --fix", "prettier --write"]
};