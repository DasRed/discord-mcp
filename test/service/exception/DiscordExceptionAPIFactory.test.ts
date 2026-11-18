import DiscordExceptionAPI from '@/service/exception/DiscordExceptionAPI';
import DiscordExceptionAPIFactory from '@/service/exception/DiscordExceptionAPIFactory';
import DiscordExceptionAPIMissingAccess from '@/service/exception/DiscordExceptionAPIMissingAccess';
import {describe, expect, it} from 'vitest';

describe('DiscordExceptionAPIFactory', () => {
    it('maps Discord error codes to exceptions', () => {
        const exception = DiscordExceptionAPIFactory.create({data: {code: 50001, message: 'Missing Access'}, method: 'GET', path: '/channels/1/messages', status: 403});

        expect(exception).toBeInstanceOf(DiscordExceptionAPIMissingAccess);
        expect(exception.status).toBe(403);
        expect(exception.name).toBe('DiscordExceptionAPIMissingAccess');
        expect(exception.message).toBe('Discord API GET /channels/1/messages failed with HTTP 403: Missing Access');
    });

    it('falls back to the generic API exception', () => {
        const exception = DiscordExceptionAPIFactory.create({data: null, method: 'POST', path: '/x', status: 500});

        expect(exception.constructor).toBe(DiscordExceptionAPI);
        expect(exception.message).toBe('Discord API POST /x failed with HTTP 500');
    });
});
