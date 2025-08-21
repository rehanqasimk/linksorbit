import Image, { ImageProps } from 'next/image';
import imageLoader from '../lib/image-loader';

/**
 * SafeImage component that handles protocol-relative URLs
 * This component can be used as a drop-in replacement for Next.js Image component
 */
export default function SafeImage({ src, ...props }: ImageProps) {
  // Ensure src is a string to prevent type errors
  const imageSrc = typeof src === 'string' ? src : '';
  
  return (
    <Image 
      src={imageSrc} 
      loader={imageLoader} 
      {...props} 
    />
  );
}
