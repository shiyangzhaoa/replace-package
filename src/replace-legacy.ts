import fs from 'fs';
import path from 'path';
import core from 'jscodeshift';
import { isMatch } from 'matcher';

import { j } from './jscodeshift';
import { error } from './utils/logger';
import { isAllValid } from './utils/validate';
import {
  createImportDeclWithDefault,
  createImportDeclWithProp,
  createImportNamespaceSpecifier,
  getImportNameWithOnlyOne,
  renameAll,
} from './utils/transform';
import { clearInvalidSuffix } from './utils';
import { getCompletionEntries } from './utils/file';

import type { Config } from './config';

type ReplaceConfig = Config['replace-package'][0];

export const replaceLegacy = (
  ast: core.Collection<unknown>,
  filePath: string,
  config: ReplaceConfig,
) => {
  const {
    legacySource,
    name,
    source,
    importDefault,
  } = config;

  if (!checkConfigIsValid(config)) return;

  const dir = path.dirname(filePath);
  const getValidPath = getCompletionEntries(dir);

  const findImportDeclarations = (source: string) => {
    return ast.find(j.ImportDeclaration, (node) => {
      if (!j.Literal.check(node.source)) {
        return false;
      }

      try {
        fs.accessSync(source);
        const absolutePath = getValidPath(String(node.source.value));

        return absolutePath === clearInvalidSuffix(source);
      } catch {
        return isMatch(String(node.source.value), source);
      }
    });
  };

  const legacyImportDeclarations = findImportDeclarations(legacySource);
  
  if (legacyImportDeclarations.size() === 0) return;

  const newImportDeclarations = findImportDeclarations(source);

  const perform = () => {
    const isLegacyNamespaceSpecifier = legacyImportDeclarations.find(
      j.ImportNamespaceSpecifier,
    ).size() !== 0;
    const realLegacyName = resolveLegacyPackage(
      legacyImportDeclarations,
      config,
    );

    if (!realLegacyName) return;

    if (newImportDeclarations.size() !== 0) {
      if (importDefault === true) {
        // import React from 'react';
        const ImportDefaultSpecifiers = newImportDeclarations.find(
          j.ImportDefaultSpecifier,
        );
        // import * as React from 'react';
        const importNamespaceSpecifiers = newImportDeclarations.find(
          j.ImportNamespaceSpecifier,
        )

        const result = [...ImportDefaultSpecifiers.nodes(), ...importNamespaceSpecifiers.nodes()];

        if (result.length === 0) {
          const newImportDeclarationSpecifier = j.importDefaultSpecifier(
            j.identifier(name),
          );
          newImportDeclarations
            .nodes()[0]
            .specifiers?.unshift(newImportDeclarationSpecifier);
          renameAll(ast, realLegacyName, name);
        } else {
          const importDefaultDeclarationName = getImportNameWithOnlyOne(
            result
          );
          renameAll(ast, realLegacyName, importDefaultDeclarationName);
        }
      } else {
        const newNameImportSpecifier = newImportDeclarations.find(
          j.ImportSpecifier,
          { imported: { name: name } },
        );

        if (newNameImportSpecifier.size() === 0) {
          newImportDeclarations
            .nodes()[0]
            .specifiers?.push(j.importSpecifier(j.identifier(name), j.identifier(realLegacyName)));
        } else {
          const nameImportSpecifier = newNameImportSpecifier.at(0).nodes()[0];

          const { imported, local } = nameImportSpecifier;

          if (local && local.name !== imported.name) {
            renameAll(ast, realLegacyName, local.name);
          } else {
            renameAll(ast, realLegacyName, name);
          }
        }
      }

      return;
    }

    let realNewSource = '';

    try {
      fs.accessSync(source);
      realNewSource = clearInvalidSuffix(path.relative(dir, source));
    } catch {
      realNewSource = source;
    }

    if (importDefault === true) {
      const importDefaultDeclaration = isLegacyNamespaceSpecifier
        ? createImportNamespaceSpecifier(realNewSource, name)
        : createImportDeclWithDefault(realNewSource, name);

      // insert before first
      legacyImportDeclarations.at(-1)?.insertBefore(importDefaultDeclaration);
      renameAll(ast, realLegacyName, name);
    } else {
      const importDeclaration = createImportDeclWithProp(
        realNewSource,
        name,
        realLegacyName
      );

      legacyImportDeclarations.at(-1)?.insertBefore(importDeclaration);
    }
  };

  perform();

  return ast.toSource({ quote: 'single' });
};

const resolveLegacyPackage = (
  legacyImportDeclarations: core.Collection<core.ImportDeclaration>,
  config: ReplaceConfig,
) => {
  const { legacyImportDefault, legacyName } = config;

  let realLegacyName = '';
  // import React from 'react';
  const importDefaultSpecifiers = legacyImportDeclarations.find(
    j.ImportDefaultSpecifier,
  );
  // import * as React from 'react';
  const importNamespaceSpecifiers = legacyImportDeclarations.find(
    j.ImportNamespaceSpecifier,
  )

  const result = [...importDefaultSpecifiers.nodes(), ...importNamespaceSpecifiers.nodes()];

  const importSpecifiers = legacyImportDeclarations.find(j.ImportSpecifier);

  if (legacyImportDefault === true) {
    if (result.length === 0) return;

    realLegacyName = getImportNameWithOnlyOne(result);

    if (importSpecifiers.size() === 0) {
      legacyImportDeclarations.remove();
    } else {
      importDefaultSpecifiers.remove();
    }
  } else {
    let legacyImportSpecifierNode: core.ImportSpecifier | undefined;

    legacyImportDeclarations.forEach((path) => {
      const importSpecifiers = j(path).find(
        j.ImportSpecifier,
      );
      const legacyImportSpecifiers = j(path).find(
        j.ImportSpecifier,
        { imported: { type: 'Identifier', name: legacyName } },
      );
  
      if (legacyImportSpecifiers.size() === 0) return;

      const legacyNode = legacyImportSpecifiers.nodes()?.[0];

      if (legacyNode) {
        legacyImportSpecifierNode = legacyNode;
      }
  
      if (importSpecifiers.size() === 1) {
        j(path).remove();
      } else {
        legacyImportSpecifiers.remove();
      }
    });

    if (!legacyImportSpecifierNode) {
      return;
    }

    const { imported, local } = legacyImportSpecifierNode;

    if (local?.name && imported.name !== local.name) {
      realLegacyName = local.name;
    } else {
      realLegacyName = legacyName;
    }
  }

  return realLegacyName;
};

const checkConfigIsValid = (config: ReplaceConfig) => {
  const { source, name, legacyImportDefault, legacyName, legacySource } = config;

  let isValid = false;
  let errMsg = '';

  if (legacyImportDefault === true) {
    isValid = isAllValid(Object.values([legacySource, name, source]));

    errMsg = '[legacySource;name;source]';
  } else {
    isValid = isAllValid([legacyName, legacySource, name, source]);

    errMsg = '[legacyName;legacySource;name;source]';
  }

  if (isValid) return true;

  error(`Please check {${errMsg}} in your codemod.json`);

  process.exit(0);

  return false;
};
