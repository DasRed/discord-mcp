import DiscordExceptionAPI from '@/service/exception/DiscordExceptionAPI';

export default class DiscordExceptionAPIUnknownGuild extends DiscordExceptionAPI {
    public static readonly identifier: number = 10004;
}
