module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-unused-vars': [
      2,
      { vars: 'all', args: 'none', varsIgnorePattern: '^_' },
    ],
  },
  ignorePatterns: ['tests'],
};
