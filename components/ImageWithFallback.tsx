import React, { useState, useEffect } from 'react';

type Props = {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  showSkeleton?: boolean;
  /**
   * How the image should fit its container. Defaults to 'cover' to preserve existing behavior.
   * Use 'contain' when you want the entire image visible without cropping.
   */
  fit?: 'cover' | 'contain';
};

/**
 * ImageWithFallback
 * Shows the provided src, and if it fails to load, swaps to a safe fallback.
 * Default fallback uses Picsum which is generally reliable.
 */
const ImageWithFallback: React.FC<Props> = ({ src, alt, className, fallbackSrc, width, height, showSkeleton, fit = 'cover' }) => {
  const defaultFallback = fallbackSrc || 'https://picsum.photos/800/600?blur=2&random=5';
  const [currentSrc, setCurrentSrc] = useState(src || defaultFallback);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || defaultFallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <div className={"relative " + (className || '')} style={width && height ? { aspectRatio: `${width}/${height}` } : undefined}>
      {showSkeleton && !loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={"w-full h-full object-" + fit + ' ' + (showSkeleton ? (loaded ? 'opacity-100 transition-opacity duration-300' : 'opacity-0') : '')}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          if (currentSrc !== defaultFallback) {
            console.error('Image load failed, swapping to fallback', { src: currentSrc, alt });
            setCurrentSrc(defaultFallback);
          } else {
            console.error('Fallback image also failed', { src: currentSrc, alt });
          }
        }}
      />
    </div>
  );
};

export default ImageWithFallback;
