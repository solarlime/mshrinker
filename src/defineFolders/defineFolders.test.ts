import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import defineFolders from './defineFolders';

const testCases = [
  { name: 'all folders exist', args: ['inputFolder', 'outputFolder'] },
  {
    name: 'all folders exist + rest args',
    args: ['inputFolder', 'outputFolder', 'anotherArg'],
  },
  { name: 'not all args', args: ['inputFolder'] },
  { name: 'folder 1 does not exist', args: ['inputFolder', 'outputFolder'] },
  { name: 'folder 2 does not exist', args: ['inputFolder', 'outputFolder'] },
];

describe('defineFolders', () => {
  testCases.forEach((testCase) => {
    test(testCase.name, (test) => {
      const existsSyncMock = test.mock.method(fs, 'existsSync', () => true);
      const resolveMock = test.mock.method(path, 'resolve', () => {
        throw new TypeError('[ERR_INVALID_ARG_TYPE]');
      });

      switch (testCase.name) {
        case 'all folders exist':
        case 'all folders exist + rest args': {
          resolveMock.mock.mockImplementationOnce(
            () => `/${testCase.args[0]}`,
            0,
          );
          resolveMock.mock.mockImplementationOnce(
            () => `/${testCase.args[1]}`,
            1,
          );
          existsSyncMock.mock.mockImplementation(() => true);

          const result = defineFolders(testCase.args);

          assert.strictEqual(result.inputFolder, `/${testCase.args[0]}`);
          assert.strictEqual(result.outputFolder, `/${testCase.args[1]}`);
          break;
        }
        case 'not all args': {
          assert.throws(
            () => defineFolders(testCase.args),
            (error) =>
              (error as Error).message.includes(
                'Ошибка: не удалось определить абсолютные пути к папкам. Проверьте корректность ввода',
              ),
          );
          break;
        }
        case 'folder 1 does not exist': {
          resolveMock.mock.mockImplementationOnce(
            () => `/${testCase.args[0]}`,
            0,
          );
          resolveMock.mock.mockImplementationOnce(
            () => `/${testCase.args[1]}`,
            1,
          );
          existsSyncMock.mock.mockImplementation(() => false);

          assert.throws(
            () => defineFolders(testCase.args),
            (error) =>
              (error as Error).message.includes(
                `Ошибка: папка с исходными файлами (/${testCase.args[0]}) не существует`,
              ),
          );
          break;
        }
        case 'folder 2 does not exist': {
          resolveMock.mock.mockImplementationOnce(
            () => `/${testCase.args[0]}`,
            0,
          );
          resolveMock.mock.mockImplementationOnce(
            () => `/${testCase.args[1]}`,
            1,
          );
          existsSyncMock.mock.mockImplementationOnce(() => false, 1);

          assert.throws(
            () => defineFolders(testCase.args),
            (error) =>
              (error as Error).message.includes(
                `Ошибка: папка для сжатых файлов (/${testCase.args[1]}) не существует`,
              ),
          );
          break;
        }
      }
    });
  });
});
