import path from 'path';

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const tests = ['base-import', 'not-match-default', 'not-match-props', 'name-import', 'import-other'];

describe('replace-package', () => {
  tests.forEach((test) =>
    defineTest(
      path.resolve(__dirname),
      './src/transform',
      null,
      test,
    ),
  );
});
