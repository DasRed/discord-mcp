import dotenv from 'dotenv';

dotenv.config({quiet: true});

const TRUE_VALUES  = ['1', 'on', 'true', 'yes'];
const FALSE_VALUES = ['0', 'false', 'no', 'off'];

function fail(message: string): never {
    console.error(message);
    process.exit(1);
}

export default function env<T extends boolean | number | string>(name: string, defaultValue?: T): T {
    const value = process.env[name]?.trim();

    if (value === undefined || value === '') {
        if (defaultValue === undefined) {
            return fail(`Environment variable ${name} is required.`);
        }

        return defaultValue;
    }

    if (typeof defaultValue === 'boolean') {
        if (TRUE_VALUES.includes(value.toLowerCase())) {
            return true as T;
        }
        if (FALSE_VALUES.includes(value.toLowerCase())) {
            return false as T;
        }

        return fail(`Environment variable ${name} must be a boolean, got "${value}".`);
    }

    if (typeof defaultValue === 'number') {
        const parsed = Number(value);
        if (Number.isFinite(parsed) === false) {
            return fail(`Environment variable ${name} must be a number, got "${value}".`);
        }

        return parsed as T;
    }

    return value as T;
}
