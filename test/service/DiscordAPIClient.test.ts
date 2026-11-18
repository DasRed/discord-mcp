import FakeDiscordSession from '../FakeDiscordSession';
import DiscordAPIClient from '@/service/DiscordAPIClient';
import DiscordExceptionAPIUnknownChannel from '@/service/exception/DiscordExceptionAPIUnknownChannel';
import DiscordExceptionUnknownError from '@/service/exception/DiscordExceptionUnknownError';
import {afterEach, beforeEach, describe, expect, it, type Mock, vi} from 'vitest';

function json(status: number, data: unknown): Response {
    return new Response(JSON.stringify(data), {headers: {'content-type': 'application/json'}, status});
}

describe('DiscordAPIClient', () => {
    let fetchMock: Mock;
    let session: FakeDiscordSession;
    let client: DiscordAPIClient;

    beforeEach(() => {
        fetchMock = vi.fn();
        session   = new FakeDiscordSession();
        client    = new DiscordAPIClient({session, url: 'https://discord.test/api/v9/'});
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('sends the session token and user agent', async () => {
        fetchMock.mockResolvedValueOnce(json(200, [{icon: null, id: '1', name: 'Guild'}]));

        expect(await client.getGuilds()).toEqual([{iconURL: null, id: '1', name: 'Guild', owner: false}]);

        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toBe('https://discord.test/api/v9/users/@me/guilds');
        expect(init.method).toBe('GET');
        expect(init.headers).toEqual({'accept': 'application/json', 'authorization': 'token-1', 'user-agent': 'test-agent'});
    });

    it('sorts channels by position and builds message queries', async () => {
        fetchMock.mockResolvedValueOnce(json(200, [{id: 'b', position: 2, type: 0}, {id: 'a', position: 1, type: 2}]));
        fetchMock.mockResolvedValueOnce(json(200, []));

        expect((await client.getGuildChannels('1')).map((channel) => channel.id)).toEqual(['a', 'b']);

        await client.getChannelMessages('10', {before: '99', limit: 20});
        expect(fetchMock.mock.calls[1][0]).toBe('https://discord.test/api/v9/channels/10/messages?limit=20&before=99');
    });

    it('posts messages with a JSON body', async () => {
        fetchMock.mockResolvedValueOnce(json(200, {attachments: [], author: {id: '7', username: 'marco'}, channel_id: '10', content: 'hi', edited_timestamp: null, id: '100', timestamp: '2026-11-18T10:00:00Z'}));

        const message  = await client.createMessage('10', 'hi');
        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];

        expect(message.id).toBe('100');
        expect(init.body).toBe('{"content":"hi"}');
        expect((init.headers as Record<string, string>)['content-type']).toBe('application/json');
    });

    it('invalidates the session once on HTTP 401', async () => {
        fetchMock.mockResolvedValueOnce(json(401, {code: 0, message: '401: Unauthorized'}));
        fetchMock.mockResolvedValueOnce(json(200, []));

        await client.getGuilds();

        expect(session.invalidations).toBe(1);
        expect((fetchMock.mock.calls[1][1] as RequestInit).headers).toMatchObject({authorization: 'token-2'});
    });

    it('waits and retries on rate limits', async () => {
        fetchMock.mockResolvedValueOnce(json(429, {message: 'You are being rate limited.', retry_after: 0.01}));
        fetchMock.mockResolvedValueOnce(json(200, []));

        expect(await client.getGuilds()).toEqual([]);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('throws mapped API exceptions and wraps network errors', async () => {
        fetchMock.mockResolvedValueOnce(json(404, {code: 10003, message: 'Unknown Channel'}));
        await expect(client.getChannelMessages('5')).rejects.toBeInstanceOf(DiscordExceptionAPIUnknownChannel);

        fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
        await expect(client.getGuilds()).rejects.toBeInstanceOf(DiscordExceptionUnknownError);
    });
});
