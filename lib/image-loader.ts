import type { ImageLoaderProps } from 'next/image';

/**
 * Custom image loader that handles protocol-relative URLs by converting them to https
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  // If src starts with '//' (protocol-relative URL), convert it to https://
  if (src.startsWith('//')) {
    src = `https:${src}`;
  }
  
  // Add quality parameter if provided
  const qualityParam = quality ? `&q=${quality}` : '';
  
  // Return the URL with width and quality parameters
  // You can customize this further based on your CDN or image service
  if (src.includes('?')) {
    return `${src}&w=${width}${qualityParam}`;
  }
  
  return `${src}?w=${width}${qualityParam}`;
}
