export default class MessageSplitter {
    protected static findSplitIndex(content: string, maxLength: number): number {
        const window = content.slice(0, maxLength);

        for (const separator of ['\n\n', '\n', ' ']) {
            const index = window.lastIndexOf(separator);
            if (index > maxLength / 2) {
                return index + separator.length;
            }
        }

        return maxLength;
    }

    /**
     * Discord rejects messages longer than 2000 characters, so long content is split
     * at paragraph, line or word boundaries.
     */
    static split(content: string, maxLength: number = 2000): string[] {
        const parts: string[] = [];
        let rest = content.trim();

        while (rest.length > maxLength) {
            const index = MessageSplitter.findSplitIndex(rest, maxLength);

            parts.push(rest.slice(0, index).trimEnd());
            rest = rest.slice(index).trimStart();
        }

        if (rest.length > 0) {
            parts.push(rest);
        }

        return parts;
    }
}
