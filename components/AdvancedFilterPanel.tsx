import React, { useState } from 'react';
import { AdvancedFilters } from '../types';
import { FilterIcon, ChevronDownIcon, ChevronUpIcon } from './IconComponents';

interface AdvancedFilterPanelProps {
  filters: Partial<AdvancedFilters>;
  onFiltersChange: (filters: Partial<AdvancedFilters>) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  filters,
  onFiltersChange,
  isVisible,
  onToggle
}) => {
  const categories = [
    'Elektronica', 'Mode & Accessoires', 'Boeken & Media', 'Sport & Fitness',
    'Huis & Tuin', 'Voeding & Drinken', 'Wellness & Beauty', 'Hobby & Vrije tijd',
    'Reizen & Ervaringen', 'Kunst & Cultuur'
  ];

  const ageGroups = [
    '0-2 jaar', '3-5 jaar', '6-12 jaar', '13-17 jaar',
    '18-25 jaar', '26-35 jaar', '36-50 jaar', '50+ jaar'
  ];

  const updateFilter = <K extends keyof AdvancedFilters>(
    key: K,
    value: AdvancedFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleCategory = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    updateFilter('categories', newCategories);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-secondary/10 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <FilterIcon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Geavanceerde Filters</h3>
          {Object.keys(filters).length > 0 && (
            <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
              {Object.keys(filters).length}
            </span>
          )}
        </div>
        {isVisible ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isVisible && (
        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Prijsbereik (€)
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => updateFilter('priceRange', {
                    ...filters.priceRange,
                    min: parseInt(e.target.value) || 0,
                    max: filters.priceRange?.max || 1000
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <span className="text-gray-500">-</span>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange?.max || ''}
                  onChange={(e) => updateFilter('priceRange', {
                    min: filters.priceRange?.min || 0,
                    max: parseInt(e.target.value) || 1000
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Categorieën
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {categories.map(category => (
                <label
                  key={category}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-2"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories?.includes(category) || false}
                    onChange={() => toggleCategory(category)}
                    className="rounded border-gray-300 text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Gift Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type Cadeau
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'physical', label: 'Fysiek product' },
                { value: 'experience', label: 'Ervaring' },
                { value: 'digital', label: 'Digitaal' },
                { value: 'subscription', label: 'Abonnement' }
              ].map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-2"
                >
                  <input
                    type="radio"
                    name="giftType"
                    value={option.value}
                    checked={filters.giftType === option.value}
                    onChange={(e) => updateFilter('giftType', e.target.value as any)}
                    className="text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Delivery Speed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Leveringssnelheid
            </label>
            <select
              value={filters.deliverySpeed || 'standard'}
              onChange={(e) => updateFilter('deliverySpeed', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="standard">Standaard (3-5 dagen)</option>
              <option value="fast">Snel (1-2 dagen)</option>
              <option value="instant">Direct beschikbaar</option>
            </select>
          </div>

          {/* Age Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Leeftijdsgroep
            </label>
            <select
              value={filters.ageGroup || ''}
              onChange={(e) => updateFilter('ageGroup', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Alle leeftijden</option>
              {ageGroups.map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Geslacht
            </label>
            <div className="flex gap-4">
              {[
                { value: 'unisex', label: 'Unisex' },
                { value: 'male', label: 'Mannelijk' },
                { value: 'female', label: 'Vrouwelijk' }
              ].map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={filters.gender === option.value}
                    onChange={(e) => updateFilter('gender', e.target.value as any)}
                    className="text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Speciale kenmerken
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.sustainability || false}
                  onChange={(e) => updateFilter('sustainability', e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-gray-700">Duurzaam</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.personalization || false}
                  onChange={(e) => updateFilter('personalization', e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-gray-700">Personaliseerbaar</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.preferredPartner === 'sustainable'}
                  onChange={(e) => {
                    const nextFilters = { ...filters };
                    if (e.target.checked) {
                      nextFilters.preferredPartner = 'sustainable';
                    } else {
                      delete nextFilters.preferredPartner;
                    }
                    onFiltersChange(nextFilters);
                  }}
                  className="rounded border-gray-300 text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-gray-700">
                  Voorkeur voor duurzame partner (Shop Like You Give A Damn)
                </span>
              </label>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onFiltersChange({})}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Filters wissen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterPanel;
