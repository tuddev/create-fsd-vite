module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['prettier'],
  overrides: [],
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
};
