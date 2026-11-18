import {createHmac} from 'node:crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const DIGITS          = 6;
const PERIOD_SECONDS  = 30;

export default class TOTPGenerator {
    static decodeBase32(secret: string): Buffer {
        const normalized = secret.toUpperCase().replace(/[^A-Z2-7]/g, '');
        const bytes: number[] = [];
        let buffer = 0;
        let bits   = 0;

        for (const character of normalized) {
            buffer = (buffer << 5) | BASE32_ALPHABET.indexOf(character);
            bits  += 5;

            if (bits >= 8) {
                bits -= 8;
                bytes.push((buffer >> bits) & 0xff);
            }
        }

        return Buffer.from(bytes);
    }

    static generate(secret: string, time: number = Date.now()): string {
        const counter = Buffer.alloc(8);
        counter.writeBigUInt64BE(BigInt(Math.floor(time / 1000 / PERIOD_SECONDS)));

        const hmac   = createHmac('sha1', TOTPGenerator.decodeBase32(secret)).update(counter).digest();
        const offset = hmac[hmac.length - 1] & 0x0f;
        const code   = (hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** DIGITS;

        return String(code).padStart(DIGITS, '0');
    }
}
