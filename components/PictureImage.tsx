import React, { useState } from 'react';

interface SourceDef { src: string; type: string; };
interface PictureImageProps {
  alt: string;
  fallback: string;
  sources?: SourceDef[]; // ordered by preference
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'sync' | 'async' | 'auto';
  onLoad?: () => void;
}

const PictureImage: React.FC<PictureImageProps> = ({ alt, fallback, sources = [], width, height, className, loading = 'lazy', decoding='async', onLoad }) => {
  const [errored, setErrored] = useState(false);
  return (
    <picture>
      {sources.map(s => <source key={s.src} srcSet={s.src} type={s.type} />)}
      <img
        src={fallback}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        className={className}
        onError={() => setErrored(true)}
        onLoad={onLoad}
      />
    </picture>
  );
};

export default PictureImage;
