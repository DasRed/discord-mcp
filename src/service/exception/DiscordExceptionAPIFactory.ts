import type DiscordAPIErrorInterface from '@/model/api/DiscordAPIErrorInterface';
import DiscordExceptionAPI from '@/service/exception/DiscordExceptionAPI';
import DiscordExceptionAPIMissingAccess from '@/service/exception/DiscordExceptionAPIMissingAccess';
import DiscordExceptionAPIMissingPermissions from '@/service/exception/DiscordExceptionAPIMissingPermissions';
import DiscordExceptionAPIUnknownChannel from '@/service/exception/DiscordExceptionAPIUnknownChannel';
import DiscordExceptionAPIUnknownGuild from '@/service/exception/DiscordExceptionAPIUnknownGuild';

interface DiscordExceptionAPIFactoryCreateOptionInterface {
    data: unknown;
    method: string;
    path: string;
    status: number;
}

const EXCEPTIONS = [
    DiscordExceptionAPIMissingAccess,
    DiscordExceptionAPIMissingPermissions,
    DiscordExceptionAPIUnknownChannel,
    DiscordExceptionAPIUnknownGuild,
];

export default class DiscordExceptionAPIFactory {
    static create({data, method, path, status}: DiscordExceptionAPIFactoryCreateOptionInterface): DiscordExceptionAPI {
        const error     = (data ?? {}) as DiscordAPIErrorInterface;
        const message   = `Discord API ${method} ${path} failed with HTTP ${status}${error.message != null ? `: ${error.message}` : ''}`;
        const Exception = EXCEPTIONS.find((exception) => exception.identifier === error.code) ?? DiscordExceptionAPI;

        return new Exception(message, status, data);
    }
}
