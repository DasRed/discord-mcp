import {timingSafeEqual} from 'node:crypto';

export default class BearerTokenValidator {
    static isValid(header: string | undefined, token: string): boolean {
        if (token === '') {
            return true;
        }

        const expected = Buffer.from(`Bearer ${token}`);
        const actual   = Buffer.from(header ?? '');

        return actual.length === expected.length && timingSafeEqual(actual, expected);
    }
}
