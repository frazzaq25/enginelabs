/* eslint-env node */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    es2022: true
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  },
  overrides: [
    {
      files: ['backend/**/*.{ts,tsx,js,jsx}'],
      env: {
        node: true,
        browser: false
      }
    },
    {
      files: ['frontend/**/*.{ts,tsx,js,jsx}'],
      env: {
        browser: true,
        node: false
      }
    },
    {
      files: ['**/*.config.{js,cjs,mjs,ts}'],
      env: {
        node: true
      }
    }
  ]
};
