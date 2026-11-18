import DiscordChannelTypeEnum from '@/enum/DiscordChannelTypeEnum';
import DiscordModelConverter from '@/service/DiscordModelConverter';
import {describe, expect, it} from 'vitest';

describe('DiscordModelConverter', () => {
    it('converts guilds', () => {
        expect(DiscordModelConverter.toGuild({icon: 'abc', id: '1', name: 'Guild', owner: true})).toEqual({
            iconURL: 'https://cdn.discordapp.com/icons/1/abc.png',
            id:      '1',
            name:    'Guild',
            owner:   true,
        });
        expect(DiscordModelConverter.toGuild({icon: null, id: '2', name: 'Other'}).iconURL).toBeNull();
    });

    it('converts channels including unknown types', () => {
        expect(DiscordModelConverter.toChannel({guild_id: '1', id: '10', name: 'general', parent_id: '9', position: 3, topic: null, type: 0})).toEqual({
            guildId:  '1',
            id:       '10',
            name:     'general',
            parentId: '9',
            position: 3,
            topic:    null,
            type:     DiscordChannelTypeEnum.TEXT,
        });
        expect(DiscordModelConverter.toChannel({id: '11', type: 99}).type).toBe(DiscordChannelTypeEnum.UNKNOWN);
    });

    it('converts messages', () => {
        const message = DiscordModelConverter.toMessage({
            attachments:      [{filename: 'a.png', id: '5', url: 'https://cdn.discordapp.com/a.png'}],
            author:           {global_name: null, id: '7', username: 'marco'},
            channel_id:       '10',
            content:          'Hello',
            edited_timestamp: null,
            id:               '100',
            timestamp:        '2026-11-18T10:00:00.000Z',
        });

        expect(message).toEqual({
            attachments: ['https://cdn.discordapp.com/a.png'],
            authorId:    '7',
            authorName:  'marco',
            channelId:   '10',
            content:     'Hello',
            editedAt:    null,
            id:          '100',
            timestamp:   new Date('2026-11-18T10:00:00.000Z'),
        });
    });
});
