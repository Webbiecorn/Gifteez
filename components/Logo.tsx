import React from 'react';

type LogoProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  /**
   * When true, the logo image is marked as high priority and will use eager loading.
   */
  priority?: boolean;
  /**
   * Optional className applied to the wrapping <picture> element.
   */
  pictureClassName?: string;
};

const Logo: React.FC<LogoProps> = ({
  priority = false,
  pictureClassName = '',
  className = '',
  loading,
  decoding,
  onError,
  ...rest
}) => {
  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.currentTarget;

    if (!target.dataset.fallback) {
      target.dataset.fallback = 'true';
      target.src = '/images/gifteez-logo.png';
    }

    if (onError) {
      onError(event);
    }
  };

  return (
    <picture className={pictureClassName}>
      <source srcSet="/images/gifteez-logo.png" type="image/png" />
      <img
        src="/images/gifteez-logo.png"
        className={className}
        loading={loading ?? (priority ? 'eager' : 'lazy')}
        decoding={decoding ?? 'async'}
        onError={handleError}
        {...rest}
      />
    </picture>
  );
};

export default Logo;
