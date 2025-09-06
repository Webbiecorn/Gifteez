import React, { useState, useEffect } from 'react';

type Props = {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
};

/**
 * ImageWithFallback
 * Shows the provided src, and if it fails to load, swaps to a safe fallback.
 * Default fallback uses Picsum which is generally reliable.
 */
const ImageWithFallback: React.FC<Props> = ({ src, alt, className, fallbackSrc }) => {
  const defaultFallback = fallbackSrc || 'https://picsum.photos/800/600?blur=2&random=5';
  const [currentSrc, setCurrentSrc] = useState(src || defaultFallback);

  useEffect(() => {
    setCurrentSrc(src || defaultFallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (currentSrc !== defaultFallback) {
          setCurrentSrc(defaultFallback);
        }
      }}
    />
  );
};

export default ImageWithFallback;
