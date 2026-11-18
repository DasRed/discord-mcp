export default interface ConfigInterface {
    discord: {
        apiURL: string;
        /** Directory for the persisted browser session and token */
        dataDir: string;
        email: string;
        headless: boolean;
        loginTimeout: number;
        password: string;
        /** Discord session token; when set, no browser login happens */
        token: string;
        /** Base32 secret of the authenticator app for accounts with two-factor authentication */
        totpSecret: string;
    };
    mcp: {
        /** Optional bearer token required on the MCP endpoint */
        authToken: string;
        path: string;
        readOnly: boolean;
    };
    server: {
        host: string;
        logLevel: string;
        port: number;
    };
}
