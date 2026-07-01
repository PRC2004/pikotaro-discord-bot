export function isValidUrl(value: unknown): value is string {
    if (typeof value !== 'string') return false

    try {
        new URL(value);
        return true;
    } catch {
        return false
    }
}

export function isValidDate(value: string): boolean {
    return Date.parse(value) ? true : false
}