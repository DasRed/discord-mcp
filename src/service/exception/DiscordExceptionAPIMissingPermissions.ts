import DiscordExceptionAPI from '@/service/exception/DiscordExceptionAPI';

export default class DiscordExceptionAPIMissingPermissions extends DiscordExceptionAPI {
    public static readonly identifier: number = 50013;
}
