import typescript from '@rollup/plugin-typescript';

const target = 'node';

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: `src/${target}/index.ts`,
  output: [
    {
      sourcemap: true,
      file: `dist/${target}/index.js`,
      format: 'es',
    },
  ],
  external: [
    '@lwc/engine-dom',
    '@lwc/engine-server',
    'resolve',
    '@web/test-runner-commands',
    'node:path',
    'node:querystring',
    '@lwc/module-resolver',
    '@web/dev-server-core',
    'node:fs',
    'node:url',
    '@web/dev-server-hmr',
    'async-mutex',
    'sucrase',
    '@lwc/compiler',
    'es-module-lexer',
  ],
  plugins: [
    typescript({
      tsconfig: `./tsconfig.${target}.json`,
    }),
  ],
};
