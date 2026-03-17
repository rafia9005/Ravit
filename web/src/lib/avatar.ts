export function getInitials(name: string): string {
    if (!name) return "";

    return name
        .trim()
        .split(/\s+/)
        .filter((part) => part.length > 0) 
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function getAvatarUrl(avatar?: string | null): string | undefined {
	if (!avatar) return undefined;
	// Jika avatar adalah URL lengkap, return as is
	if (avatar.startsWith("http")) return avatar;
	// Jika relative path, combine dengan base URL
	return `${import.meta.env.VITE_API}${avatar}`;
}
