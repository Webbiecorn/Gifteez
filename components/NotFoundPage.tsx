import React from 'react';
import { NavigateTo } from '../types';

interface NotFoundPageProps { navigateTo: NavigateTo; }

const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigateTo }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-28 text-center">
      <h1 className="font-display text-6xl font-bold text-primary mb-6">404</h1>
      <p className="text-gray-600 text-lg mb-10">De pagina die je zoekt bestaat niet (meer). Controleer het adres of ga terug naar een van onze populaire secties.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={() => navigateTo('home')} className="px-8 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition">Home</button>
        <button onClick={() => navigateTo('giftFinder')} className="px-8 py-3 rounded-full bg-secondary text-primary font-bold hover:bg-secondary/80 transition">GiftFinder</button>
        <button onClick={() => navigateTo('blog')} className="px-8 py-3 rounded-full bg-secondary text-primary font-bold hover:bg-secondary/80 transition">Blogs</button>
        <button onClick={() => navigateTo('deals')} className="px-8 py-3 rounded-full bg-secondary text-primary font-bold hover:bg-secondary/80 transition">Deals</button>
      </div>
    </div>
  );
};

export default NotFoundPage;
