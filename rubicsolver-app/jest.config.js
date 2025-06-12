export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      { tsconfig: 'tsconfig.test.json', useESM: true },
    ],
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
  },
  roots: ['<rootDir>', '../__tests__'],
  setupFiles: ['<rootDir>/tests/setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
};
