import { join } from 'node:path';
import { execSync } from 'node:child_process';
import encodeFile from './encodeFile';
import { copyFile } from 'node:fs/promises';
import copyMetadata from './copyMetadata';

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

  console.log('💽 Создание RAM-диска...');
  diskId = execSync(`hdiutil attach -nomount ram://${blocks}`)
    .toString()
    .trim();
  console.log(`📀 Диск подключён: ${diskId}`);

  console.log('📝 Форматирование в HFS+...');
  execSync(`diskutil erasevolume HFS+ ${ramDisk} ${diskId}`);
  console.log(`📀 Диск ${mountPath} готов к использованию!`);
  try {
    const { success } = await encodeFile(
      `${inputFolder}/${inputFile}`,
      tempPath,
      width,
      height,
    );
    if (success) {
      console.log(`✅  Файл ${inputFile} успешно сжат. Сохраняю на диск`);
      await copyFile(tempPath, `${outputFolder}/${outputFile}`);
      console.log(
        `✅  Сжатый файл ${outputFile} успешно сохранён в ${outputFolder}`,
      );
      console.log(`ℹ️ Копирую метаданные файла ${inputFile}`);
      await copyMetadata(
        `${inputFolder}/${inputFile}`,
        `${outputFolder}/${outputFile}`,
      );
      console.log(`✅  Метаданные скопированы в ${outputFile}`);
    } else {
      console.log(`⚠️ Новый файл больше исходного. Использую исходный файл`);
      await copyFile(source, target);
      console.log(`✅  Создан файл ${target} — копия ${source}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    console.log('🔌 Размонтирование RAM-диска...');
    try {
      execSync(`diskutil eject ${mountPath}`);
      console.log('🧹 RAM-диск отключён');
    } catch (ejectErr) {
      console.warn(
        '⚠️ Не удалось размонтировать RAM-диск:',
        (ejectErr as Error).message,
      );
    }
  }
}
