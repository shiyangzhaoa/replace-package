import core from 'jscodeshift';

import { j } from '../jscodeshift';
import { error } from './logger';

export const renameAll = (
  ast: core.Collection<unknown>,
  oldName: string,
  newName: string,
) => {
  if (oldName === newName) {
    return;
  }

  const exportSpecifiers = ast
    .find(j.ExportDeclaration)
    .find(j.ExportSpecifier)
    .find(j.Identifier, { name: oldName });

  const exportDefaultSpecifiers = ast
    .find(j.ExportDeclaration)
    .find(j.ExportDefaultSpecifier)
    .find(j.Identifier, { name: oldName });

  const identifiers = ast
    .find(j.MemberExpression, (node) => j.Identifier.check(node.object))
    .find(j.Identifier, { name: oldName });

  const typeRef = ast
    .find(j.TSTypeReference)
    .find(j.Identifier, { name: oldName });

  [
    ...exportSpecifiers.paths(),
    ...exportDefaultSpecifiers.paths(),
    ...identifiers.paths(),
    ...typeRef.paths(),
  ].forEach((path: core.ASTPath) => {
    j(path).replaceWith(() => j.identifier(newName));
  });

  // CallExpression
  const callExpressions = ast.find(j.CallExpression, {
    callee: { type: 'Identifier', name: oldName },
  });
  callExpressions.forEach((path) => {
    if (j.Identifier.check(path.node.callee)) {
      path.node.callee.name = newName;
    }
  });

  // JSX
  const JSXOpeningElements = ast.find(j.JSXOpeningElement, {
    name: { name: oldName },
  });
  const JSXClosingElements = ast.find(j.JSXClosingElement, {
    name: { name: oldName },
  });

  [...JSXOpeningElements.paths(), ...JSXClosingElements.paths()].forEach(
    (path: core.ASTPath<core.JSXOpeningElement | core.JSXClosingElement>) => {
      if (j.JSXIdentifier.check(path.node.name)) {
        path.node.name.name = newName;
      }
    },
  );
};

export const createImportDeclWithDefault = (
  packName: string,
  name: string,
): core.ImportDeclaration => {
  const importDefaultSpecifier = j.importDefaultSpecifier(j.identifier(name));

  return j.importDeclaration(
    [importDefaultSpecifier],
    j.stringLiteral(packName),
  );
};

export const createImportNamespaceSpecifier = (
  packName: string,
  name: string,
): core.ImportDeclaration => {
  const importNamespaceSpecifier = j.importNamespaceSpecifier(j.identifier(name));

  return j.importDeclaration(
    [importNamespaceSpecifier],
    j.stringLiteral(packName),
  );
};

export const createImportDeclWithProp = (
  packName: string,
  name: string,
  local: string,
): core.ImportDeclaration => {
  return j.importDeclaration(
    [
      j.importSpecifier(
        j.identifier(name),
        // why???
        j.identifier(`${local} `)
      )
    ],
    j.literal(packName)
  );
};

export const getImportNameWithOnlyOne = (
  nodes: (core.ImportDefaultSpecifier | core.ImportNamespaceSpecifier)[],
) => {
  if (nodes.length === 0) {
    throw Error('Can not find any import specifier');
  }

  const specName = nodes[0].local?.name as string;

  if (nodes.length > 1) {
    error(`A multiple of ${specName} import default, use first`);
  }

  return specName;
};
