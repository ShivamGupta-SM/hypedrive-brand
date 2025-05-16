// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    settings: {
      'import/resolver': {
        typescript: {},
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          moduleDirectory: ['node_modules', '.'],
        },
      },
    },
    rules: {
      'react-native/no-inline-styles': 'off',
      'import/no-unresolved': 'error',
    },
  },
]);
