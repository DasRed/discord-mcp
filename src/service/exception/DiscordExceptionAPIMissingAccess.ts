import DiscordExceptionAPI from '@/service/exception/DiscordExceptionAPI';

export default class DiscordExceptionAPIMissingAccess extends DiscordExceptionAPI {
    public static readonly identifier: number = 50001;
}
