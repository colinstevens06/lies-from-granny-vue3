export type NetlifyImageFormat = 'webp' | 'avif' | 'jpg' | 'png';

/**
 * Builds a Netlify Image CDN URL for a source image under `public/images/`.
 *
 * Use this for every rendered image URL — under plain `vite dev` the CDN
 * doesn't exist, but `netlify dev` proxies it locally, so CDN URLs are safe
 * in all environments.
 *
 * The URL is built manually (not via URLSearchParams) so the rendered value
 * matches Netlify's documented format and any `<link rel="preload">` hrefs
 * exactly — a mismatch would cause the browser to download the image twice.
 *
 * @example netlifyImage('/images/shows/2025/example.jpg', 400)
 * // '/.netlify/images?url=/images/shows/2025/example.jpg&w=400&fm=webp'
 */
export function netlifyImage(src: string, width: number, format: NetlifyImageFormat = 'webp'): string {
	return `/.netlify/images?url=${src}&w=${width}&fm=${format}`;
}
