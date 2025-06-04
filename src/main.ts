#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import isToolAvailable from './isToolAvailable';
import copyMetadata from './copyMetadata';
import encodeFile from './encodeFile';
import parseFileName from './parseFileName/parseFileName';
import allowedExtensions from './parseFileName/allowedExtensions';
import checkOutputFile from './checkOutputFile';
import getParameters from './getParameters';
import defineFolders from './defineFolders';
import runRAMMode from './runRAMMode';

const args = process.argv.slice(2);
if (args[0] === '--help' || args[0] === '-h' || args[0] === undefined) {
  console.log('Здесь будет справка по использованию скрипта');
} else {
  Promise.all([
    isToolAvailable('exiftool', '-ver'),
    isToolAvailable('ffmpeg', '-version'),
    isToolAvailable('ffprobe', '-version'),
  ])
    .then(() => {
      const { inputFolder, outputFolder } = defineFolders(args);

      fs.readdir(inputFolder, async (error, files) => {
        if (error) {
          throw new Error(
            '❌  Ошибка: не удалось прочитать папку с исходными файлами',
          );
        } else {
          if (files.length === 0) {
            console.warn('⚠️ Нет файлов для обработки');
            return;
          } else {
            console.log(`ℹ️ Найдено файлов: ${files.length}`);
            for (const inputFile of files) {
              const { name, extension } = parseFileName(inputFile);

              if (inputFile.startsWith('.')) {
                console.warn(`⚠️ Пропускаю скрытый файл ${inputFile}`);
                continue;
              }

              if (!extension || !allowedExtensions.includes(extension)) {
                console.warn(
                  `⚠️ Пропускаю файл ${inputFile} с недопустимым расширением`,
                );
                continue;
              }

              // Exiftool не может записывать метаданные в контейнер m4v. Используем mov
              const outputExtension =
                extension.toLowerCase() === 'm4v' ? 'mov' : extension;
              const outputFile = `${name}.${outputExtension}`;
              const { width, height, size } = await getParameters(
                `${inputFolder}/${inputFile}`,
              );

              const osType = os.platform();
              const totalMemory = os.totalmem();

              if (osType === 'darwin' && Math.floor(totalMemory / 4) > size) {
                console.log(
                  `🔥 Файл ${inputFile} возможно обработать без промежуточной записи на SSD!`,
                );
                await runRAMMode(
                  inputFolder,
                  inputFile,
                  outputFolder,
                  outputFile,
                  size,
                  width,
                  height,
                );
              } else {
                console.log(
                  `ℹ️ Создаю сжатую копию ${inputFile} в ${outputFolder}`,
                );
                await encodeFile(
                  `${inputFolder}/${inputFile}`,
                  `${outputFolder}/${outputFile}`,
                  width,
                  height,
                ).catch(console.error);

                const { isOutputFileNew } = await checkOutputFile(
                  `${inputFolder}/${inputFile}`,
                  `${outputFolder}/${outputFile}`,
                );
                if (isOutputFileNew) {
                  console.log(`ℹ️ Копирую метаданные файла ${inputFile}`);
                  await copyMetadata(
                    `${inputFolder}/${inputFile}`,
                    `${outputFolder}/${outputFile}`,
                  )
                    .then(() =>
                      console.log(`✅  Метаданные скопированы в ${outputFile}`),
                    )
                    .catch(console.error);
                } else {
                  console.log(
                    `ℹ️ Пропускаю этап копирования метаданных: файл ${inputFile} не был изменён`,
                  );
                }

                console.log(
                  `ℹ️ Обработано файлов: ${files.indexOf(inputFile) + 1} из ${files.length}`,
                );
              }
            }
          }
          console.log(
            `\n\n✅  Процесс завершён. Обработано файлов: ${files.length}`,
          );
        }
      });
    })
    .catch(console.error);
}
