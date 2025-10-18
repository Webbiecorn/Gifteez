
import React, { useState, useEffect, useContext } from 'react';
import { Gift, NavigateTo, ShowToast } from '../types';
import GiftResultCard from './GiftResultCard';
import Button from './Button';
import { HeartIcon, ShareIcon } from './IconComponents';
import { AuthContext } from '../contexts/AuthContext';

interface FavoritesPageProps {
  navigateTo: NavigateTo;
  showToast: ShowToast;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ navigateTo, showToast }) => {
  const [favorites, setFavorites] = useState<Gift[]>([]);
  const auth = useContext(AuthContext);
  
  useEffect(() => {
    if (auth?.currentUser) {
        setFavorites(auth.currentUser.favorites);
    } else {
        setFavorites([]);
    }
  }, [auth?.currentUser]);

  const handleFavoriteChange = (productName: string, isNowFavorite: boolean) => {
    if (!isNowFavorite) {
      setFavorites(currentFavorites => 
        currentFavorites.filter(gift => gift.productName !== productName)
      );
    }
  };
  
  const handleShare = () => {
    if(navigator.clipboard && favorites.length > 0) {
      const jsonString = JSON.stringify(favorites);
      const encoded = btoa(encodeURIComponent(jsonString));
      const url = `${window.location.origin}?favorites=${encoded}`;
      navigator.clipboard.writeText(url).then(() => {
        showToast("Deelbare link gekopieerd!");
      }).catch(err => {
        console.error("Could not copy text: ", err);
        showToast("Kopiëren mislukt");
      });
    } else {
      showToast("Browser wordt niet ondersteund of geen favorieten om te delen.");
    }
  };

  const NotLoggedInMessage = () => (
    <div className="text-center py-12 bg-white rounded-lg shadow-md animate-fade-in">
        <HeartIcon className="w-24 h-24 text-gray-300 mx-auto" />
        <h3 className="mt-4 font-display text-2xl font-bold text-primary">Log in om je favorieten op te slaan</h3>
        <p className="mt-2 text-gray-600 max-w-md mx-auto">Maak een gratis account aan om je favoriete cadeaus op te slaan en overal te bekijken.</p>
        <div className="mt-6 flex justify-center gap-4">
            <Button variant="accent" onClick={() => navigateTo('login')}>
                Inloggen
            </Button>
            <Button variant="primary" onClick={() => navigateTo('signup')}>
                Registreren
            </Button>
        </div>
    </div>
  );

  const EmptyFavoritesMessage = () => (
     <div className="text-center py-12 bg-white rounded-lg shadow-md animate-fade-in">
        <HeartIcon className="w-24 h-24 text-gray-300 mx-auto" />
        <h3 className="mt-4 font-display text-2xl font-bold text-primary">Je hebt nog geen favorieten.</h3>
        <p className="mt-2 text-gray-600 max-w-md mx-auto">
          Gebruik de GiftFinder of bekijk de trending deals om het perfecte cadeau te vinden. 
          Klik op het hartje om het hier op te slaan!
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" onClick={() => navigateTo('giftFinder')}>
            🎁 Start GiftFinder
          </Button>
          <Button variant="accent" onClick={() => navigateTo('deals')}>
            🔥 Bekijk Deals
          </Button>
          <Button variant="secondary" onClick={() => navigateTo('quiz')}>
            ❓ Doe de Quiz
          </Button>
        </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-6">
        <h1 className="font-display text-4xl font-bold text-primary">Mijn Opgeslagen Favorieten</h1>
        <p className="mt-2 text-lg text-gray-600">Jouw persoonlijke lijst met de beste cadeau-ideeën.</p>
      </div>

      {favorites.length > 0 && (
        <div className="text-center mb-12">
            <Button onClick={handleShare} variant="primary">
                <div className="flex items-center gap-2">
                    <ShareIcon className="w-5 h-5" />
                    <span>Deel je lijst</span>
                </div>
            </Button>
        </div>
      )}
      
  {!auth?.currentUser ? (
        <NotLoggedInMessage />
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((gift, index) => (
            <GiftResultCard 
              key={`${gift.productName}-${index}`}
              gift={gift} 
              index={index}
              onFavoriteChange={handleFavoriteChange}
              showToast={showToast}
            />
          ))}
        </div>
      ) : (
        <EmptyFavoritesMessage />
      )}
    </div>
  );
};

export default FavoritesPage;
