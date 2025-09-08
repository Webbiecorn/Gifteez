import React from 'react';
import { Category, NavigateTo } from '../types';
import { HeartIcon, SnowflakeIcon, CakeIcon, GiftIcon } from './IconComponents';

interface CategoriesPageProps {
  navigateTo: NavigateTo;
}

const categories: Category[] = [
  { name: 'Valentijnsdag', icon: HeartIcon },
  { name: 'Verjaardag', icon: CakeIcon },
  { name: 'Kerstmis', icon: SnowflakeIcon },
  { name: 'Zomaar', icon: GiftIcon },
];

const CategoryCard: React.FC<{ category: Category; onClick: () => void }> = ({ category, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center justify-center text-center cursor-pointer
               group hover:bg-secondary transition-all duration-300 transform hover:-translate-y-1"
  >
    <category.icon className="w-16 h-16 text-primary mb-4 group-hover:text-blue-600 transition-colors duration-300" />
    <h3 className="font-display text-xl font-bold text-primary">{category.name === 'Zomaar' ? 'Zomaar een cadeau' : category.name}</h3>
  </div>
);

const CategoriesPage: React.FC<CategoriesPageProps> = ({ navigateTo }) => {
  const handleCategoryClick = (categoryName: string) => {
    // This pre-fills the occasion in the GiftFinder
    navigateTo('giftFinder', { occasion: categoryName });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-bold text-primary">Cadeau Categorieën</h1>
        <p className="mt-2 text-lg text-gray-600">Vind inspiratie voor elke speciale gelegenheid.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {categories.map((category) => (
          <CategoryCard key={category.name} category={category} onClick={() => handleCategoryClick(category.name)} />
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;