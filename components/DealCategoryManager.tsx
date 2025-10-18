import React, { useState, useCallback, useEffect } from 'react';
import { DynamicProductService } from '../services/dynamicProductService';
import { DealCategoryConfigService, type CategoryBlockConfig } from '../services/dealCategoryConfigService';
import { DealItem } from '../types';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ImageWithFallback from './ImageWithFallback';
import {
  PlusIcon,
  TrashIcon,
  SparklesIcon,
  CheckIcon,
  XIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SearchIcon,
  FilterIcon
} from './IconComponents';
import ActivityLogService from '../services/activityLogService';
import { SmartSuggestionsService } from '../services/smartSuggestionsService';
import { useAuth } from '../contexts/AuthContext';
import TemplatePanel from './TemplatePanel';
import QuickActionsToolbar from './QuickActionsToolbar';
import { useUndoRedo } from '../hooks/useUndoRedo';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DealCategoryManagerProps {
  onSaved?: () => void;
}

const DealCategoryManager: React.FC<DealCategoryManagerProps> = ({ onSaved }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Undo/Redo state management for categories
  const {
    state: categories,
    setState: setCategories,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo<CategoryBlockConfig[]>([]);
  
  const [allProducts, setAllProducts] = useState<DealItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [giftScoreRange, setGiftScoreRange] = useState<[number, number]>([0, 10]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [onlyOnSale, setOnlyOnSale] = useState(false);
  
  // Templates
  const [showTemplates, setShowTemplates] = useState(false);

  // Load current configuration
  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        await DynamicProductService.loadProducts();
        const allDeals = DynamicProductService.getProducts()
          .filter((p: any) => p.giftScore && p.giftScore >= 6)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image || p.imageUrl,
            affiliateLink: p.affiliateLink,
            giftScore: p.giftScore,
            category: p.category,
            description: p.description || p.shortDescription
          }))
          .sort((a: any, b: any) => (b.giftScore || 0) - (a.giftScore || 0));

        setAllProducts(allDeals);

        const config = await DealCategoryConfigService.load();
        if (config && config.categories) {
          setCategories(config.categories);
        } else {
          // Initialize with default categories
          setCategories([
            { id: 'top-deals', title: 'Top Tech Gadgets', itemIds: [] },
            { id: 'kitchen', title: 'Beste Keukenaccessoires', itemIds: [] },
            { id: 'lifestyle', title: 'Populaire Lifestyle Producten', itemIds: [] }
          ]);
        }
      } catch (error) {
        console.error('Error loading:', error);
        setMessage({ type: 'error', text: 'Kon configuratie niet laden' });
      } finally {
        setLoading(false);
      }
    };

    void loadConfig();
  }, []);

  const handleAddCategory = () => {
    const newCategory: CategoryBlockConfig = {
      id: `category-${Date.now()}`,
      title: 'Nieuwe Categorie',
      itemIds: []
    };
    setCategories([...categories, newCategory]);
    setSelectedCategoryIndex(categories.length);
    
    // Log activity
    void ActivityLogService.logActivity(
      'category_created',
      `Nieuwe categorie aangemaakt: "${newCategory.title}"`,
      { categoryId: newCategory.id },
      currentUser?.email
    );
  };

  const handleDeleteCategory = (index: number) => {
    const categoryToDelete = categories[index];
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
    if (selectedCategoryIndex === index) {
      setSelectedCategoryIndex(null);
    }
    
    // Log activity
    void ActivityLogService.logActivity(
      'category_deleted',
      `Categorie verwijderd: "${categoryToDelete.title}"`,
      { categoryId: categoryToDelete.id, itemCount: categoryToDelete.itemIds.length },
      currentUser?.email
    );
  };

  const handleUpdateCategoryTitle = (index: number, title: string) => {
    const category = categories[index];
    const oldTitle = category.title;
    const newCategories = [...categories];
    newCategories[index] = { ...newCategories[index], title };
    setCategories(newCategories);
    
    // Log activity (only if title actually changed)
    if (oldTitle !== title) {
      void ActivityLogService.logActivity(
        'category_updated',
        `Categorienaam gewijzigd: "${oldTitle}" → "${title}"`,
        { categoryId: category.id },
        currentUser?.email
      );
    }
  };

  const handleAddProductToCategory = (categoryIndex: number, productId: string) => {
    const newCategories = [...categories];
    const category = newCategories[categoryIndex];
    if (!category.itemIds.includes(productId)) {
      category.itemIds = [...category.itemIds, productId];
      setCategories(newCategories);
      
      // Log activity
      const product = getProductById(productId);
      void ActivityLogService.logActivity(
        'product_added',
        `Product toegevoegd aan "${category.title}": ${product?.name || productId}`,
        { categoryId: category.id, productId },
        currentUser?.email
      );
    }
  };

  const handleRemoveProductFromCategory = (categoryIndex: number, productId: string) => {
    const newCategories = [...categories];
    const category = newCategories[categoryIndex];
    category.itemIds = category.itemIds.filter(id => id !== productId);
    setCategories(newCategories);
    
    // Log activity
    const product = getProductById(productId);
    void ActivityLogService.logActivity(
      'product_removed',
      `Product verwijderd uit "${category.title}": ${product?.name || productId}`,
      { categoryId: category.id, productId },
      currentUser?.email
    );
  };

  const handleMoveProduct = (categoryIndex: number, productIndex: number, direction: 'up' | 'down') => {
    const newCategories = [...categories];
    const category = newCategories[categoryIndex];
    const newIndex = direction === 'up' ? productIndex - 1 : productIndex + 1;
    
    if (newIndex >= 0 && newIndex < category.itemIds.length) {
      const items = [...category.itemIds];
      [items[productIndex], items[newIndex]] = [items[newIndex], items[productIndex]];
      category.itemIds = items;
      setCategories(newCategories);
    }
  };

  // Bulk Operations
  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const selectAllVisible = () => {
    const newSelection = new Set(selectedProducts);
    filteredProducts.forEach(product => newSelection.add(product.id));
    setSelectedProducts(newSelection);
  };

  const clearSelection = () => {
    setSelectedProducts(new Set());
  };

  const handleBulkAddToCategory = (categoryIndex: number) => {
    if (selectedProducts.size === 0) return;
    
    const newCategories = [...categories];
    const category = newCategories[categoryIndex];
    const newIds = Array.from(selectedProducts).filter((id: string) => !category.itemIds.includes(id));
    category.itemIds = [...category.itemIds, ...newIds] as string[];
    setCategories(newCategories);
    setMessage({ type: 'success', text: `✅ ${newIds.length} product${newIds.length > 1 ? 'en' : ''} toegevoegd!` });
    
    // Log bulk activity
    void ActivityLogService.logActivity(
      'products_bulk_added',
      `Bulk: ${newIds.length} product${newIds.length > 1 ? 'en' : ''} toegevoegd aan "${category.title}"`,
      { categoryId: category.id, productCount: newIds.length, productIds: newIds },
      currentUser?.email
    );
    
    clearSelection();
  };

  const handleBulkRemoveFromCategory = (categoryIndex: number) => {
    if (selectedProducts.size === 0) return;
    
    const newCategories = [...categories];
    const category = newCategories[categoryIndex];
    const idsToRemove = Array.from(selectedProducts);
    category.itemIds = category.itemIds.filter(id => !idsToRemove.includes(id));
    setCategories(newCategories);
    setMessage({ type: 'success', text: `✅ ${idsToRemove.length} product${idsToRemove.length > 1 ? 'en' : ''} verwijderd!` });
    
    // Log bulk activity
    void ActivityLogService.logActivity(
      'products_bulk_removed',
      `Bulk: ${idsToRemove.length} product${idsToRemove.length > 1 ? 'en' : ''} verwijderd uit "${category.title}"`,
      { categoryId: category.id, productCount: idsToRemove.length, productIds: idsToRemove },
      currentUser?.email
    );
    
    clearSelection();
  };

  const loadSuggestions = () => {
    if (selectedCategoryIndex === null) return;
    
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    
    try {
      const category = categories[selectedCategoryIndex];
      const productSuggestions = SmartSuggestionsService.getSuggestionsForCategory(
        category.title,
        category.itemIds,
        allProducts,
        15 // Max 15 suggestions
      );
      
      setSuggestions(productSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setMessage({ type: 'error', text: '❌ Kon geen suggesties laden' });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    // Check if we're dragging categories
    if (active.id.toString().startsWith('category-')) {
      const oldIndex = categories.findIndex(cat => cat.id === active.id);
      const newIndex = categories.findIndex(cat => cat.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newCategories = arrayMove(categories, oldIndex, newIndex);
        setCategories(newCategories);
        
        // Log activity
        void ActivityLogService.logActivity(
          'category_updated',
          `Categorie "${categories[oldIndex].title}" verplaatst van positie ${oldIndex + 1} naar ${newIndex + 1}`,
          { categoryId: categories[oldIndex].id, oldIndex, newIndex },
          currentUser?.email
        );
      }
    }
    // Check if we're dragging products within a category
    else if (selectedCategoryIndex !== null) {
      const category = categories[selectedCategoryIndex];
      const oldIndex = category.itemIds.indexOf(active.id as string);
      const newIndex = category.itemIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newCategories = [...categories];
        newCategories[selectedCategoryIndex] = {
          ...category,
          itemIds: arrayMove(category.itemIds, oldIndex, newIndex)
        };
        setCategories(newCategories);
        
        // Log activity
        const product = getProductById(active.id as string);
        void ActivityLogService.logActivity(
          'category_updated',
          `Product "${product?.name || active.id}" verplaatst in "${category.title}"`,
          { categoryId: category.id, productId: active.id, oldIndex, newIndex },
          currentUser?.email
        );
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const config = {
        categories,
        updatedAt: new Date().toISOString(),
        version: 1
      };
      
      await DealCategoryConfigService.save(config);
      setMessage({ type: 'success', text: '✅ Configuratie succesvol opgeslagen!' });
      
      // Log save activity
      const totalProducts = categories.reduce((sum, cat) => sum + cat.itemIds.length, 0);
      void ActivityLogService.logActivity(
        'config_saved',
        `Deal configuratie opgeslagen: ${categories.length} categorieën, ${totalProducts} producten`,
        { categoryCount: categories.length, totalProducts },
        currentUser?.email
      );
      
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: '❌ Kon configuratie niet opslaan' });
    } finally {
      setSaving(false);
    }
  };

  const getProductById = (id: string): DealItem | undefined => {
    return allProducts.find(p => p.id === id);
  };
  
  // Template handlers
  const handleApplyTemplate = (templateCategories: CategoryBlockConfig[], mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setCategories(templateCategories);
      void ActivityLogService.logActivity(
        'category_created',
        `Template toegepast: ${templateCategories.length} categorieën vervangen`,
        { categoryCount: templateCategories.length },
        currentUser?.email
      );
    } else {
      // Merge mode: add template categories without duplicates
      const existingIds = new Set(categories.map(c => c.id));
      const newCategories = templateCategories.filter(c => !existingIds.has(c.id));
      setCategories([...categories, ...newCategories]);
      void ActivityLogService.logActivity(
        'category_created',
        `Template toegevoegd: ${newCategories.length} nieuwe categorieën`,
        { categoryCount: newCategories.length },
        currentUser?.email
      );
    }
    setShowTemplates(false);
  };

  // Advanced filtering
  const filteredProducts = allProducts.filter(product => {
    // Text search
    if (searchQuery.length > 0) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }
    
    // Price range filter
    const priceStr = typeof product.price === 'string' ? product.price : String(product.price || '0');
    const productPrice = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    if (!isNaN(productPrice) && (productPrice < priceRange[0] || productPrice > priceRange[1])) {
      return false;
    }
    
    // Gift score filter
    const giftScore = product.giftScore || 0;
    if (giftScore < giftScoreRange[0] || giftScore > giftScoreRange[1]) {
      return false;
    }
    
    // Tags filter
    if (selectedTags.size > 0) {
      const productTags = product.tags || [];
      const hasMatchingTag = productTags.some(tag => selectedTags.has(tag));
      if (!hasMatchingTag) return false;
    }
    
    // On sale filter
    if (onlyOnSale && !product.isOnSale) {
      return false;
    }
    
    return true;
  });

  // Get all unique tags from products
  const allTags = Array.from(new Set(allProducts.flatMap(p => p.tags || [])))
    .sort();

  if (loading) {
    return <LoadingSpinner message="Configuratie laden..." />;
  }

  return (
    <>
      {/* Quick Actions Toolbar */}
      <QuickActionsToolbar
        onSave={handleSave}
        onUndo={undo}
        onRedo={redo}
        onSearch={() => {
          const searchInput = document.querySelector('input[type="text"][placeholder*="Zoek"]') as HTMLInputElement;
          searchInput?.focus();
        }}
        onQuickAdd={handleAddCategory}
        canUndo={canUndo}
        canRedo={canRedo}
        isSaving={saving}
      />
      
      <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Deal Categorieën Beheren</h2>
            <p className="text-sm text-gray-600 mt-1">Sleep om volgorde te wijzigen • Voeg producten toe aan categorieën</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowTemplates(true)}
          >
            📦 Templates
          </Button>
          <Button
            variant={bulkMode ? 'primary' : 'secondary'}
            onClick={() => {
              setBulkMode(!bulkMode);
              if (bulkMode) clearSelection();
            }}
          >
            {bulkMode ? '✅ Bulk Mode' : '☑️ Bulk Mode'}
          </Button>
          <Button
            variant="secondary"
            onClick={handleAddCategory}
            leftIcon={<PlusIcon className="h-4 w-4" />}
          >
            Nieuwe Categorie
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            leftIcon={saving ? <SparklesIcon className="h-4 w-4 animate-spin" /> : <CheckIcon className="h-4 w-4" />}
          >
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {bulkMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-blue-900">
                {selectedProducts.size} geselecteerd
              </span>
              <Button variant="secondary" size="sm" onClick={selectAllVisible}>
                Selecteer alle zichtbare
              </Button>
              <Button variant="secondary" size="sm" onClick={clearSelection}>
                Wis selectie
              </Button>
            </div>
            {selectedProducts.size > 0 && selectedCategoryIndex !== null && (
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleBulkAddToCategory(selectedCategoryIndex)}
                >
                  ➕ Voeg {selectedProducts.size} toe aan categorie
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleBulkRemoveFromCategory(selectedCategoryIndex)}
                >
                  🗑️ Verwijder {selectedProducts.size} uit categorie
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Categorieën ({categories.length})</h3>
            <span className="text-xs text-gray-500">☰ Sleep om volgorde te wijzigen</span>
          </div>
          
          {categories.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
              <SparklesIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Nog geen categorieën. Klik op "Nieuwe Categorie" om te beginnen.</p>
            </div>
          ) : (
            <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {categories.map((category, categoryIndex) => (
                  <SortableCategory
                    key={category.id}
                    category={category}
                    index={categoryIndex}
                    isSelected={selectedCategoryIndex === categoryIndex}
                    onSelect={() => setSelectedCategoryIndex(
                      selectedCategoryIndex === categoryIndex ? null : categoryIndex
                    )}
                    onUpdateTitle={(title) => handleUpdateCategoryTitle(categoryIndex, title)}
                    onDelete={() => handleDeleteCategory(categoryIndex)}
                    allProducts={allProducts}
                    onRemoveProduct={(productId) => handleRemoveProductFromCategory(categoryIndex, productId)}
                    onMoveProduct={(productIndex, direction) => handleMoveProduct(categoryIndex, productIndex, direction)}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>

        {/* Right: Product Browser */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Beschikbare Producten ({allProducts.length})</h3>
              {selectedCategoryIndex !== null && (
                <button
                  onClick={loadSuggestions}
                  disabled={loadingSuggestions}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                >
                  <SparklesIcon className="h-4 w-4" />
                  {loadingSuggestions ? 'Laden...' : 'Smart Suggesties'}
                </button>
              )}
            </div>
            
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Zoek producten..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFilters || selectedTags.size > 0 || onlyOnSale
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FilterIcon className="h-4 w-4" />
                Filters
                {(selectedTags.size > 0 || onlyOnSale) && (
                  <span className="ml-1 bg-white text-rose-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {selectedTags.size + (onlyOnSale ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Geavanceerde Filters</h4>
                <button
                  onClick={() => {
                    setPriceRange([0, 500]);
                    setGiftScoreRange([0, 10]);
                    setSelectedTags(new Set());
                    setOnlyOnSale(false);
                  }}
                  className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                >
                  Reset filters
                </button>
              </div>

              {/* Price Range Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prijs: €{priceRange[0]} - €{priceRange[1]}
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Gift Score Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gift Score: {giftScoreRange[0]} - {giftScoreRange[1]}
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={giftScoreRange[0]}
                    onChange={(e) => setGiftScoreRange([parseFloat(e.target.value), giftScoreRange[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={giftScoreRange[1]}
                    onChange={(e) => setGiftScoreRange([giftScoreRange[0], parseFloat(e.target.value)])}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Tags Multi-Select */}
              {allTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags ({selectedTags.size} geselecteerd)
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          const newTags = new Set(selectedTags);
                          if (newTags.has(tag)) {
                            newTags.delete(tag);
                          } else {
                            newTags.add(tag);
                          }
                          setSelectedTags(newTags);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedTags.has(tag)
                            ? 'bg-rose-500 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-rose-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* On Sale Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Alleen producten in de aanbieding
                </label>
                <button
                  onClick={() => setOnlyOnSale(!onlyOnSale)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    onlyOnSale ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      onlyOnSale ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Results Count */}
              <div className="pt-2 border-t border-gray-300">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{filteredProducts.length}</span> producten gevonden
                </p>
              </div>
            </div>
          )}

          {/* Smart Suggestions Panel */}
          {showSuggestions && selectedCategoryIndex !== null && (
            <div className="border border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Smart Suggesties</h4>
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                    {suggestions.length} gevonden
                  </span>
                </div>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              {loadingSuggestions ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner message="AI analyseert producten..." />
                </div>
              ) : suggestions.length === 0 ? (
                <p className="text-center text-purple-700 py-4">
                  Geen suggesties gevonden. Probeer de categorienaam aan te passen.
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {suggestions.map((suggestion) => {
                    const product = suggestion.product;
                    const isInCategory = categories[selectedCategoryIndex].itemIds.includes(product.id);
                    
                    return (
                      <div
                        key={product.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          isInCategory 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-purple-200 bg-white'
                        }`}
                      >
                        <ImageWithFallback
                          src={product.image || ''}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-600">{product.price}</span>
                            <span className="text-xs font-semibold text-purple-600">
                              Score: {Math.round(suggestion.score)}%
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {suggestion.reasons.map((reason: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                        {!isInCategory && (
                          <button
                            onClick={() => {
                              handleAddProductToCategory(selectedCategoryIndex, product.id);
                              setMessage({ type: 'success', text: '✅ Product toegevoegd!' });
                            }}
                            className="flex-shrink-0 p-2 text-purple-600 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                          >
                            <PlusIcon className="h-5 w-5" />
                          </button>
                        )}
                        {isInCategory && (
                          <span className="flex-shrink-0 text-green-600 bg-green-100 px-3 py-1 rounded-lg text-xs font-medium">
                            ✓ Toegevoegd
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {selectedCategoryIndex === null ? (
            <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
              <SparklesIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Selecteer een categorie om producten toe te voegen</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredProducts.map((product) => {
                const isInCategory = categories[selectedCategoryIndex].itemIds.includes(product.id);
                const isSelected = selectedProducts.has(product.id);
                
                return (
                  <div
                    key={product.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200'
                        : isInCategory 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {bulkMode && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-5 h-5 text-rose-600 rounded border-gray-300 focus:ring-rose-500"
                      />
                    )}
                    <ImageWithFallback
                      src={product.image || ''}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-600">€{product.price}</p>
                        <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-700 rounded">
                          Score: {product.giftScore}
                        </span>
                      </div>
                    </div>
                    {!bulkMode && (
                      <button
                        onClick={() => 
                          isInCategory
                            ? handleRemoveProductFromCategory(selectedCategoryIndex, product.id)
                            : handleAddProductToCategory(selectedCategoryIndex, product.id)
                        }
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          isInCategory
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-rose-500 text-white hover:bg-rose-600'
                        }`}
                      >
                        {isInCategory ? 'Verwijder' : 'Toevoegen'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      </div>
      
      {/* Template Panel */}
      {showTemplates && (
        <TemplatePanel
          currentCategories={categories}
          onApplyTemplate={handleApplyTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </DndContext>
    </>
  );
};

// Sortable Category Item Component
interface SortableCategoryProps {
  category: CategoryBlockConfig;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
  allProducts: DealItem[];
  onRemoveProduct: (productId: string) => void;
  onMoveProduct: (productIndex: number, direction: 'up' | 'down') => void;
}

const SortableCategory: React.FC<SortableCategoryProps> = ({
  category,
  index,
  isSelected,
  onSelect,
  onUpdateTitle,
  onDelete,
  allProducts,
  onRemoveProduct,
  onMoveProduct,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-lg border-2 transition-all cursor-move ${
        isSelected
          ? 'border-rose-500 bg-rose-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      } ${isDragging ? 'shadow-lg z-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onSelect}
          className="flex-1 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-400">☰</span>
            <input
              type="text"
              value={category.title}
              onChange={(e) => {
                e.stopPropagation();
                onUpdateTitle(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 font-medium text-gray-900 bg-transparent border-none focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            {category.itemIds.length} product{category.itemIds.length !== 1 ? 'en' : ''}
          </p>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
      
      {/* Expanded Products with Drag & Drop */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-gray-300" onClick={(e) => e.stopPropagation()}>
          {category.itemIds.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Nog geen producten toegevoegd</p>
          ) : (
            <SortableContext items={category.itemIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {category.itemIds.map((productId, productIndex) => {
                  const product = allProducts.find(p => p.id === productId);
                  if (!product) return null;
                  
                  return (
                    <SortableProduct
                      key={product.id}
                      product={product}
                      categoryIndex={index}
                      onRemove={() => onRemoveProduct(product.id)}
                      onMoveUp={productIndex > 0 ? () => onMoveProduct(productIndex, 'up') : undefined}
                      onMoveDown={productIndex < category.itemIds.length - 1 ? () => onMoveProduct(productIndex, 'down') : undefined}
                    />
                  );
                })}
              </div>
            </SortableContext>
          )}
        </div>
      )}
    </div>
  );
};

// Sortable Product Item Component
interface SortableProductProps {
  product: DealItem;
  categoryIndex: number;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  showMoveButtons?: boolean;
}

const SortableProduct: React.FC<SortableProductProps> = ({
  product,
  onRemove,
  onMoveUp,
  onMoveDown,
  showMoveButtons = true,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 border rounded-lg bg-white cursor-move ${
        isDragging ? 'shadow-lg border-rose-300 z-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      {...attributes}
      {...listeners}
    >
      <span className="text-gray-400 flex-shrink-0">☰</span>
      <ImageWithFallback
        src={product.image || ''}
        alt={product.name}
        className="w-12 h-12 object-cover rounded"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-600">{product.price}</span>
          {product.giftScore && (
            <span className="text-xs text-rose-600 font-semibold">⭐ {product.giftScore}/10</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {showMoveButtons && (
          <>
            {onMoveUp && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp();
                }}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              >
                <ArrowUpIcon className="h-4 w-4" />
              </button>
            )}
            {onMoveDown && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown();
                }}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              >
                <ArrowDownIcon className="h-4 w-4" />
              </button>
            )}
          </>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default DealCategoryManager;
