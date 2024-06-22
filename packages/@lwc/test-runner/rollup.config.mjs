import typescript from '@rollup/plugin-typescript';

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: `src/browser/index.ts`,
  output: [
    {
      sourcemap: true,
      dir: 'dist/browser',
      format: 'es',
    },
  ],
  external: [
    '@open-wc/testing',
    'query-selector-shadow-dom',
    '@lwc/wds-core/browser',
    'web-vitals/onCLS.js',
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
    }),
  ],
};
