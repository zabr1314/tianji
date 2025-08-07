const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/integration/**/*.(ts|tsx|js)',
    '**/*.integration.(test|spec).(ts|tsx|js)'
  ],
  testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/.next/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Integration tests may take longer
  testTimeout: 30000,
}

module.exports = createJestConfig(customJestConfig)