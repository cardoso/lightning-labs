import * as path from 'node:path';
import { stringify as qsStringify } from 'node:querystring';

import { resolveModule } from '@lwc/module-resolver';

import { getRequestFilePath } from '@web/dev-server-core';

export const resolvedModules = new Map();
const MODULE_IMPORT_PATTERN = /^(\w+)\/(\w+)$/;

export function resolveToAbsPath(importSpecifier: string, importerAbsPath: string, cwd?: string, moduleDirs?: string[]) {
  let result;
  try {
    result = resolveModule(importSpecifier, importerAbsPath, {
      modules: moduleDirs?.map((dir) => ({ dir })),
      rootDir: cwd,
    });
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'code' in err) {
      if (err.code === 'NO_LWC_MODULE_FOUND') {
        console.error(`The requested moduled cannot be found: '${importSpecifier}'`);
      } else if (err.code === 'LWC_CONFIG_ERROR') {
        console.error(`The requested module can't be resolved due to an invalid configuration`, err);
      }
    }
    throw err;
  }
  return result;
}

export function resolveToAbsUrl(
  importSpecifier: string,
  importerAbsPath: string,
  rootDir: string,
  cwd?: string,
  moduleDirs?: string[],
  queryParams?: Record<string, string>,
) {
  if (!MODULE_IMPORT_PATTERN.test(importSpecifier)) {
    return;
  }
  const componentAbsPath = resolveToAbsPath(importSpecifier, importerAbsPath, cwd, moduleDirs);
  if (!componentAbsPath) {
    return;
  }
  const queryString =
    queryParams && Object.keys(queryParams).length ? `?${qsStringify(queryParams)}` : '';

  const resolvedImport = `/${path.relative(rootDir, componentAbsPath.entry)}${queryString}`;

  resolvedModules.set(componentAbsPath.entry, {
    resolvedImport,
    importSpecifier,
  });

  return resolvedImport;
}

export default ({ cwd, rootDir, moduleDirs }:{cwd:string, rootDir: string, moduleDirs: string[]}) => ({
  name: 'lwc-resolve-module',
  resolveImport({ source, context, code, column, line }: any) {
    const filePath = getRequestFilePath(context.url, rootDir);
    return resolveToAbsUrl(source, filePath, rootDir, cwd, moduleDirs, context.query);
  },
});
