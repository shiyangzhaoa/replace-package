import core from 'jscodeshift';

import { j } from './jscodeshift';
import { replaceLegacy } from './replace-legacy';
import { getConfig } from './config';

const rulers = getConfig('replace-package');

const transform = (fileInfo: core.FileInfo) => {
  const ast = j(fileInfo.source);

  rulers.forEach((ruler) => {
    replaceLegacy(ast, fileInfo.path, ruler);
  });

  return ast.toSource({ quote: 'single' });
};

export default transform;
