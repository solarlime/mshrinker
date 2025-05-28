import { spawn } from 'node:child_process';

export default async function copyMetadata(source: string, target: string) {
  return new Promise<void>((resolve, reject) => {
    const exiftool = spawn('exiftool', [
      '-TagsFromFile',
      source,
      '-all:all',
      '-overwrite_original',
      '-extractEmbedded',
      target,
    ]);

    exiftool.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    exiftool.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    exiftool.on('close', (code: number) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Exiftool exited with code ${code}`));
      }
    });
  });
}
