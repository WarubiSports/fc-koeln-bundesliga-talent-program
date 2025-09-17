// eslint.config.js (ESLint v9+ flat config)
import tseslint from 'typescript-eslint';

export default [
  // Ignore build output and legacy backups
  { ignores: ['dist/**', 'legacy/**', 'node_modules/**'] },

  // Recommended TypeScript rules (type-aware)
  ...tseslint.configs.recommendedTypeChecked,

  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.server.json'],
        // use cwd so ESLint doesn't trip on ESM dirname
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
    },
  },
];
