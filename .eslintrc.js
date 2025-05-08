module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier'
    ],
    plugins: ['@typescript-eslint', 'prettier'],
    env: {
      node: true,
      es6: true,
      jest: true
    },
    rules: {
      'prettier/prettier': 'error'
    }
  };