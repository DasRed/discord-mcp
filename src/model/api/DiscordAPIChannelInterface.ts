import type DiscordAPIUserInterface from '@/model/api/DiscordAPIUserInterface';

export default interface DiscordAPIChannelInterface {
    guild_id?: string | null;
    id: string;
    last_message_id?: string | null;
    name?: string | null;
    parent_id?: string | null;
    position?: number;
    /** users of a direct message or group DM channel */
    recipients?: DiscordAPIUserInterface[];
    topic?: string | null;
    /** numeric channel type of the Discord API */
    type: number;
}
