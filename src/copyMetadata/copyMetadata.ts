import child_process from 'node:child_process';
import { errorMessage } from '../highlighting';

export default async function copyMetadata(source: string, target: string) {
  return new Promise<void>((resolve, reject) => {
    const exiftool = child_process.spawn('exiftool', [
      '-TagsFromFile',
      source,
      '-all:all',
      '-overwrite_original',
      '-extractEmbedded',
      target,
    ]);

    exiftool.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    exiftool.on('close', (code: number) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            errorMessage(`Exiftool аварийно завершил работу. Код: ${code}`),
          ),
        );
      }
    });
  });
}
