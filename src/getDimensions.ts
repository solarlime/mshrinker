import { spawn } from 'node:child_process';

export default async function getDimensions(source: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height',
      '-of',
      'json',
      source,
    ]);

    const buffer: string[] = [];

    ffprobe.stdout.on('data', (data) => {
      buffer.push(data);
    });

    ffprobe.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    ffprobe.on('close', (code: number) => {
      if (code === 0) {
        const stringData = buffer.join('');
        const { streams } = JSON.parse(stringData);
        resolve({ width: streams[0].width, height: streams[0].height });
      } else {
        reject(new Error(`FFprobe exited with code ${code}`));
      }
    });
  });
}
