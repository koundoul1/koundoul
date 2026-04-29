module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  globals: {
    // Vite injects import.meta.env at build time
    // eslint doesn't understand import.meta natively in eslint 8
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['react', 'react-hooks', 'react-refresh'],
  settings: {
    react: { version: '18.2' },
  },
  rules: {
    // Relaxed for existing codebase — tighten in Phase 6
    'react/prop-types': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'react/no-unescaped-entities': 'warn',
    'react-refresh/only-export-components': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-undef': 'warn',
    'no-console': 'off',
  },
  ignorePatterns: ['dist/', 'node_modules/', 'backend/', '*.config.js', '*.config.cjs'],
}
