module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverage: false,
  moduleNameMapper: {
    '^aws-cdk-lib$': '<rootDir>/test/stubs/aws-cdk-lib/index.ts',
    '^aws-cdk-lib/(.*)$': '<rootDir>/test/stubs/aws-cdk-lib/$1',
    '^constructs$': '<rootDir>/test/stubs/constructs/index.ts',
    '^@aws-cdk/assertions$': '<rootDir>/test/stubs/assertions/index.ts',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
};
