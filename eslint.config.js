import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  rules: {
    'no-console': ['error', {
      allow: ['log', 'info', 'warn', 'error'],
    }],
  },
  ignores: ['./src/parser', './assets', './dist'],
})
