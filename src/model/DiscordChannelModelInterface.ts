import type DiscordChannelTypeEnum from '@/enum/DiscordChannelTypeEnum';

export default interface DiscordChannelModelInterface {
    guildId: string | null;
    id: string;
    name: string;
    parentId: string | null;
    position: number;
    topic: string | null;
    type: DiscordChannelTypeEnum;
}
