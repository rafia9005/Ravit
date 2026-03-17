/**
 * Image URL utilities for handling media from the backend
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/**
 * Get the full URL for a media file from the backend
 * @param path - The media path returned from the backend (e.g., "/media/posts/images/xxx.png")
 * @returns The full URL to fetch the media
 */
export function getMediaUrl(path: string | undefined | null): string {
  if (!path) return "";
  
  // If already a full URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  
  // Construct full URL: API_URL/public/{path}
  return `${API_URL}/public/${cleanPath}`;
}

/**
 * Parse media URLs from a JSON string and return full URLs
 * @param mediaUrlsJson - JSON string of media URLs from post
 * @returns Array of full media URLs
 */
export function parseMediaUrls(mediaUrlsJson: string | undefined | null): string[] {
  if (!mediaUrlsJson) return [];
  
  try {
    const urls = JSON.parse(mediaUrlsJson);
    if (Array.isArray(urls)) {
      return urls.map(url => getMediaUrl(url));
    }
    return [];
  } catch {
    // If not valid JSON, try to use as single URL
    if (mediaUrlsJson.trim()) {
      return [getMediaUrl(mediaUrlsJson)];
    }
    return [];
  }
}

/**
 * Check if a URL is a video based on path
 * @param url - The media URL
 * @returns true if the URL points to a video
 */
export function isVideoUrl(url: string): boolean {
  return url.includes("/videos/") || 
         url.endsWith(".mp4") || 
         url.endsWith(".webm") || 
         url.endsWith(".mov");
}
