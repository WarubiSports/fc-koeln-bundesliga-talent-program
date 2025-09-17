// eslint.config.js
import tseslint from 'typescript-eslint';

export default [
  // Ignore build output + legacy
  { ignores: ['dist/**', 'legacy/**', 'node_modules/**'] },

  // ✅ Recommended TS rules with type info (for app code)
  ...tseslint.configs.recommendedTypeChecked,

  // App TS files: point ESLint at your TS project
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.server.json'],
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
    },
  },

  // ✅ Tests LAST: turn off type-aware parsing for tests so they don't need to be in the TS project
  {
    files: ['**/__tests__/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: null, // disable project lookup for tests
      },
    },
    rules: {
      // you can relax rules here if you want
    },
  },
];
