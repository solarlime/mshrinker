import { describe, test } from 'node:test';
import assert from 'node:assert';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { defineOutputName } from './defineOutputName';
import { AllowedExtensionsEnum } from '../allowedExtensions';

describe('defineOutputName', () => {
  test('no duplicates', async () => {
    const dir = './test-output';
    await mkdir(dir, { recursive: true });
    const result = await defineOutputName(
      dir,
      'file',
      AllowedExtensionsEnum.MOV,
    );
    assert.strictEqual(result, 'file.mov');
    await rm(dir, { recursive: true });
  });

  test('with duplicates', async () => {
    const dir = './test-output';
    await mkdir(dir, { recursive: true });
    await writeFile(`${dir}/file.mov`, '');
    await writeFile(`${dir}/file_1.mov`, '');
    const result = await defineOutputName(
      dir,
      'file',
      AllowedExtensionsEnum.MOV,
    );
    assert.strictEqual(result, 'file_2.mov');
    await rm(dir, { recursive: true });
  });

  test('folder not accessible', async () => {
    await assert.rejects(
      async () => {
        await defineOutputName(
          '/non-existent-folder',
          'file',
          AllowedExtensionsEnum.MOV,
        );
      },
      (err: Error) =>
        err.message.includes(
          'Ошибка: не удалось прочитать папку с итоговыми файлами',
        ),
    );
  });
});
