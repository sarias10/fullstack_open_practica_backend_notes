import globals from 'globals'
import js from "@eslint/js"
import stylisticJs from '@stylistic/eslint-plugin-js'

export default [
  {files: ["**/*.js"],
  languageOptions: {sourceType: "commonjs"}
  },
  {languageOptions: { globals: globals.node }},
  {ignores: ["dist","node_modules", "eslint.config.mjs"]},
  {plugins: {'@stylistic/js': stylisticJs},
    rules: {
      'eqeqeq': 'error',
      'no-trailing-spaces': 'error',
      'object-curly-spacing': [
        'error', 'always'
      ],
      'arrow-spacing': [
        'error', { 'before': true, 'after': true }
      ],
      'no-console': 0,
      '@stylistic/js/indent': [
        'error',
        4
      ],
      '@stylistic/js/linebreak-style': [
          'error',
          'windows'
      ],
      '@stylistic/js/quotes': [
          'error',
          'single'
      ],
      '@stylistic/js/semi': [
          'error',
          'never'
      ],
    }
  },
  js.configs.recommended
  
  
]