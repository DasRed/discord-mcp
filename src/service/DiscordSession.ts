import type DiscordSessionInterface from '@/interface/DiscordSessionInterface';
import DiscordExceptionLogin from '@/service/exception/DiscordExceptionLogin';
import TOTPGenerator from '@/service/TOTPGenerator';
import {existsSync} from 'node:fs';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {setTimeout} from 'node:timers/promises';
import {type Browser, type BrowserContext, chromium, type Page} from 'playwright';

interface DiscordSessionConstructorOptionInterface {
    dataDir: string;
    email?: string;
    headless?: boolean;
    loginTimeout?: number;
    password?: string;
    token?: string;
    totpSecret?: string;
}

interface DiscordSessionCapturedTokenInterface {
    token: string | null;
}

const CAPTCHA_SELECTOR   = 'iframe[src*="captcha"]';
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const DISCORD_URL        = 'https://discord.com';
const EMAIL_SELECTOR     = 'input[name="email"]';
const MFA_SELECTOR       = 'input[autocomplete="one-time-code"]';
const PASSWORD_SELECTOR  = 'input[name="password"]';
const POLL_INTERVAL      = 1000;
const STORAGE_STATE_FILE = 'storage-state.json';
const TOKEN_FILE         = 'token';

export default class DiscordSession implements DiscordSessionInterface {
    protected readonly dataDir: string;
    protected readonly email: string;
    protected readonly headless: boolean;
    protected readonly loginTimeout: number;
    protected readonly password: string;
    protected pendingLogin: Promise<string> | null;
    protected storedTokenChecked: boolean;
    protected token: string | null;
    protected readonly totpSecret: string;
    protected userAgent: string;

    constructor({dataDir, email = '', headless = true, loginTimeout = 120000, password = '', token = '', totpSecret = ''}: DiscordSessionConstructorOptionInterface) {
        this.dataDir            = dataDir;
        this.email              = email;
        this.headless           = headless;
        this.loginTimeout       = loginTimeout;
        this.password           = password;
        this.pendingLogin       = null;
        this.storedTokenChecked = false;
        this.token              = token !== '' ? token : null;
        this.totpSecret         = totpSecret;
        this.userAgent          = DEFAULT_USER_AGENT;
    }

    protected captureToken(page: Page): DiscordSessionCapturedTokenInterface {
        const captured: DiscordSessionCapturedTokenInterface = {token: null};

        // the web app sends the session token as raw Authorization header on every API request
        page.on('request', (request) => {
            if (captured.token !== null || request.url().startsWith(`${DISCORD_URL}/api/`) === false) {
                return;
            }

            void request.allHeaders()
                        .then((headers) => {
                            const authorization = headers.authorization;
                            if (authorization != null && authorization !== '') {
                                captured.token = authorization;
                            }
                        })
                        .catch(() => undefined);
        });

        return captured;
    }

    protected async createContext(browser: Browser): Promise<BrowserContext> {
        const probe = await browser.newContext();
        const page  = await probe.newPage();

        // headless Chromium identifies itself as "HeadlessChrome", which Discord answers with captchas
        this.userAgent = (await page.evaluate(() => navigator.userAgent)).replace('HeadlessChrome', 'Chrome');
        await probe.close();

        const storageState = join(this.dataDir, STORAGE_STATE_FILE);

        return browser.newContext({
            locale:       'en-US',
            storageState: existsSync(storageState) ? storageState : undefined,
            userAgent:    this.userAgent,
        });
    }

    async getToken(): Promise<string> {
        if (this.token !== null) {
            return this.token;
        }

        // concurrent tool calls share one login
        this.pendingLogin ??= this.login().finally(() => {
            this.pendingLogin = null;
        });

        return this.pendingLogin;
    }

    getUserAgent(): string {
        return this.userAgent;
    }

    invalidate(): this {
        this.token = null;

        return this;
    }

    protected async isVisible(page: Page, selector: string): Promise<boolean> {
        return page.locator(selector).first().isVisible().catch(() => false);
    }

    protected async login(): Promise<string> {
        if (this.storedTokenChecked === false) {
            this.storedTokenChecked = true;

            const storedToken = await this.readStoredToken();
            if (storedToken !== null) {
                this.token = storedToken;

                return storedToken;
            }
        }

        const token = await this.loginWithBrowser();

        this.token = token;
        await writeFile(join(this.dataDir, TOKEN_FILE), token, {mode: 0o600});

        return token;
    }

    protected async loginWithBrowser(): Promise<string> {
        await mkdir(this.dataDir, {recursive: true});

        const browser = await chromium.launch({headless: this.headless});

        try {
            const context  = await this.createContext(browser);
            const page     = await context.newPage();
            const captured = this.captureToken(page);
            const token    = await this.waitForToken(page, captured);

            await context.storageState({path: join(this.dataDir, STORAGE_STATE_FILE)});

            return token;
        }
        finally {
            await browser.close();
        }
    }

    protected async readStoredToken(): Promise<string | null> {
        try {
            const token = (await readFile(join(this.dataDir, TOKEN_FILE), 'utf8')).trim();

            return token !== '' ? token : null;
        }
        catch {
            return null;
        }
    }

    protected async submitCredentials(page: Page): Promise<void> {
        if (this.email === '' || this.password === '') {
            throw new DiscordExceptionLogin('The Discord session expired and no credentials are configured (DISCORD_MCP_DISCORD_EMAIL, DISCORD_MCP_DISCORD_PASSWORD).');
        }

        await page.fill(EMAIL_SELECTOR, this.email);
        await page.fill(PASSWORD_SELECTOR, this.password);
        await page.press(PASSWORD_SELECTOR, 'Enter');
    }

    protected async submitTOTP(page: Page): Promise<void> {
        if (this.totpSecret === '') {
            throw new DiscordExceptionLogin('Discord asks for a two-factor code, but DISCORD_MCP_DISCORD_TOTP_SECRET is not set.');
        }

        await page.fill(MFA_SELECTOR, TOTPGenerator.generate(this.totpSecret));
        await page.press(MFA_SELECTOR, 'Enter');
    }

    protected async waitForToken(page: Page, captured: DiscordSessionCapturedTokenInterface): Promise<string> {
        await page.goto(`${DISCORD_URL}/channels/@me`, {waitUntil: 'domcontentloaded'});

        let credentialsSubmitted = false;
        let totpSubmitted        = false;

        for (let elapsed = 0; elapsed < this.loginTimeout; elapsed += POLL_INTERVAL) {
            if (captured.token !== null) {
                return captured.token;
            }

            if (await this.isVisible(page, CAPTCHA_SELECTOR)) {
                throw new DiscordExceptionLogin('Discord asks for a captcha. Log in once locally with DISCORD_MCP_DISCORD_HEADLESS=false and copy the data directory, or set DISCORD_MCP_DISCORD_TOKEN.');
            }

            if (credentialsSubmitted === false && await this.isVisible(page, EMAIL_SELECTOR)) {
                await this.submitCredentials(page);
                credentialsSubmitted = true;
            }

            if (totpSubmitted === false && await this.isVisible(page, MFA_SELECTOR)) {
                await this.submitTOTP(page);
                totpSubmitted = true;
            }

            await setTimeout(POLL_INTERVAL);
        }

        throw new DiscordExceptionLogin(`Discord login timed out after ${this.loginTimeout} ms. Discord may require an email verification for a new location.`);
    }
}
