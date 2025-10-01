/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require("next/jest");

const createJestConfig = nextJest({ 
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "node",
  moduleNameMapper: { 
    "^@/(.*)$": "<rootDir>/$1"
  },
  testMatch: [
    "**/tests/**/*.test.ts"
  ],
};

module.exports = createJestConfig(customJestConfig);