import DiscordChannelTypeEnum from '@/enum/DiscordChannelTypeEnum';
import type DiscordAPIChannelInterface from '@/model/api/DiscordAPIChannelInterface';
import type DiscordAPIGuildInterface from '@/model/api/DiscordAPIGuildInterface';
import type DiscordAPIMessageInterface from '@/model/api/DiscordAPIMessageInterface';
import type DiscordChannelModelInterface from '@/model/DiscordChannelModelInterface';
import type DiscordGuildModelInterface from '@/model/DiscordGuildModelInterface';
import type DiscordMessageModelInterface from '@/model/DiscordMessageModelInterface';

const CHANNEL_TYPES: Record<number, DiscordChannelTypeEnum> = {
    0:  DiscordChannelTypeEnum.TEXT,
    1:  DiscordChannelTypeEnum.DM,
    2:  DiscordChannelTypeEnum.VOICE,
    3:  DiscordChannelTypeEnum.GROUP_DM,
    4:  DiscordChannelTypeEnum.CATEGORY,
    5:  DiscordChannelTypeEnum.ANNOUNCEMENT,
    10: DiscordChannelTypeEnum.ANNOUNCEMENT_THREAD,
    11: DiscordChannelTypeEnum.PUBLIC_THREAD,
    12: DiscordChannelTypeEnum.PRIVATE_THREAD,
    13: DiscordChannelTypeEnum.STAGE_VOICE,
    14: DiscordChannelTypeEnum.DIRECTORY,
    15: DiscordChannelTypeEnum.FORUM,
    16: DiscordChannelTypeEnum.MEDIA,
};

export default class DiscordModelConverter {
    static toChannel(channel: DiscordAPIChannelInterface): DiscordChannelModelInterface {
        return {
            guildId:  channel.guild_id ?? null,
            id:       channel.id,
            name:     channel.name ?? '',
            parentId: channel.parent_id ?? null,
            position: channel.position ?? 0,
            topic:    channel.topic ?? null,
            type:     CHANNEL_TYPES[channel.type] ?? DiscordChannelTypeEnum.UNKNOWN,
        };
    }

    static toGuild(guild: DiscordAPIGuildInterface): DiscordGuildModelInterface {
        return {
            iconURL: guild.icon !== null ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
            id:      guild.id,
            name:    guild.name,
            owner:   guild.owner ?? false,
        };
    }

    static toMessage(message: DiscordAPIMessageInterface): DiscordMessageModelInterface {
        return {
            attachments: message.attachments.map((attachment) => attachment.url),
            authorId:    message.author.id,
            authorName:  message.author.global_name ?? message.author.username,
            channelId:   message.channel_id,
            content:     message.content,
            editedAt:    message.edited_timestamp !== null ? new Date(message.edited_timestamp) : null,
            id:          message.id,
            timestamp:   new Date(message.timestamp),
        };
    }
}
