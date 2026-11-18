export default interface DiscordAPIChannelInterface {
    guild_id?: string | null;
    id: string;
    name?: string | null;
    parent_id?: string | null;
    position?: number;
    topic?: string | null;
    /** numeric channel type of the Discord API */
    type: number;
}
