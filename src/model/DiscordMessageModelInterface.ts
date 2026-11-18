export default interface DiscordMessageModelInterface {
    /** URLs of the attached files */
    attachments: string[];
    authorId: string;
    authorName: string;
    channelId: string;
    content: string;
    editedAt: Date | null;
    id: string;
    timestamp: Date;
}
