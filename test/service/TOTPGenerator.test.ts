import TOTPGenerator from '@/service/TOTPGenerator';
import {describe, expect, it} from 'vitest';

// RFC 6238 test secret "12345678901234567890" as base32
const SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

describe('TOTPGenerator', () => {
    it('decodes base32 secrets', () => {
        expect(TOTPGenerator.decodeBase32(SECRET).toString('ascii')).toBe('12345678901234567890');
        expect(TOTPGenerator.decodeBase32('gezd gnbv-gy3t qojq').toString('ascii')).toBe('1234567890');
    });

    it('generates the RFC 6238 codes', () => {
        expect(TOTPGenerator.generate(SECRET, 59 * 1000)).toBe('287082');
        expect(TOTPGenerator.generate(SECRET, 1111111109 * 1000)).toBe('081804');
        expect(TOTPGenerator.generate(SECRET, 2000000000 * 1000)).toBe('279037');
    });
});
