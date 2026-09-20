import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import unicorn from 'eslint-plugin-unicorn';

export default tseslint.config(
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  // Plugin configs and rules
  js.configs.recommended,
  ...tseslint.configs.recommended,
  unicorn.configs.recommended,
  prettierPlugin,
  {
    linterOptions: {
      noInlineConfig: true,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'unicorn/prevent-abbreviations': 'off',
    },
  }
);
