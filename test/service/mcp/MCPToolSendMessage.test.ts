import type DiscordAPIClient from '@/service/DiscordAPIClient';
import MCPToolSendMessage from '@/service/mcp/MCPToolSendMessage';
import {describe, expect, it, vi} from 'vitest';

describe('MCPToolSendMessage', () => {
    it('splits long messages and sends the parts in order', async () => {
        let id              = 0;
        const createMessage = vi.fn().mockImplementation(async () => ({id: String(++id)}));
        const tool          = new MCPToolSendMessage({createMessage} as unknown as DiscordAPIClient);
        const result        = await tool.call({channel_id: '10', content: `${'a'.repeat(1500)}\n\n${'b'.repeat(1500)}`});

        expect(createMessage).toHaveBeenCalledTimes(2);
        expect(createMessage).toHaveBeenNthCalledWith(1, '10', 'a'.repeat(1500));
        expect(JSON.parse((result.content[0] as {text: string}).text)).toEqual({channelId: '10', messageIds: ['1', '2']});
    });
});
