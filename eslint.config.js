// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const tsParser = require('@typescript-eslint/parser');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
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
