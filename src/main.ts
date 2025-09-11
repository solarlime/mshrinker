#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import isToolAvailable from './isToolAvailable';
import copyMetadata from './copyMetadata/copyMetadata';
import encodeFile from './encodeFile';
import parseFileName from './parseFileName/parseFileName';
import allowedExtensions from './parseFileName/allowedExtensions';
import checkOutputFile from './checkOutputFile/checkOutputFile';
import getParameters from './getParameters/getParameters';
import defineFolders from './defineFolders/defineFolders';
import runRAMMode from './runRAMMode';
import {
  errorMessage,
  infoMessage,
  warningMessage,
  successMessage,
} from './highlighting';

console.log('\n');
const args = process.argv.slice(2);
if (args[0] === '--help' || args[0] === '-h' || args[0] === undefined) {
  console.log(`
MShrinker — утилита для сжатия видеофайлов с копированием метаданных.
Версия: 0.1.1.

—————

Для работы необходимы:
- ExifTool (для копирования метаданных, https://exiftool.org/)
- FFmpeg 4.0+ (для сжатия видео c поддержкой hevc_videotoolbox, https://ffmpeg.org/)
- FFprobe (для получения параметров видео, обычно входит в состав FFmpeg)

Программа проверит наличие этих инструментов в системе.

Поддерживается работа с видеофайлами в форматах: mp4, mov, m4v. На данный момент поддерживается корректная работа только в операционной системе macOS 10.13+ на устройствах Mac с поддержкой аппаратного кодирования HEVC (с процессором Intel и чипом T2 или с процессором Apple Silicon).

—————

Использование:
mshrinker [папка с исходными файлами] [папка для сохранения сжатых файлов]
  `);
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
            errorMessage(
              'Ошибка: не удалось прочитать папку с исходными файлами',
            ),
          );
        } else {
          if (files.length === 0) {
            console.warn(warningMessage('Нет файлов для обработки'));
            return;
          } else {
            console.log(infoMessage(`Найдено файлов: ${files.length}`));
            for (const inputFile of files) {
              console.log('\n');
              const { name, extension } = parseFileName(inputFile);

              if (inputFile.startsWith('.')) {
                console.warn(
                  warningMessage(`Пропускаю скрытый файл ${inputFile}`),
                );
                continue;
              }

              if (!extension || !allowedExtensions.includes(extension)) {
                console.warn(
                  warningMessage(
                    `Пропускаю файл ${inputFile} с недопустимым расширением`,
                  ),
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

              if (
                osType === 'darwin' &&
                Math.floor(totalMemory / 4) > size &&
                // Если меньше, то есть риск, что HFS+ не создастся
                size >= 614400
              ) {
                console.log(
                  successMessage(
                    `Файл ${inputFile} возможно обработать без промежуточной записи на SSD!`,
                  ),
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
                  infoMessage(
                    `Создаю сжатую копию ${inputFile} в ${outputFolder}`,
                  ),
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
                  console.log(
                    infoMessage(`Копирую метаданные файла ${inputFile}`),
                  );
                  await copyMetadata(
                    `${inputFolder}/${inputFile}`,
                    `${outputFolder}/${outputFile}`,
                  )
                    .then(() =>
                      console.log(
                        successMessage(
                          `Метаданные скопированы в ${outputFile}`,
                        ),
                      ),
                    )
                    .catch(console.error);
                } else {
                  console.log(
                    infoMessage(
                      `Пропускаю этап копирования метаданных: файл ${inputFile} не был изменён`,
                    ),
                  );
                }

                console.log(
                  infoMessage(
                    `Обработано файлов: ${files.indexOf(inputFile) + 1} из ${files.length}`,
                  ),
                );
              }
            }
          }
          console.log(
            successMessage(
              `\n\nПроцесс завершён. Обработано файлов: ${files.length}`,
            ),
          );
        }
      });
    })
    .catch(console.error);
}
