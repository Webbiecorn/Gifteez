import React, { useState, useEffect, useContext, useRef } from 'react';
import { Gift, ShowToast } from '../types';
import Button from './Button';
import { withAffiliate } from '../services/affiliate';
import { HeartIcon, HeartIconFilled } from './IconComponents';
import { AuthContext } from '../contexts/AuthContext';
import ImageWithFallback from './ImageWithFallback';
import SocialShare from './SocialShare';

const badgeToneClasses: Record<string, string> = {
  primary: 'bg-[#232F3E] text-white',
  accent: 'bg-blue-100 text-blue-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  neutral: 'bg-gray-100 text-gray-700'
};

interface GiftResultCardProps {
  gift: Gift;
  index: number;
  onFavoriteChange?: (productName: string, isNowFavorite: boolean) => void;
  showToast?: ShowToast;
  isReadOnly?: boolean;
  isEmbedded?: boolean;
  imageHeightClass?: string; // Tailwind height utility override (e.g., h-48, h-40, h-32)
  imageFit?: 'cover' | 'contain';
  hideAmazonBadge?: boolean;
  candidateVariant?: boolean; // special compact alignment variant for comparison sections
  onCompareToggle?: (gift: Gift) => void; // Callback for compare toggle
  isInCompareList?: boolean; // Whether this gift is in compare list
}

// Helper to extract min/max price from price range string
const extractPriceRange = (priceRange?: string): { min: number; max: number } | null => {
  if (!priceRange) return null;
  
  // Match patterns like "€19 - €24" or "€50"
  const match = priceRange.match(/€(\d+)(?:\s*-\s*€(\d+))?/);
  if (!match) return null;
  
  const min = parseInt(match[1], 10);
  const max = match[2] ? parseInt(match[2], 10) : min;
  
  return { min, max };
};

const GiftResultCard: React.FC<GiftResultCardProps> = ({
  gift,
  index,
  onFavoriteChange,
  showToast,
  isReadOnly = false,
  isEmbedded = false,
  imageHeightClass = 'h-24 md:h-32 lg:h-40',
  imageFit = 'cover',
  hideAmazonBadge = false,
  candidateVariant = false,
  onCompareToggle,
  isInCompareList = false,
}) => {
  const auth = useContext(AuthContext);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [hovered, setHovered] = useState(false);
  const [favoritePulse, setFavoritePulse] = useState(false);
  const favoritePulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Add Product Schema for SEO
  useEffect(() => {
    if (isEmbedded || !gift.productName) return;
    
    const priceRange = extractPriceRange(gift.priceRange);
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: gift.productName,
      description: gift.description,
      ...(gift.imageUrl && { image: gift.imageUrl }),
      ...(priceRange && {
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'EUR',
          lowPrice: priceRange.min.toString(),
          highPrice: priceRange.max.toString(),
          availability: 'https://schema.org/InStock',
          ...(gift.retailers && gift.retailers.length > 0 && {
            url: gift.retailers[0].affiliateLink
          })
        }
      })
    };

    // Create a valid CSS selector ID by removing all special characters
    const scriptId = `product-schema-${gift.productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')  // Replace all non-alphanumeric chars with hyphen
      .replace(/^-+|-+$/g, '')}`;   // Remove leading/trailing hyphens
    
    let script = document.head.querySelector(`#${scriptId}`) as HTMLScriptElement | null;
    
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = scriptId;
      document.head.appendChild(script);
    }
    
    script.textContent = JSON.stringify(productSchema);

    return () => {
      // Clean up on unmount
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [gift, isEmbedded]);

  useEffect(() => {
    if (isReadOnly) return;

    if (auth?.currentUser) {
        setIsFavorite(auth.isFavorite(gift));
    } else {
        try {
            const favorites: Gift[] = JSON.parse(localStorage.getItem('gifteezFavorites') || '[]');
            setIsFavorite(favorites.some((fav: Gift) => fav.productName === gift.productName));
        } catch (e) {
            console.error("Failed to parse guest favorites from localStorage", e);
        }
    }
  }, [gift, auth, isReadOnly]);

  useEffect(() => () => {
    if (favoritePulseTimeoutRef.current) {
      clearTimeout(favoritePulseTimeoutRef.current);
    }
  }, []);

  const handleToggleFavorite = () => {
    if (isReadOnly) return;
    
    let isNowFavorite: boolean;

    if (auth?.currentUser) {
        auth.toggleFavorite(gift);
        isNowFavorite = !auth.isFavorite(gift); // isFavorite is from before the toggle
    } else {
        // Guest user logic
        try {
            const favorites: Gift[] = JSON.parse(localStorage.getItem('gifteezFavorites') || '[]');
            const isCurrentlyFavorite = favorites.some(fav => fav.productName === gift.productName);

            let updatedFavorites: Gift[];
            if (isCurrentlyFavorite) {
                updatedFavorites = favorites.filter(fav => fav.productName !== gift.productName);
            } else {
                updatedFavorites = [...favorites, gift];
            }
            localStorage.setItem('gifteezFavorites', JSON.stringify(updatedFavorites));
            isNowFavorite = !isCurrentlyFavorite;
        } catch (e) {
            console.error("Failed to update guest favorites in localStorage", e);
            return;
        }
    }
    
    setIsFavorite(isNowFavorite);
    if (isNowFavorite) {
        if (favoritePulseTimeoutRef.current) {
          clearTimeout(favoritePulseTimeoutRef.current);
        }
        setFavoritePulse(true);
        favoritePulseTimeoutRef.current = setTimeout(() => {
          setFavoritePulse(false);
        }, 220);
        showToast?.('Cadeau opgeslagen!');
    } else {
        setFavoritePulse(false);
    }
    onFavoriteChange?.(gift.productName, isNowFavorite);
  };

  const containerClasses = isEmbedded
    ? "bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
    : "bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-shadow duration-300";

  const imageContainerHeight = candidateVariant ? 'h-32 md:h-36' : imageHeightClass;

  return (
    <div
      className={`${containerClasses} h-full`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Only show image section if there's an imageUrl */}
      {gift.imageUrl && gift.imageUrl.trim() !== '' && (
          <div className={`relative ${candidateVariant ? imageContainerHeight + ' flex items-center justify-center bg-white p-4' : imageContainerHeight + ' w-full'}`}>
          {candidateVariant ? (
            <ImageWithFallback
              src={gift.imageUrl}
              alt={gift.productName}
              className="max-h-full max-w-full w-auto h-auto mx-auto"
              fit={imageFit}
            />
          ) : (
            <ImageWithFallback src={gift.imageUrl} alt={gift.productName} className="w-full h-full bg-white" fit={imageFit} />
          )}
          
          {/* Trending Badge */}
          {gift.trendingBadge && (
            <span className={`absolute top-3 left-3 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 ${
              gift.trendingBadge === 'trending' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
              gift.trendingBadge === 'hot-deal' ? 'bg-gradient-to-r from-red-600 to-pink-600' :
              gift.trendingBadge === 'seasonal' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' :
              'bg-gradient-to-r from-yellow-500 to-amber-500'
            }`}>
              <span className="text-base">
                {gift.trendingBadge === 'trending' ? '🔥' :
                 gift.trendingBadge === 'hot-deal' ? '💥' :
                 gift.trendingBadge === 'seasonal' ? '🎃' :
                 '⭐'}
              </span>
              {gift.trendingBadge === 'trending' ? 'TRENDING' :
               gift.trendingBadge === 'hot-deal' ? 'HOT DEAL' :
               gift.trendingBadge === 'seasonal' ? 'SEIZOEN' :
               'TOP RATED'}
            </span>
          )}
          
          {(!hideAmazonBadge) && gift.retailers && gift.retailers.length > 0 && gift.retailers.every(r => r.name.toLowerCase().includes('amazon')) && (
            <span className={`absolute top-3 bg-[#232F3E] text-white text-xs font-semibold px-2 py-1 rounded shadow-md tracking-wide ${gift.trendingBadge ? 'right-3' : 'left-3'}`}>
              Alleen Amazon
            </span>
          )}
          {!isReadOnly && (
            <button
              onClick={handleToggleFavorite}
              className="absolute top-3 right-3 bg-white/80 p-2 rounded-full text-accent hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={isFavorite ? 'Verwijder van favorieten' : 'Voeg toe aan favorieten'}
            >
              {isFavorite ? <HeartIconFilled className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
            </button>
          )}
        </div>
      )}

      {/* Add favorite button outside image section if no image */}
      {(!gift.imageUrl || gift.imageUrl.trim() === '') && !isReadOnly && (
        <div className="absolute top-3 right-3">
            <button
              onClick={handleToggleFavorite}
              className="bg-white/80 p-2 rounded-full text-accent hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={isFavorite ? 'Verwijder van favorieten' : 'Voeg toe aan favorieten'}
            >
            {isFavorite ? <HeartIconFilled className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
          </button>
        </div>
      )}

      <div className={`p-6 flex flex-col flex-grow ${candidateVariant ? 'items-center text-center' : ''}`}>
        {/* Compare Checkbox */}
        {onCompareToggle && !isReadOnly && !isEmbedded && (
          <div className="mb-3 flex items-center gap-2">
            <input
              type="checkbox"
              id={`compare-${gift.productName}`}
              checked={isInCompareList}
              onChange={() => onCompareToggle(gift)}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor={`compare-${gift.productName}`} className="text-sm text-gray-600 cursor-pointer">
              Vergelijk dit cadeau
            </label>
          </div>
        )}
        
        <h3 className={`font-display text-xl font-bold text-primary ${candidateVariant ? 'text-center' : ''}`}>{gift.productName}</h3>
        {gift.priceRange && (
            <p className={`mt-1 font-bold text-primary text-lg ${candidateVariant ? 'text-center' : ''}`}>{gift.priceRange}</p>
        )}
        
        {/* Match Reason Badge */}
        {gift.matchReason && (
          <div className="mt-3 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-secondary to-secondary/70 rounded-full border border-primary/10">
              <span className="text-lg">✨</span>
              <span className="text-xs font-semibold text-primary">{gift.matchReason}</span>
            </div>
          </div>
        )}

        {gift.retailerBadges && gift.retailerBadges.length > 0 && (
          <div className={`mt-3 flex flex-wrap gap-2 ${candidateVariant ? 'justify-center' : ''}`}>
            {gift.retailerBadges.map((badge, badgeIndex) => {
              const toneClass = badgeToneClasses[badge.tone] || badgeToneClasses.neutral;
              return (
                <span
                  key={`${badge.label}-${badgeIndex}`}
                  className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm border border-white/40 ${toneClass}`}
                  title={badge.description}
                >
                  {badge.label}
                </span>
              );
            })}
          </div>
        )}
        
        <p className={`mt-2 text-gray-600 ${candidateVariant ? 'flex-grow' : 'flex-grow'}`}>{gift.description}</p>

        {gift.story && (
          <p className={`mt-3 text-sm text-gray-500 italic ${candidateVariant ? 'text-center' : ''}`}>
            {gift.story}
          </p>
        )}
        
    {gift.retailers && gift.retailers.length > 0 && (
      <div className={`mt-6 space-y-2 ${candidateVariant ? 'w-full mt-auto' : ''}`}>
        {gift.retailers.map((retailer, i) => {
          const affiliateUrl = withAffiliate(retailer.affiliateLink);
          const handleClick = () => {
            const eventPayload = {
              event: 'affiliate_click',
              retailer: retailer.name,
              product: gift.productName,
              url: affiliateUrl,
              position: i,
              embedded: isEmbedded,
              candidateVariant,
              ts: Date.now()
            };
            // Console debug
            console.log('🛒 Affiliate click', eventPayload);
            // dataLayer push (GTM)
            // @ts-ignore
            window.dataLayer = window.dataLayer || [];
            // @ts-ignore
            window.dataLayer.push(eventPayload);
          };
          return (
            <a
              key={i}
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored nofollow"
              className="block"
              aria-label={`Bekijk ${gift.productName} bij ${retailer.name}`}
              onClick={handleClick}
            >
              <Button variant={i === 0 ? 'accent' : 'primary'} className="w-full">
                Bekijk bij {retailer.name}
              </Button>
            </a>
          );
        })}
      </div>
    )}

        {!isReadOnly && !isEmbedded && (
            <div className="mt-6 pt-4 border-t border-gray-200">
                <SocialShare 
                    item={gift} 
                    type="gift" 
                    variant="compact"
                    className="justify-center"
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default GiftResultCard;
