
import React, { useState, useEffect, useContext } from 'react';
import { Gift, ShowToast } from '../types';
import Button from './Button';
import { withAffiliate } from '../services/affiliate';
import { FacebookIcon, TwitterIcon, WhatsAppIcon, HeartIcon, HeartIconFilled } from './IconComponents';
import { AuthContext } from '../contexts/AuthContext';
import ImageWithFallback from './ImageWithFallback';

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
}

const GiftResultCard: React.FC<GiftResultCardProps> = ({
  gift,
  index,
  onFavoriteChange,
  showToast,
  isReadOnly = false,
  isEmbedded = false,
  imageHeightClass = 'h-48',
  imageFit = 'cover',
  hideAmazonBadge = false,
  candidateVariant = false,
}) => {
  const auth = useContext(AuthContext);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

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
        showToast?.('Cadeau opgeslagen!');
    }
    onFavoriteChange?.(gift.productName, isNowFavorite);
  };

  const shareText = `Leuke cadeautip gevonden op Gifteez.nl: ${gift.productName}`;
  const encodedShareText = encodeURIComponent(shareText);
  const mainUrl = gift.retailers?.[0]?.affiliateLink || window.location.href;
  const encodedUrl = encodeURIComponent(mainUrl);

  const socialLinks = [
    { name: 'Facebook', icon: FacebookIcon, url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'Twitter', icon: TwitterIcon, url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedShareText}` },
    { name: 'WhatsApp', icon: WhatsAppIcon, url: `https://api.whatsapp.com/send?text=${encodedShareText}%20${encodedUrl}` }
  ];
  
  const containerClasses = isEmbedded
    ? "bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
    : "bg-white rounded-lg shadow-lg overflow-hidden flex flex-col opacity-0 animate-fade-in-up";

  const imageContainerHeight = candidateVariant ? 'h-40 md:h-44' : imageHeightClass;

  return (
    <div
      className={containerClasses + ' h-full'}
      style={!isEmbedded ? { animationDelay: `${index * 100}ms` } : {}}
    >
      <div className={`relative ${candidateVariant ? imageContainerHeight + ' flex items-center justify-center bg-white p-4' : ''}`}>
        {candidateVariant ? (
          <ImageWithFallback
            src={gift.imageUrl}
            alt={gift.productName}
            className="max-h-full max-w-full w-auto h-auto mx-auto"
            fit={imageFit}
          />
        ) : (
          <ImageWithFallback src={gift.imageUrl} alt={gift.productName} className={`w-full ${imageContainerHeight} bg-white`} fit={imageFit} />
        )}
  {(!hideAmazonBadge) && gift.retailers && gift.retailers.length > 0 && gift.retailers.every(r => r.name.toLowerCase().includes('amazon')) && (
          <span className="absolute top-3 left-3 bg-[#232F3E] text-white text-xs font-semibold px-2 py-1 rounded shadow-md tracking-wide">
            Alleen Amazon
          </span>
        )}
        {!isReadOnly && (
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 bg-white/80 p-2 rounded-full text-blue-600 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label={isFavorite ? 'Verwijder van favorieten' : 'Voeg toe aan favorieten'}
          >
            {isFavorite ? <HeartIconFilled className="w-6 h-6" /> : <HeartIcon className="w-6 h-6" />}
          </button>
        )}
      </div>
      <div className={`p-6 flex flex-col flex-grow ${candidateVariant ? 'items-center text-center' : ''}`}>
        <h3 className={`font-display text-xl font-bold text-primary ${candidateVariant ? 'text-center' : ''}`}>{gift.productName}</h3>
        {gift.priceRange && (
            <p className={`mt-1 font-bold text-primary text-lg ${candidateVariant ? 'text-center' : ''}`}>{gift.priceRange}</p>
        )}
        <p className={`mt-2 text-gray-600 ${candidateVariant ? 'flex-grow' : 'flex-grow'}`}>{gift.description}</p>
        
    {gift.retailers && gift.retailers.length > 0 && (
      <div className={`mt-6 space-y-2 ${candidateVariant ? 'w-full mt-auto' : ''}`}>
        {gift.retailers.map((retailer, i) => (
                    <a 
                      key={i} 
          href={withAffiliate(retailer.affiliateLink)} 
                      target="_blank" 
          rel="noopener noreferrer sponsored nofollow" 
                      className="block"
                      aria-label={`Bekijk ${gift.productName} bij ${retailer.name}`}
                    >
                        <Button variant={i === 0 ? "accent" : "primary"} className="w-full">
                            Bekijk bij {retailer.name}
                        </Button>
                    </a>
                ))}
            </div>
        )}

        {!isReadOnly && !isEmbedded && (
            <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-center text-sm font-bold text-primary mb-2">Deel deze tip!</p>
            <div className="flex justify-center space-x-4">
                {socialLinks.map(social => (
                <a 
                    key={social.name}
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={`Share ${gift.productName} on ${social.name}`}
                    className="text-gray-500 hover:text-primary transition-colors"
                >
                    <social.icon className="w-6 h-6" />
                </a>
                ))}
            </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default GiftResultCard;
