module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterSetup: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.{js,jsx}', '**/?(*.)+(spec|test).{js,jsx}'],
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/main.jsx', '!src/**/*.test.{js,jsx}'],
}
