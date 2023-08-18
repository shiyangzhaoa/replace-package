import core from 'jscodeshift';

import { j } from './jscodeshift';
import { replaceLegacy } from './replace-legacy';

const transform = (fileInfo: core.FileInfo) => {
  const ast = j(fileInfo.source);

  replaceLegacy(ast, fileInfo.path);

  return ast.toSource({ quote: 'single' });
};

export default transform;
