import { after, before, describe, mock, test } from 'node:test';
import assert from 'node:assert';
import child_process from 'node:child_process';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import getParameters from './getParameters';

let ffprobe: child_process.ChildProcessWithoutNullStreams;
function mockSpawn(): child_process.ChildProcessWithoutNullStreams {
  const proc =
    new EventEmitter() as child_process.ChildProcessWithoutNullStreams;
  proc.stdout = new EventEmitter() as Readable;
  proc.stderr = new EventEmitter() as Readable;
  ffprobe = proc;
  return proc;
}

type TestCase = {
  name: string;
  input: string;
  buffer: Array<string>;
};

const ffprobeOutput = (isBroken: boolean = false) => {
  const base = [
    '{',
    '"streams": [',
    '{',
    '"width": 1280,',
    '"height": 720',
    '}',
    '],',
    '"format": {',
    '"size": "43000000"',
    '}',
    '}',
  ];
  return isBroken ? base.slice(0, -1) : base;
};

const testCases: Array<TestCase> = [
  {
    name: 'normal work',
    input: 'source.mov',
    buffer: ffprobeOutput(),
  },
  {
    name: 'not full JSON',
    input: 'source.mov',
    buffer: ffprobeOutput(true),
  },
];

describe('getParameters', () => {
  before(() => {
    mock.method(child_process, 'spawn', mockSpawn);
  });

  after(() => {
    mock.restoreAll();
  });

  testCases.forEach((testCase) => {
    test(testCase.name, async () => {
      const promise = getParameters('source.mov');
      process.nextTick(() => {
        testCase.buffer.forEach((data) => {
          ffprobe.stdout.emit('data', data);
        });
        ffprobe.emit('close', 0);
      });

      switch (testCase.name) {
        case 'normal work': {
          const { width, height, size } = await promise;
          assert.strictEqual(+width, 1280);
          assert.strictEqual(+height, 720);
          assert.strictEqual(+size, 43000000);
          break;
        }
        case 'not full JSON': {
          await assert.rejects(promise, (error) => {
            assert.match((error as Error).message, /Error:/);
            assert.match((error as Error).message, /JSON/);
            return true;
          });
          break;
        }
      }
    });
  });

  test('reject (code !== 0))', async () => {
    const promise = getParameters('source.mov');
    process.nextTick(() => {
      ffprobe.stderr.emit('data', Buffer.from('Some ffprobe error'));
      ffprobe.emit('close', 1);
    });
    await assert.rejects(promise, /FFprobe exited with code/);
  });
});
