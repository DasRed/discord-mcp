import type DiscordChannelTypeEnum from '@/enum/DiscordChannelTypeEnum';
import type DiscordUserModelInterface from '@/model/DiscordUserModelInterface';

export default interface DiscordDirectChannelModelInterface {
    id: string;
    /** derived from the ID of the last message */
    lastMessageAt: Date | null;
    name: string;
    recipients: DiscordUserModelInterface[];
    type: DiscordChannelTypeEnum;
}
