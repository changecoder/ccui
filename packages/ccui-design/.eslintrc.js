module.exports = {
  extends: [
    'airbnb',
    'prettier'
  ],
  env: {
    browser: true,
    node: true,
    jasmine: true,
    es6: true
  },
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'babel', '@typescript-eslint', 'react-hooks']
}