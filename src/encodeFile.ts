import { spawn } from 'node:child_process';

export default async function encodeFile(source: string, target: string) {
  return new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-hide_banner',
      '-loglevel',
      'error',
      '-stats',
      '-y',
      '-i',
      source,
      '-c:v',
      'libx265',
      '-tag:v',
      'hvc1',
      '-preset',
      'medium',
      '-crf',
      '23',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      target,
    ]);

    ffmpeg.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    ffmpeg.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    ffmpeg.on('close', (code: number) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}
