import DiscordExceptionConverter from '@/service/exception/DiscordExceptionConverter';
import DiscordExceptionLogin from '@/service/exception/DiscordExceptionLogin';
import DiscordExceptionUnknown from '@/service/exception/DiscordExceptionUnknown';
import DiscordExceptionUnknownError from '@/service/exception/DiscordExceptionUnknownError';
import {describe, expect, it} from 'vitest';

describe('DiscordExceptionConverter', () => {
    it('keeps own exceptions and wraps foreign ones', () => {
        const login = new DiscordExceptionLogin('login');
        const error = new TypeError('fetch failed');

        expect(DiscordExceptionConverter.convert(login)).toBe(login);
        expect(DiscordExceptionConverter.convert(error)).toBeInstanceOf(DiscordExceptionUnknownError);
        expect((DiscordExceptionConverter.convert(error) as DiscordExceptionUnknownError).error).toBe(error);
        expect(DiscordExceptionConverter.convert('boom')).toBeInstanceOf(DiscordExceptionUnknown);
        expect(DiscordExceptionConverter.convert('boom').message).toBe('boom');
    });
});
