// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    plugins: {
      prettier: require('eslint-plugin-prettier'),
    },
    rules: {
      'prettier/prettier': 'error',
    },
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'ios/*', 'android/*'],
  },
];
