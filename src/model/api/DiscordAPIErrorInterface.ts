export default interface DiscordAPIErrorInterface {
    code?: number;
    message?: string;
    /** seconds to wait before retrying, only on HTTP 429 */
    retry_after?: number;
}
