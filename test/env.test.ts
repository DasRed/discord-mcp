import env from '@/env';
import {afterEach, describe, expect, it, vi} from 'vitest';

describe('env', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('returns the default value when the variable is missing or empty', () => {
        vi.stubEnv('DISCORD_MCP_TEST', '');

        expect(env('DISCORD_MCP_TEST', 'fallback')).toBe('fallback');
        expect(env('DISCORD_MCP_TEST_MISSING', 42)).toBe(42);
    });

    it('parses booleans and numbers by the type of the default value', () => {
        vi.stubEnv('DISCORD_MCP_TEST_BOOL', 'off');
        vi.stubEnv('DISCORD_MCP_TEST_NUMBER', '8080');
        vi.stubEnv('DISCORD_MCP_TEST_STRING', ' value ');

        expect(env('DISCORD_MCP_TEST_BOOL', true)).toBe(false);
        expect(env('DISCORD_MCP_TEST_NUMBER', 3000)).toBe(8080);
        expect(env('DISCORD_MCP_TEST_STRING', '')).toBe('value');
    });

    it('exits for missing required and invalid values', () => {
        const exit  = vi.spyOn(process, 'exit').mockImplementation((() => {
            throw new Error('exit');
        }) as never);
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        vi.stubEnv('DISCORD_MCP_TEST_BOOL', 'maybe');

        expect(() => env('DISCORD_MCP_TEST_REQUIRED')).toThrow('exit');
        expect(() => env('DISCORD_MCP_TEST_BOOL', true)).toThrow('exit');
        expect(exit).toHaveBeenCalledWith(1);
        expect(error).toHaveBeenCalledWith('Environment variable DISCORD_MCP_TEST_REQUIRED is required.');
    });
});
