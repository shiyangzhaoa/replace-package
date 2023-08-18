/* eslint-disable import/no-anonymous-default-export */
/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

import * as path from 'node:path';

const __dirname = path.resolve(new URL(import.meta.url).pathname, '..', '..');

/** @type {import('jest').Config} */
export default {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 40,
      lines: 50,
      statements: 50,
    },
  },

  maxWorkers: '50%',

  moduleDirectories: ['node_modules'],

  moduleFileExtensions: ['mts', 'cts', 'jsx', 'ts', 'tsx', 'js', 'cjs', 'mjs'],

  notify: true,
  preset: 'ts-jest',
  rootDir: __dirname,

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/__tests__/**/*.test.?(m|c)ts?(x)'],

  testPathIgnorePatterns: ['/node_modules/'],

  // The regexp pattern or array of patterns that Jest uses to detect test files
  // testRegex: [],

  // setupFilesAfterEnv: ['<rootDir>/__tests__/setupTests.ts'],
  watchman: true,
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  testTimeout: 10000,
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/__tests__/tsconfig.json',
      },
    ],
  },
};
