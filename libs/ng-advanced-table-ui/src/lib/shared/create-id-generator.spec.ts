import { createIdGenerator } from './create-id-generator';

describe('createIdGenerator', () => {
  it('generates ids with the given prefix and an incrementing counter starting at 0', () => {
    const gen = createIdGenerator('my-prefix');

    expect(gen()).toBe('my-prefix-0');
    expect(gen()).toBe('my-prefix-1');
    expect(gen()).toBe('my-prefix-2');
  });

  it('maintains independent counters per generator instance', () => {
    const genA = createIdGenerator('a');
    const genB = createIdGenerator('b');

    expect(genA()).toBe('a-0');
    expect(genB()).toBe('b-0');
    expect(genA()).toBe('a-1');
    expect(genB()).toBe('b-1');
  });
});
