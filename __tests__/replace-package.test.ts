import path from 'path';

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const tests = ['not-match-default', 'not-match-props', 'name-import', 'base-import'];

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
