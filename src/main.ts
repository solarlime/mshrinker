#!/usr/bin/env node

import { readdir } from 'node:fs';
import isToolAvailable from './isToolAvailable';
import copyMetadata from './copyMetadata';
import encodeFile from './encodeFile';

Promise.all([
  isToolAvailable('exiftool', '-ver'),
  isToolAvailable('ffmpeg', '-version'),
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
        console.log(`ℹ️ Найдено файлов: ${files.length}`);
        for (const file of files) {
          console.log(`ℹ️ Создаю сжатую копию ${input}/${file} в ${output}`);
          await encodeFile(
            `${process.cwd()}/${input}/${file}`,
            `${process.cwd()}/${output}/${file}`,
          )
            .then(() => console.log(`✅  Создан файл ${output}/${file}`))
            .catch(console.error);
          console.log(
            `\nℹ️ Копирую метаданные файла ${input}/${file} в ${output}/${file}`,
          );
          await copyMetadata(
            `${process.cwd()}/${input}/${file}`,
            `${process.cwd()}/${output}/${file}`,
          )
            .then(() =>
              console.log(
                `✅  Метаданные файла ${input}/${file} скопированы в ${output}/${file}`,
              ),
            )
            .catch(console.error);
          console.log(
            `\nℹ️ Обработано файлов: ${files.indexOf(file) + 1} из ${files.length}`,
          );
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
