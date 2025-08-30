import React from 'react';
import { Gift } from '../types';
import GiftResultCard from './GiftResultCard';
import { GiftIcon } from './IconComponents';
import Button from './Button';

interface SharedFavoritesPageProps {
    gifts: Gift[];
    navigateToHome: () => void;
}

const SharedFavoritesPage: React.FC<SharedFavoritesPageProps> = ({ gifts, navigateToHome }) => {
  return (
    <div className="bg-light-bg font-sans text-gray-800 min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
            <div className="flex items-center justify-center space-x-2">
                <GiftIcon className="h-8 w-8 text-primary" />
                <span className="font-display text-2xl font-bold text-primary">Gifteez.nl</span>
            </div>
            <p className="mt-2 text-gray-600">Een gedeelde cadeaulijst</p>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gifts.map((gift, index) => (
                <GiftResultCard
                key={gift.productName}
                gift={gift}
                index={index}
                isReadOnly={true}
                />
            ))}
        </div>
        <div className="text-center mt-12">
            <Button onClick={navigateToHome} variant="primary">
                Terug naar de website
            </Button>
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Gifteez.nl</p>
      </footer>
    </div>
  );
};

export default SharedFavoritesPage;