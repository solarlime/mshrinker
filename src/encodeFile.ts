import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';

export default async function encodeFile(
  source: string,
  target: string,
  width: number,
  height: number,
) {
  return new Promise<{ success: boolean }>((resolve, reject) => {
    let ffmpeg: ChildProcessWithoutNullStreams;

    if ((width < 1280 && height < 720) || (width < 720 && height < 1280)) {
      console.log(
        `ℹ️ Низкое разрешение (${width}x${height}), используется кодек libx265`,
      );
      ffmpeg = spawn('ffmpeg', [
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
        '20',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        target,
      ]);
    } else {
      console.log(
        `ℹ️ Высокое разрешение (${width}x${height}), используется кодек hevc_videotoolbox`,
      );
      ffmpeg = spawn('ffmpeg', [
        '-hide_banner',
        '-loglevel',
        'error',
        '-stats',
        '-y',
        '-i',
        source,
        '-c:v',
        'hevc_videotoolbox',
        '-tag:v',
        'hvc1',
        '-preset',
        'medium',
        '-q:v',
        '55',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        target,
      ]);
    }

    let isResultBiggerThanSource = false;

    ffmpeg.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      if (data.includes('(No space left on device')) {
        isResultBiggerThanSource = true;
      }
    });

    ffmpeg.on('close', (code: number) => {
      if (code === 0) {
        console.log(`✅  Создан файл ${target}`);
        resolve({ success: true });
      } else if (isResultBiggerThanSource) {
        resolve({ success: false });
      } else {
        reject(new Error(`❌  FFmpeg аварийно завершил работу. Код: ${code}`));
      }
    });
  });
}
