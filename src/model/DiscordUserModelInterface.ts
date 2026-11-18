export default interface DiscordUserModelInterface {
    id: string;
    /** display name, falls back to the username */
    name: string;
    username: string;
}
