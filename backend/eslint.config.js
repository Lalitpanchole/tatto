import js from '@eslint/js'

export default [
  { ignores: ['node_modules'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly'
      }
    },
    rules: {
      // Basic backend rules
      'no-unused-vars': 'warn'
    }
  }
]
