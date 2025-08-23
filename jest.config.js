module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}', '**/?(*.)+(spec|test).{js,jsx,ts,tsx}'],
  passWithNoTests: true,
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    'stores/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
};
