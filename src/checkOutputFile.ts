import { stat, copyFile } from 'node:fs/promises';

export default function checkOutputFile(
  source: string,
  target: string,
): Promise<{ isOutputFileNew: boolean }> {
  return new Promise((resolve, reject) => {
    Promise.all([stat(source), stat(target)])
      .then(async (statsArray) => {
        const [inputStats, outputStats] = statsArray;
        const inputSize = inputStats.size;
        const outputSize = outputStats.size;
        if (inputSize > outputSize) {
          console.log(
            `ℹ️ Новый файл меньше исходного (${outputSize} байт против ${inputSize}). Использую новый файл`,
          );
          resolve({ isOutputFileNew: true });
        } else {
          console.warn(
            `⚠️ Новый файл больше исходного (${inputSize} байт против ${outputSize}). Использую исходный файл`,
          );
          try {
            await copyFile(source, target);
            console.log(`✅  Создан файл ${target} — копия ${source}`);
            resolve({ isOutputFileNew: false });
          } catch (copyErr) {
            console.error(
              `❌  Ошибка копирования файла: ${(copyErr as Error).message}`,
            );
            reject(copyErr);
          }
        }
      })
      .catch(() => reject(new Error('❌  Ошибка получения размеров файлов')));
  });
}
