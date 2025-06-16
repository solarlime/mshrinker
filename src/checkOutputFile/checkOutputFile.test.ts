import fs from 'node:fs/promises';
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Stats } from 'node:fs';
import checkOutputFile from './checkOutputFile';

const testCases = [
  {
    name: 'source is bigger than target',
    input: 700000,
    output: 600000,
    statError: false,
    copyError: false,
  },
  {
    name: 'source is smaller than target',
    input: 600000,
    output: 700000,
    statError: false,
    copyError: false,
  },
  {
    name: 'stat error',
    input: 0,
    output: 0,
    statError: true,
    copyError: false,
  },
  {
    name: 'copy error',
    input: 0,
    output: 10,
    statError: false,
    copyError: true,
  },
];

// mock.method(fs, 'copyFile', () => Promise.resolve());

describe('checkOutputFile', () => {
  testCases.forEach((testCase) => {
    test(testCase.name, async (test) => {
      const copyMock = test.mock.method(fs, 'copyFile', () =>
        Promise.resolve(),
      );
      const statMock = test.mock.method(
        fs,
        'stat',
        () => ({ size: 0 }) as Stats,
      );

      if (testCase.copyError) {
        const copyErrorMessage = `Test copy error`;

        statMock.mock.mockImplementationOnce(
          // @ts-ignore
          async () => ({ size: testCase.output }) as Stats,
          1,
        );
        copyMock.mock.mockImplementationOnce(
          () => Promise.reject(new Error(copyErrorMessage)),
          0,
        );

        await assert.rejects(
          () => checkOutputFile(`source`, `target`),
          (error) => {
            assert.strictEqual((error as Error).message, copyErrorMessage);
            return true;
          },
        );
      } else if (testCase.statError) {
        statMock.mock.mockImplementationOnce(
          // @ts-ignore
          () => Promise.reject(new Error()),
          1,
        );

        await assert.rejects(
          () => checkOutputFile(`source`, `target`),
          (error) => {
            assert.match(
              (error as Error).message,
              /Ошибка получения размеров файлов/,
            );
            return true;
          },
        );
      } else {
        const statMock = test.mock.method(
          fs,
          'stat',
          () => ({ size: 0 }) as Stats,
        );
        statMock.mock.mockImplementationOnce(
          // @ts-ignore
          async () => ({ size: testCase.input }) as Stats,
          0,
        );
        statMock.mock.mockImplementationOnce(
          // @ts-ignore
          async () => ({ size: testCase.output }) as Stats,
          1,
        );

        const { isOutputFileNew } = await checkOutputFile(`source`, `target`);
        assert.strictEqual(isOutputFileNew, testCase.input > testCase.output);
      }
    });
  });
});
