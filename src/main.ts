#!/usr/bin/env node

import { readdir } from 'node:fs';
import isToolAvailable from './isToolAvailable';
import copyMetadata from './copyMetadata';
import encodeFile from './encodeFile';
import parseFileName from './parseFileName/parseFileName';
import allowedExtensions from './parseFileName/allowedExtensions';
import checkOutputFile from './checkOutputFile';

Promise.all([
  isToolAvailable('exiftool', '-ver'),
  isToolAvailable('ffmpeg', '-version'),
  isToolAvailable('ffprobe', '-version'),
])
  .then(() => {
    const args = process.argv.slice(2);
    const input = args[0];
    const output = args[1];
    console.log(`ℹ️ Папка с исходными файлами: ${input}`);
    console.log(`ℹ️ Папка со сжатыми файлами: ${output}`);

    readdir(`${process.cwd()}/${input}`, async (error, files) => {
      if (error) {
        throw error;
      } else {
        if (files.length === 0) {
          console.warn('⚠️ Нет файлов для обработки');
          return;
        } else {
          console.log(`ℹ️ Найдено файлов: ${files.length}`);
          for (const file of files) {
            const { name, extension } = parseFileName(file);
            if (file.startsWith('.')) {
              console.warn(`⚠️ Пропускаю скрытый файл ${file}`);
              continue;
            }
            if (!extension || !allowedExtensions.includes(extension)) {
              console.warn(
                `⚠️ Пропускаю файл ${file} с недопустимым расширением`,
              );
              continue;
            }
            console.log(`ℹ️ Создаю сжатую копию ${input}/${file} в ${output}`);
            const outputExtension =
              extension.toLowerCase() === 'm4v' ? 'mov' : extension;
            const outputFileName = `${name}.${outputExtension}`;
            await encodeFile(
              `${process.cwd()}/${input}/${file}`,
              `${process.cwd()}/${output}/${outputFileName}`,
            ).catch(console.error);
            const { isOutputFileNew } = await checkOutputFile(
              `${process.cwd()}/${input}/${file}`,
              `${process.cwd()}/${output}/${outputFileName}`,
            );
            if (isOutputFileNew) {
              console.log(
                `\nℹ️ Копирую метаданные файла ${input}/${file} в ${output}/${outputFileName}`,
              );
              await copyMetadata(
                `${process.cwd()}/${input}/${file}`,
                `${process.cwd()}/${output}/${outputFileName}`,
              )
                .then(() =>
                  console.log(
                    `✅  Метаданные файла ${input}/${file} скопированы в ${output}/${outputFileName}`,
                  ),
                )
                .catch(console.error);
            } else {
              console.log(
                `\nℹ️ Пропускаю этап копирования метаданных: файл ${output}/${outputFileName} — копия файла ${input}/${file}`,
              );
            }

            console.log(
              `\nℹ️ Обработано файлов: ${files.indexOf(file) + 1} из ${files.length}`,
            );
          }
        }
        console.log(
          `\n\n✅  Процесс завершён. Обработано файлов: ${files.length}`,
        );
      }
    });
  })
  .catch((error) => {
    console.error((error as Error).message);
  });
