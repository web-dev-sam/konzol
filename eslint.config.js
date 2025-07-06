import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  rules: {
    'no-console': ['error', {
      allow: ['log', 'info', 'warn', 'error'],
    }],
  },
  ignores: ['./src/parser', './assets', './dist', './README.md'],
}, {
  files: ['**/*.ts'],
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
    },
  },
  rules: {
    'ts/no-floating-promises': ['error'],
  },
})
