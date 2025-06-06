import { stat, copyFile } from 'node:fs/promises';
import {
  errorMessage,
  successMessage,
  warningMessage,
  infoMessage,
} from './highlighting';

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
            infoMessage(
              `Новый файл меньше исходного (${outputSize} байт против ${inputSize}). Использую новый файл`,
            ),
          );
          resolve({ isOutputFileNew: true });
        } else {
          console.warn(
            warningMessage(
              `Новый файл больше исходного (${inputSize} байт против ${outputSize}). Использую исходный файл`,
            ),
          );
          try {
            await copyFile(source, target);
            console.log(
              successMessage(`Создан файл ${target} — копия ${source}`),
            );
            resolve({ isOutputFileNew: false });
          } catch (copyErr) {
            console.error(
              errorMessage(
                `Ошибка копирования файла: ${(copyErr as Error).message}`,
              ),
            );
            reject(copyErr);
          }
        }
      })
      .catch(() =>
        reject(new Error(errorMessage('Ошибка получения размеров файлов'))),
      );
  });
}
