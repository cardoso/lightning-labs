import typescript from '@rollup/plugin-typescript';

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: {
    'browser/index': 'src/browser/index.ts',

    'browser/shared': 'src/browser/shared.ts',
    'browser/helpers': 'src/browser/helpers.ts',
    'browser/ssr/index': 'src/browser/ssr/index.ts',
    'browser/ssr/worker': 'src/browser/ssr/worker.ts',
    'browser/utils/image': 'src/browser/utils/image.ts',
    'browser/utils/pixelmatch': 'src/browser/utils/pixelmatch.ts',
    'browser/utils/capture-element': 'src/browser/utils/capture-element.ts',
  },
  output: [
    {
      sourcemap: true,
      dir: 'dist',
      format: 'es',
    },
  ],
  external: ['@lwc/engine-dom', '@web/test-runner-commands'],
  plugins: [
    typescript({
      tsconfig: `./tsconfig.browser.json`,
    }),
  ],
};
