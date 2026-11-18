import type DiscordMessageModelInterface from '@/model/DiscordMessageModelInterface';
import type DiscordAPIClient from '@/service/DiscordAPIClient';
import MCPToolReadMessages from '@/service/mcp/MCPToolReadMessages';
import {describe, expect, it, vi} from 'vitest';

function message(id: number, hoursAgo: number): DiscordMessageModelInterface {
    return {
        attachments: [],
        authorId:    '7',
        authorName:  'marco',
        channelId:   '10',
        content:     `message ${id}`,
        editedAt:    null,
        id:          String(id),
        timestamp:   new Date(Date.now() - hoursAgo * 3600 * 1000),
    };
}

describe('MCPToolReadMessages', () => {
    it('pages through the history until max_messages is reached', async () => {
        const getChannelMessages = vi.fn()
                                     .mockResolvedValueOnce(Array.from({length: 100}, (_value, index) => message(500 - index, 1)))
                                     .mockResolvedValueOnce(Array.from({length: 20}, (_value, index) => message(400 - index, 1)));
        const tool               = new MCPToolReadMessages({getChannelMessages} as unknown as DiscordAPIClient);
        const result             = await tool.call({channel_id: '10', max_messages: 120});

        expect(JSON.parse((result.content[0] as {text: string}).text)).toHaveLength(120);
        expect(getChannelMessages).toHaveBeenNthCalledWith(1, '10', {before: undefined, limit: 100});
        expect(getChannelMessages).toHaveBeenNthCalledWith(2, '10', {before: '401', limit: 20});
    });

    it('stops at messages older than hours_back', async () => {
        const getChannelMessages = vi.fn().mockResolvedValueOnce([message(3, 1), message(2, 2), message(1, 30)]);
        const tool               = new MCPToolReadMessages({getChannelMessages} as unknown as DiscordAPIClient);
        const result             = await tool.call({channel_id: '10', hours_back: 24, max_messages: 3});
        const ids                = (JSON.parse((result.content[0] as {text: string}).text) as {id: string}[]).map((entry) => entry.id);

        expect(ids).toEqual(['3', '2']);
        expect(getChannelMessages).toHaveBeenCalledTimes(1);
    });

    it('returns errors as tool errors', async () => {
        const tool   = new MCPToolReadMessages({getChannelMessages: vi.fn().mockRejectedValue(new Error('boom'))} as unknown as DiscordAPIClient);
        const result = await tool.call({channel_id: '10', max_messages: 1});

        expect(result.isError).toBe(true);
        expect(result.content[0]).toEqual({text: 'Error: boom', type: 'text'});
    });
});
