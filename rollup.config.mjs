import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

const dev = !!process.env.ROLLUP_WATCH;

export default {
  input: 'src/smooth-thermostat-card.ts',
  output: {
    file: 'dist/smooth-thermostat-card.js',
    format: 'es',
    sourcemap: dev,
    inlineDynamicImports: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    json(),
    !dev && terser({ format: { comments: false } }),
  ].filter(Boolean),
};
