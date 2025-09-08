import type React from 'react';
export type Page = 'home' | 'giftFinder' | 'categories' | 'blog' | 'favorites' | 'blogDetail' | 'contact' | 'about' | 'login' | 'signup' | 'account' | 'quiz' | 'download' | /* 'shop' | */ 'cart' | 'checkoutSuccess' | 'deals' | 'disclaimer' | 'privacy';

export type NavigateTo = (page: Page, data?: any) => void;

export type ShowToast = (message: string) => void;

export interface InitialGiftFinderData {
  recipient?: string;
  occasion?: string;
  interests?: string;
}

export interface Retailer {
  name: string;
  affiliateLink: string;
}

export interface Gift {
  productName: string;
  description: string;
  priceRange: string;
  retailers: Retailer[];
  imageUrl: string;
}

export interface Testimonial {
  quote: string;
  author: string;
}

export interface Author {
  name: string;
  avatarUrl: string;
}

// New specialized content block interfaces
export interface ComparisonTableRow {
  feature: string;
  values: string[];
}
export interface ComparisonTableBlock {
  type: 'comparisonTable';
  headers: string[];
  rows: ComparisonTableRow[];
}

export interface ProsConsBlock {
  type: 'prosCons';
  // Each item in the array represents a product column
  items: {
    title: string;
    pros: string[];
    cons: string[];
  }[];
}

export interface VerdictBlock {
  type: 'verdict';
  title: string;
  content: string;
}

export type ContentBlock = 
  | { type: 'heading'; content: string }
  | { type: 'paragraph'; content: string }
  | { type: 'gift'; content: Gift }
  | ComparisonTableBlock
  | ProsConsBlock
  | VerdictBlock;

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  author: Author;
  publishedDate: string;
  content: ContentBlock[];
}

export interface Category {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface GiftProfile {
  id: string;
  name: string;
  relationship: string;
  interests: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Should not be stored long term, but needed for simulation
    favorites: Gift[];
    profiles: GiftProfile[];
}

export interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User | null>;
    signup: (name: string, email: string, password: string) => Promise<User | null>;
    logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
    toggleFavorite: (gift: Gift) => void;
    isFavorite: (gift: Gift) => boolean;
    addProfile: (profileData: Omit<GiftProfile, 'id'>) => Promise<void>;
    updateProfile: (profile: GiftProfile) => Promise<void>;
    deleteProfile: (profileId: string) => Promise<void>;
}

export interface QuizAnswer {
  text: string;
  resultKey: string;
}

export interface QuizQuestion {
  id: number;
  text: string;
  answers: QuizAnswer[];
}

export interface QuizResult {
  title: string;
  description: string;
  recommendedInterests: string;
  relatedBlogSlugs: string[];
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    downloadUrl: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    itemCount: number;
}

export interface DealItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: string;
  affiliateLink: string;
}

export interface DealCategory {
  title: string;
  items: DealItem[];
}