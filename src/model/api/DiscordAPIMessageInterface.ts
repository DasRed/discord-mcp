import type DiscordAPIAttachmentInterface from '@/model/api/DiscordAPIAttachmentInterface';
import type DiscordAPIUserInterface from '@/model/api/DiscordAPIUserInterface';

export default interface DiscordAPIMessageInterface {
    attachments: DiscordAPIAttachmentInterface[];
    author: DiscordAPIUserInterface;
    channel_id: string;
    content: string;
    edited_timestamp: string | null;
    id: string;
    timestamp: string;
}
