import { join } from 'node:path';
import { execSync } from 'node:child_process';
import encodeFile from './encodeFile';
import { copyFile } from 'node:fs/promises';
import copyMetadata from './copyMetadata/copyMetadata';
import {
  errorMessage,
  infoMessage,
  successMessage,
  warningMessage,
} from './highlighting';

export default async function runRAMMode(
  inputFolder: string,
  inputFile: string,
  outputFolder: string,
  outputFile: string,
  size: number,
  width: number,
  height: number,
) {
  let diskId = null;
  const ramDisk = outputFile;
  const mountPath = `/Volumes/${ramDisk}`;
  const tempPath = join(mountPath, outputFile);

  const source = join(inputFolder, inputFile);
  const target = join(outputFolder, outputFile);

  // hdutil получает размер в блоках, 1 блок = 512 байт
  const blocks = Math.ceil(size / 512);

  console.log(infoMessage('Создание RAM-диска...'));
  diskId = execSync(`hdiutil attach -nomount ram://${blocks}`)
    .toString()
    .trim();
  console.log(infoMessage(`Диск подключён: ${diskId}`));

  console.log(infoMessage('Форматирование в HFS+...'));
  execSync(`diskutil erasevolume HFS+ ${ramDisk} ${diskId}`);
  console.log(infoMessage(`Диск ${mountPath} готов к использованию!`));
  try {
    const { success } = await encodeFile(
      `${inputFolder}/${inputFile}`,
      tempPath,
      width,
      height,
    );
    if (success) {
      console.log(
        successMessage(`Файл ${inputFile} успешно сжат. Сохраняю на диск`),
      );
      await copyFile(tempPath, `${outputFolder}/${outputFile}`);
      console.log(
        successMessage(
          `Сжатый файл ${outputFile} успешно сохранён в ${outputFolder}`,
        ),
      );
      console.log(infoMessage(`Копирую метаданные файла ${inputFile}`));
      await copyMetadata(
        `${inputFolder}/${inputFile}`,
        `${outputFolder}/${outputFile}`,
      );
      console.log(successMessage(`Метаданные скопированы в ${outputFile}`));
    } else {
      console.log(
        warningMessage(`Новый файл больше исходного. Использую исходный файл`),
      );
      await copyFile(source, target);
      console.log(successMessage(`Создан файл ${target} — копия ${source}`));
    }
  } catch (e) {
    console.error(errorMessage(e));
  } finally {
    console.log(infoMessage('Размонтирование RAM-диска...'));
    try {
      execSync(`diskutil eject ${mountPath}`);
      console.log(infoMessage('RAM-диск отключён'));
    } catch (ejectErr) {
      console.warn(
        warningMessage(
          'Не удалось размонтировать RAM-диск:',
          (ejectErr as Error).message,
        ),
      );
    }
  }
}
