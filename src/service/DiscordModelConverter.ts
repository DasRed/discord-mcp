import DiscordChannelTypeEnum from '@/enum/DiscordChannelTypeEnum';
import type DiscordAPIChannelInterface from '@/model/api/DiscordAPIChannelInterface';
import type DiscordAPIGuildInterface from '@/model/api/DiscordAPIGuildInterface';
import type DiscordAPIMessageInterface from '@/model/api/DiscordAPIMessageInterface';
import type DiscordAPIUserInterface from '@/model/api/DiscordAPIUserInterface';
import type DiscordChannelModelInterface from '@/model/DiscordChannelModelInterface';
import type DiscordDirectChannelModelInterface from '@/model/DiscordDirectChannelModelInterface';
import type DiscordGuildModelInterface from '@/model/DiscordGuildModelInterface';
import type DiscordMessageModelInterface from '@/model/DiscordMessageModelInterface';
import type DiscordUserModelInterface from '@/model/DiscordUserModelInterface';

// Discord snowflakes count milliseconds since 2015-01-01
const DISCORD_EPOCH = 1420070400000n;

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
    static snowflakeToDate(snowflake: string): Date {
        return new Date(Number((BigInt(snowflake) >> 22n) + DISCORD_EPOCH));
    }

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

    static toDirectChannel(channel: DiscordAPIChannelInterface): DiscordDirectChannelModelInterface {
        const recipients = (channel.recipients ?? []).map((user) => DiscordModelConverter.toUser(user));

        return {
            id:            channel.id,
            lastMessageAt: channel.last_message_id != null ? DiscordModelConverter.snowflakeToDate(channel.last_message_id) : null,
            name:          channel.name ?? recipients.map((user) => user.name).join(', '),
            recipients:    recipients,
            type:          CHANNEL_TYPES[channel.type] ?? DiscordChannelTypeEnum.UNKNOWN,
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
            authorName:  DiscordModelConverter.toUser(message.author).name,
            channelId:   message.channel_id,
            content:     message.content,
            editedAt:    message.edited_timestamp !== null ? new Date(message.edited_timestamp) : null,
            id:          message.id,
            timestamp:   new Date(message.timestamp),
        };
    }

    static toUser(user: DiscordAPIUserInterface): DiscordUserModelInterface {
        return {
            id:       user.id,
            name:     user.global_name ?? user.username,
            username: user.username,
        };
    }
}
