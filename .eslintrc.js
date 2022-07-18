module.exports = {
  root: true,
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:vue/recommended'
  ],
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 7,
    sourceType: 'module'
  },
  rules: {
    'eol-last': 0,
    'space-before-function-paren': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/no-unused-components': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'no-unused-expressions': 'off',
    'vue/html-self-closing': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'eslint-disable': 'off',
    'vue/html-indent': 'off',
    'vue/no-v-model-argument': 'off',
    'no-useless-return': 'off',
    'no-debugger': 'off',
    'eqeqeq': 'off'
  }
}
