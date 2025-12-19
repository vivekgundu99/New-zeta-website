// backend/jest.config.js
module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'api/**/*.js',
        'models/**/*.js',
        'middleware/**/*.js',
        'validators/**/*.js',
        '!**/node_modules/**',
        '!**/tests/**'
    ],
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testTimeout: 30000,
    verbose: true
};