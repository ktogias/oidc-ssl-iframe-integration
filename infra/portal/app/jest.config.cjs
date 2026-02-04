/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  }
};
