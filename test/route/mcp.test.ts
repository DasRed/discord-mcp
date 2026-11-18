import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';

vi.hoisted(() => {
    process.env.DISCORD_MCP_AUTH_TOKEN       = 'secret';
    process.env.DISCORD_MCP_READ_ONLY        = 'false';
    process.env.DISCORD_MCP_SERVER_LOG_LEVEL = 'silent';
});

vi.mock('@/lib/discordAPIClient', () => ({
    default: {
        getGuilds: vi.fn().mockResolvedValue([{iconURL: null, id: '1', name: 'Guild', owner: false}]),
    },
}));

const {default: app}   = await import('@/lib/app');
const {default: route} = await import('@/route/index');

const headers = {accept: 'application/json, text/event-stream', authorization: 'Bearer secret', 'content-type': 'application/json'};

async function rpc(method: string, params: object = {}): Promise<{result: Record<string, unknown>}> {
    const response = await app.inject({headers, method: 'POST', payload: {id: 1, jsonrpc: '2.0', method, params}, url: '/mcp'});

    expect(response.statusCode).toBe(200);

    return response.json();
}

describe('route mcp', () => {
    beforeAll(async () => {
        await app.register(route);
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    it('answers the health check', async () => {
        const response = await app.inject({method: 'GET', url: '/healthz'});

        expect(response.json()).toEqual({status: 'ok'});
    });

    it('rejects requests without the bearer token', async () => {
        const response = await app.inject({headers: {...headers, authorization: 'Bearer nope'}, method: 'POST', payload: {}, url: '/mcp'});

        expect(response.statusCode).toBe(401);
    });

    it('rejects GET in stateless mode', async () => {
        const response = await app.inject({headers, method: 'GET', url: '/mcp'});

        expect(response.statusCode).toBe(405);
    });

    it('lists the tools and calls get_servers', async () => {
        const list  = await rpc('tools/list');
        const names = (list.result.tools as {name: string}[]).map((tool) => tool.name);
        const call  = await rpc('tools/call', {arguments: {}, name: 'get_servers'});

        expect(names).toEqual(['get_servers', 'get_channels', 'read_messages', 'send_message']);
        expect(JSON.parse((call.result.content as {text: string}[])[0].text)).toEqual([{iconURL: null, id: '1', name: 'Guild', owner: false}]);
    });
});
