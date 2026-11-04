import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import vitest from '@vitest/eslint-plugin';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.angular/**',
      'dist/**',
      'coverage/**',
      '**/*.generated.*',
      'src/locales/generated/**',
      'tooling/api-contract-proof/generated/**',
    ],
  },
  {
    files: ['src/**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...angular.configs.tsRecommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.spec.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],
    },
  },
  {
    files: ['src/**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  },
  {
    files: ['src/**/*.spec.ts'],
    plugins: { vitest },
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      'vitest/unbound-method': ['error', { ignoreStatic: true }],
      // Async fixtures intentionally model a Promise even when no work is awaited.
      '@typescript-eslint/require-await': 'off',
    },
  },
);
