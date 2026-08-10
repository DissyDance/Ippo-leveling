// ESLint flat config — Expo SDK 56.
// Base eslint-config-expo + interdiction stricte de `any` (SPEC : zéro any).
const expoConfig = require('eslint-config-expo/flat')

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'convex/_generated/*', 'node_modules/*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
]
