import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist'], // Ignore the dist folder
  },
  {
    files: ['**/*.{ts,tsx}'], // Apply these rules to .ts and .tsx files
    extends: [
      js.configs.recommended, 
      'plugin:@typescript-eslint/recommended', // Use TypeScript recommended rules
    ],
    languageOptions: {
      ecmaVersion: 2020, // ECMAScript 2020 support
      globals: globals.browser, // Use browser globals
      parser: tsParser, // Set TypeScript parser
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint, // Include TypeScript ESLint plugin
    },
    rules: {
      ...reactHooks.configs.recommended.rules, // Use React Hooks recommended rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Example TypeScript rule
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [['@', './src']],
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
      },
    },
  },
];
