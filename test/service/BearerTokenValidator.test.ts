import BearerTokenValidator from '@/service/BearerTokenValidator';
import {describe, expect, it} from 'vitest';

describe('BearerTokenValidator', () => {
    it('accepts every request without configured token', () => {
        expect(BearerTokenValidator.isValid(undefined, '')).toBe(true);
    });

    it('compares the bearer token', () => {
        expect(BearerTokenValidator.isValid('Bearer secret', 'secret')).toBe(true);
        expect(BearerTokenValidator.isValid('Bearer wrong!', 'secret')).toBe(false);
        expect(BearerTokenValidator.isValid(undefined, 'secret')).toBe(false);
    });
});
