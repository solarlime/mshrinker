import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['./src/main.js'],
  bundle: true,
  platform: 'node',
  target: ['node20'],
  minify: true,
  outfile: 'dist/main.js',
});
