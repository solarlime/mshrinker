import { describe, test } from 'node:test';
import assert from 'node:assert';
import { allowedExtensions } from '../allowedExtensions';
import parseFileName from './parseFileName';

const testCases = [
  ...allowedExtensions.map((extension) => ({
    case: `file.${extension}`,
    expectedName: 'file',
    expectedExtension: extension,
  })),
  ...allowedExtensions.map((extension) => ({
    case: `file.${extension.toLowerCase()}`,
    expectedName: 'file',
    expectedExtension: extension,
  })),
  ...allowedExtensions.map((extension) => ({
    case: `file.${extension.toUpperCase()}`,
    expectedName: 'file',
    expectedExtension: extension,
  })),
  {
    case: `.${allowedExtensions[0]}`,
    expectedName: null,
    expectedExtension: allowedExtensions[0],
  },
  {
    case: `..${allowedExtensions[0]}`,
    expectedName: '.',
    expectedExtension: allowedExtensions[0],
  },
  {
    case: `file.something.${allowedExtensions[0]}`,
    expectedName: 'file.something',
    expectedExtension: allowedExtensions[0],
  },
  {
    case: `file something.${allowedExtensions[0]}`,
    expectedName: 'file something',
    expectedExtension: allowedExtensions[0],
  },
  {
    case: 'file.htm',
    expectedName: 'file',
    expectedExtension: 'htm',
  },
  {
    case: 'file.html',
    expectedName: 'file',
    expectedExtension: 'html',
  },
  {
    case: '.htm',
    expectedName: null,
    expectedExtension: 'htm',
  },
  {
    case: 'file',
    expectedName: 'file',
    expectedExtension: null,
  },
  {
    case: 'file.',
    expectedName: 'file',
    expectedExtension: null,
  },
];

describe('parseFileName', () => {
  testCases.forEach((file) => {
    test(`${file.case}`, () => {
      const { name, extension } = parseFileName(file.case);
      assert.strictEqual(name, file.expectedName);
      assert.strictEqual(extension, file.expectedExtension);
    });
  });
});
