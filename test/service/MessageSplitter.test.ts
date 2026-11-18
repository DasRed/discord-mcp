import MessageSplitter from '@/service/MessageSplitter';
import {describe, expect, it} from 'vitest';

describe('MessageSplitter', () => {
    it('keeps short messages in one part', () => {
        expect(MessageSplitter.split('  hello  ')).toEqual(['hello']);
        expect(MessageSplitter.split('   ')).toEqual([]);
    });

    it('splits at paragraphs, lines and words', () => {
        const paragraphs = MessageSplitter.split(`${'a'.repeat(60)}\n\n${'b'.repeat(60)}`, 100);
        const words      = MessageSplitter.split(`${'word '.repeat(30)}`, 50);

        expect(paragraphs).toEqual(['a'.repeat(60), 'b'.repeat(60)]);
        expect(words.every((part) => part.length <= 50)).toBe(true);
        expect(words.join(' ')).toBe('word '.repeat(30).trim());
    });

    it('hard splits content without separators', () => {
        expect(MessageSplitter.split('x'.repeat(250), 100)).toEqual(['x'.repeat(100), 'x'.repeat(100), 'x'.repeat(50)]);
    });
});
