import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, firebaseEnabled } from './firebase';
import { CategoryBlockConfig } from './dealCategoryConfigService';

export interface CategoryTemplate {
  id?: string;
  name: string;
  description: string;
  icon: string;
  categories: CategoryBlockConfig[];
  isPrebuilt: boolean;
  createdAt: Date;
  createdBy?: string;
}

const COLLECTION_NAME = 'categoryTemplates';
const LOCAL_STORAGE_KEY = 'gifteez_templates_v1';

/**
 * Pre-built templates for common occasions
 */
export const PREBUILT_TEMPLATES: Omit<CategoryTemplate, 'id' | 'createdAt'>[] = [
  {
    name: 'Kerst Collectie',
    description: 'Perfecte cadeaus voor de feestdagen',
    icon: '🎄',
    isPrebuilt: true,
    categories: [
      {
        id: 'kerst-tech',
        title: 'Tech Cadeaus voor Kerst',
        itemIds: []
      },
      {
        id: 'kerst-lifestyle',
        title: 'Lifestyle & Wonen',
        itemIds: []
      },
      {
        id: 'kerst-kids',
        title: 'Cadeaus voor Kinderen',
        itemIds: []
      }
    ]
  },
  {
    name: 'Verjaardag Specials',
    description: 'Top verjaardagscadeaus per leeftijd',
    icon: '🎂',
    isPrebuilt: true,
    categories: [
      {
        id: 'verjaardag-18-30',
        title: 'Voor 18-30 jaar',
        itemIds: []
      },
      {
        id: 'verjaardag-30-50',
        title: 'Voor 30-50 jaar',
        itemIds: []
      },
      {
        id: 'verjaardag-50plus',
        title: 'Voor 50+ jaar',
        itemIds: []
      }
    ]
  },
  {
    name: 'Valentijn Romantiek',
    description: 'Romantische cadeaus voor Valentijnsdag',
    icon: '💝',
    isPrebuilt: true,
    categories: [
      {
        id: 'valentijn-hem',
        title: 'Cadeaus voor Hem',
        itemIds: []
      },
      {
        id: 'valentijn-haar',
        title: 'Cadeaus voor Haar',
        itemIds: []
      },
      {
        id: 'valentijn-samen',
        title: 'Cadeaus voor Samen',
        itemIds: []
      }
    ]
  },
  {
    name: 'Moederdag & Vaderdag',
    description: 'Attente cadeaus voor ouders',
    icon: '👨‍👩‍👧',
    isPrebuilt: true,
    categories: [
      {
        id: 'moederdag',
        title: 'Moederdag Cadeaus',
        itemIds: []
      },
      {
        id: 'vaderdag',
        title: 'Vaderdag Cadeaus',
        itemIds: []
      }
    ]
  },
  {
    name: 'Afstuderen & Diploma',
    description: 'Cadeaus voor studenten en starters',
    icon: '🎓',
    isPrebuilt: true,
    categories: [
      {
        id: 'afstuderen-praktisch',
        title: 'Praktische Cadeaus',
        itemIds: []
      },
      {
        id: 'afstuderen-leuk',
        title: 'Leuke & Originele Cadeaus',
        itemIds: []
      }
    ]
  },
  {
    name: 'Housewarming',
    description: 'Cadeaus voor een nieuwe woning',
    icon: '🏠',
    isPrebuilt: true,
    categories: [
      {
        id: 'housewarming-keuken',
        title: 'Keuken & Eten',
        itemIds: []
      },
      {
        id: 'housewarming-wonen',
        title: 'Wonen & Decoratie',
        itemIds: []
      }
    ]
  }
];

export class TemplateService {
  /**
   * Get all templates (prebuilt + custom)
   */
  static async getAllTemplates(): Promise<CategoryTemplate[]> {
    const templates: CategoryTemplate[] = [];
    
    // Add prebuilt templates
    const prebuilt = PREBUILT_TEMPLATES.map(t => ({
      ...t,
      id: `prebuilt-${t.name.toLowerCase().replace(/\s+/g, '-')}`,
      createdAt: new Date('2025-01-01') // Fixed date for prebuilt
    }));
    templates.push(...prebuilt);
    
    // Try to load custom templates from Firebase
    if (firebaseEnabled && db) {
      try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        snapshot.forEach(doc => {
          const data = doc.data();
          templates.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            icon: data.icon,
            categories: data.categories,
            isPrebuilt: false,
            createdAt: data.createdAt?.toDate() || new Date(),
            createdBy: data.createdBy
          });
        });
      } catch (error) {
        console.error('Error loading templates from Firebase:', error);
      }
    }
    
    // Fallback to localStorage
    const localTemplates = this.getLocalTemplates();
    const customLocal = localTemplates.filter(t => !t.isPrebuilt);
    templates.push(...customLocal);
    
    // Remove duplicates by id
    const uniqueTemplates = templates.reduce((acc, template) => {
      if (!acc.find(t => t.id === template.id)) {
        acc.push(template);
      }
      return acc;
    }, [] as CategoryTemplate[]);
    
    return uniqueTemplates;
  }
  
  /**
   * Save a custom template
   */
  static async saveTemplate(
    template: Omit<CategoryTemplate, 'id' | 'createdAt' | 'isPrebuilt'>,
    userId?: string
  ): Promise<string> {
    const newTemplate: Omit<CategoryTemplate, 'id'> = {
      ...template,
      isPrebuilt: false,
      createdAt: new Date(),
      createdBy: userId
    };
    
    // Try Firebase first
    if (firebaseEnabled && db) {
      try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
          name: newTemplate.name,
          description: newTemplate.description,
          icon: newTemplate.icon,
          categories: newTemplate.categories,
          isPrebuilt: false,
          createdAt: Timestamp.now(),
          createdBy: userId
        });
        return docRef.id;
      } catch (error) {
        console.error('Error saving template to Firebase:', error);
      }
    }
    
    // Fallback to localStorage
    const templates = this.getLocalTemplates();
    const id = `custom-${Date.now()}`;
    templates.push({ ...newTemplate, id });
    this.saveLocalTemplates(templates);
    return id;
  }
  
  /**
   * Delete a custom template
   */
  static async deleteTemplate(templateId: string): Promise<void> {
    // Don't allow deleting prebuilt templates
    if (templateId.startsWith('prebuilt-')) {
      throw new Error('Cannot delete prebuilt templates');
    }
    
    // Try Firebase first
    if (firebaseEnabled && db && !templateId.startsWith('custom-')) {
      try {
        await deleteDoc(doc(db, COLLECTION_NAME, templateId));
        return;
      } catch (error) {
        console.error('Error deleting template from Firebase:', error);
      }
    }
    
    // Fallback to localStorage
    const templates = this.getLocalTemplates();
    const filtered = templates.filter(t => t.id !== templateId);
    this.saveLocalTemplates(filtered);
  }
  
  /**
   * Export template as JSON
   */
  static exportTemplate(template: CategoryTemplate): string {
    return JSON.stringify(template, null, 2);
  }
  
  /**
   * Import template from JSON
   */
  static importTemplate(json: string): Omit<CategoryTemplate, 'id' | 'createdAt' | 'isPrebuilt'> {
    const template = JSON.parse(json);
    return {
      name: template.name || 'Geïmporteerd Template',
      description: template.description || '',
      icon: template.icon || '📦',
      categories: template.categories || [],
      createdBy: template.createdBy
    };
  }
  
  /**
   * Get templates from localStorage
   */
  private static getLocalTemplates(): CategoryTemplate[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return [];
      
      const templates = JSON.parse(stored);
      return templates.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt)
      }));
    } catch (error) {
      console.error('Error reading templates from localStorage:', error);
      return [];
    }
  }
  
  /**
   * Save templates to localStorage
   */
  private static saveLocalTemplates(templates: CategoryTemplate[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving templates to localStorage:', error);
    }
  }
}

export default TemplateService;
