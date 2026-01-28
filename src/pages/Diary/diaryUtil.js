
export const normalizeTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
        return tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
    }
    return [];
};