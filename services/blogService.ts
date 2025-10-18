import { db, firebaseEnabled } from './firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { blogPosts as staticBlogPosts } from '../data/blogData';
import type { BlogPost, ContentBlock } from '../types';

const LOCAL_STORAGE_KEY = 'gifteez_blog_posts_v1';
const DELETED_POSTS_KEY = 'gifteez_deleted_blog_posts';
const hasWindow = typeof window !== 'undefined';
const staticSlugSet = new Set(staticBlogPosts.map((post) => post.slug));

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date) && !(value instanceof Timestamp);

const sanitizeForFirestore = <T>(value: T): T => {
  if (value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeForFirestore(item))
      .filter((item) => item !== undefined) as unknown as T;
  }

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    Object.entries(value).forEach(([key, val]) => {
      if (val === undefined) {
        return;
      }
      const sanitized = sanitizeForFirestore(val);
      if (sanitized !== undefined) {
        if (isPlainObject(sanitized) && Object.keys(sanitized).length === 0) {
          return;
        }
        result[key] = sanitized;
      }
    });

    return result as unknown as T;
  }

  return value;
};

type LocalBlogPost = BlogPostData & { id: string };

const convertBlockToText = (block: any): string => {
  if (!block) return '';
  switch (block.type) {
    case 'heading':
      return `## ${block.content ?? ''}`;
    case 'paragraph':
      return block.content ?? '';
    case 'gift':
      if (!block.content) return '';
      return `Gift: ${block.content.productName ?? ''} — ${block.content.description ?? ''}`;
    case 'verdict':
      return `Verdict ${block.title ? `(${block.title})` : ''}: ${block.content ?? ''}`;
    case 'faq':
      if (!block.items) return '';
      return block.items
        .map((item: any) => `Q: ${item.question ?? ''}\nA: ${item.answer ?? ''}`)
        .join('\n\n');
    default:
      if (typeof block.content === 'string') {
        return block.content;
      }
      try {
        return JSON.stringify(block);
      } catch {
        return '';
      }
  }
};

const convertStaticPost = (post: BlogPost): LocalBlogPost => ({
  id: post.slug,
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  content: post.content?.map(convertBlockToText).filter(Boolean).join('\n\n') ?? '',
  imageUrl: post.imageUrl,
  category: post.category,
  tags: post.tags,
  author: post.author,
  publishedDate: post.publishedDate,
  isDraft: false,
  createdAt: undefined,
  updatedAt: undefined,
  seo: undefined,
  contentBlocks: post.content as ContentBlock[] | undefined,
});

const syncLocalPostsWithStatic = (posts: LocalBlogPost[]): { posts: LocalBlogPost[]; changed: boolean } => {
  let changed = false;
  const deletedSlugs = getDeletedPostSlugs();

  const filtered = posts.filter((post) => {
    const isStaticSeed = post.id === post.slug;
    if (isStaticSeed && !staticSlugSet.has(post.slug)) {
      changed = true;
      return false;
    }
    return true;
  });

  staticBlogPosts.forEach((staticPost) => {
    // Skip if this post was explicitly deleted by user
    if (deletedSlugs.has(staticPost.slug)) {
      console.log(`[BlogService] Skipping deleted post: ${staticPost.slug}`);
      return;
    }

    const staticSeed = convertStaticPost(staticPost);
    const index = filtered.findIndex((post) => post.slug === staticPost.slug && post.id === post.slug);

    if (index === -1) {
      filtered.push(staticSeed);
      changed = true;
      return;
    }

    const existing = filtered[index];
    const serialisedExisting = JSON.stringify({
      slug: existing.slug,
      title: existing.title,
      excerpt: existing.excerpt,
      content: existing.content,
      imageUrl: existing.imageUrl,
      category: existing.category,
      author: existing.author,
      publishedDate: existing.publishedDate,
      isDraft: existing.isDraft,
      contentBlocks: existing.contentBlocks,
    });

    const serialisedSeed = JSON.stringify({
      slug: staticSeed.slug,
      title: staticSeed.title,
      excerpt: staticSeed.excerpt,
      content: staticSeed.content,
      imageUrl: staticSeed.imageUrl,
      category: staticSeed.category,
      author: staticSeed.author,
      publishedDate: staticSeed.publishedDate,
      isDraft: staticSeed.isDraft,
      contentBlocks: staticSeed.contentBlocks,
    });

    if (serialisedExisting !== serialisedSeed) {
      filtered[index] = staticSeed;
      changed = true;
    }
  });

  filtered.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

  return { posts: filtered, changed };
};

const writeLocalPosts = (posts: LocalBlogPost[]) => {
  if (!hasWindow) return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.warn('Kon lokale blogposts niet opslaan:', error);
  }
};

// Track deleted posts to prevent re-syncing from static data
const getDeletedPostSlugs = (): Set<string> => {
  if (!hasWindow) return new Set();
  try {
    const stored = window.localStorage.getItem(DELETED_POSTS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch (error) {
    console.warn('Kon verwijderde posts niet lezen:', error);
    return new Set();
  }
};

const addDeletedPostSlug = (slug: string): void => {
  if (!hasWindow) return;
  try {
    const deleted = getDeletedPostSlugs();
    deleted.add(slug);
    window.localStorage.setItem(DELETED_POSTS_KEY, JSON.stringify([...deleted]));
  } catch (error) {
    console.warn('Kon verwijderde post niet opslaan:', error);
  }
};

const removeDeletedPostSlug = (slug: string): void => {
  if (!hasWindow) return;
  try {
    const deleted = getDeletedPostSlugs();
    deleted.delete(slug);
    window.localStorage.setItem(DELETED_POSTS_KEY, JSON.stringify([...deleted]));
  } catch (error) {
    console.warn('Kon verwijderde post niet verwijderen uit tracking:', error);
  }
};

const readLocalPosts = (): LocalBlogPost[] => {
  if (!hasWindow) {
    return staticBlogPosts.map(convertStaticPost);
  }

  let parsed: LocalBlogPost[] = [];
  let raw: string | null = null;

  try {
    raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const candidate = JSON.parse(raw) as LocalBlogPost[];
      if (Array.isArray(candidate)) {
        parsed = candidate;
      }
    }
  } catch (error) {
    console.warn('Kon lokale blogposts niet lezen:', error);
  }

  const { posts, changed } = syncLocalPostsWithStatic(parsed);

  if (changed || !raw) {
    writeLocalPosts(posts);
  }

  return posts;
};

const ensureLocalPosts = (): LocalBlogPost[] => {
  return readLocalPosts();
};

const generateLocalId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export interface BlogPostData {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  category: string;
  tags?: string[];
  author: {
    name: string;
    avatarUrl?: string;
  };
  publishedDate: string;
  isDraft: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  contentBlocks?: ContentBlock[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    canonicalUrl?: string;
  };
}

class BlogService {
  private static COLLECTION = 'blog-posts';
  private static get useFirestore() {
    return firebaseEnabled && Boolean(db);
  }

  /**
   * Get all blog posts (published only by default)
   */
  static async getPosts(includeDrafts = false): Promise<BlogPostData[]> {
    if (this.useFirestore && db) {
      try {
        const snapshot = await getDocs(
          query(collection(db, this.COLLECTION), orderBy('publishedDate', 'desc'))
        );

        const posts = snapshot.docs.map((doc) => this.documentToPost(doc));
        const filtered = includeDrafts ? posts : posts.filter((post) => !post.isDraft);

        if (filtered.length > 0) {
          return filtered;
        }

        const fallback = ensureLocalPosts();
        return fallback
          .filter((post) => includeDrafts || !post.isDraft)
          .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        throw new Error('Failed to fetch blog posts');
      }
    }

    const posts = ensureLocalPosts();
    return posts
      .filter((post) => includeDrafts || !post.isDraft)
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  }

  /**
   * Get a single blog post by slug
   */
  static async getPostBySlug(slug: string): Promise<BlogPostData | null> {
    if (this.useFirestore && db) {
      try {
        const q = query(
          collection(db, this.COLLECTION),
          where('slug', '==', slug)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          const fallbackMatch = ensureLocalPosts().find((post) => post.slug === slug);
          return fallbackMatch ?? null;
        }

        return this.documentToPost(snapshot.docs[0]);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        throw new Error('Failed to fetch blog post');
      }
    }

    const posts = ensureLocalPosts();
    return posts.find(post => post.slug === slug) ?? null;
  }

  /**
   * Get a single blog post by ID
   */
  static async getPostById(id: string): Promise<BlogPostData | null> {
    if (this.useFirestore && db) {
      try {
        const docRef = doc(db, this.COLLECTION, id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          const fallbackMatch = ensureLocalPosts().find((post) => post.id === id || post.slug === id);
          return fallbackMatch ?? null;
        }

        return this.documentToPost(docSnap as QueryDocumentSnapshot<DocumentData>);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        throw new Error('Failed to fetch blog post');
      }
    }

    const posts = ensureLocalPosts();
    return posts.find(post => post.id === id) ?? null;
  }

  /**
   * Create a new blog post
   */
  static async createPost(postData: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (this.useFirestore && db) {
      try {
        // Ensure slug is unique
        const existingPost = await this.getPostBySlug(postData.slug);
        if (existingPost) {
          throw new Error('A post with this slug already exists');
        }

        const now = Timestamp.now();
        const docData = sanitizeForFirestore({
          ...postData,
          createdAt: now,
          updatedAt: now
        });

        const docRef = await addDoc(collection(db, this.COLLECTION), docData);
        return docRef.id;
      } catch (error: any) {
        console.error('Error creating blog post:', error);
        throw new Error(error.message || 'Failed to create blog post');
      }
    }

    const posts = ensureLocalPosts();
    if (posts.some(post => post.slug === postData.slug)) {
      throw new Error('A post with this slug already exists');
    }
    const newId = generateLocalId();
    const now = new Date().toISOString();
    const newPost: LocalBlogPost = {
      ...postData,
      id: newId,
      createdAt: undefined,
      updatedAt: undefined,
      publishedDate: postData.publishedDate || now,
    };
  const updatedList = [newPost, ...posts].sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  writeLocalPosts(updatedList);
    return newId;
  }

  /**
   * Update an existing blog post
   */
  static async updatePost(id: string, postData: Partial<BlogPostData>): Promise<void> {
    if (this.useFirestore && db) {
      try {
        const docRef = doc(db, this.COLLECTION, id);
        
        // Check if slug is being changed and ensure it's unique
        if (postData.slug) {
          const existingPost = await this.getPostBySlug(postData.slug);
          if (existingPost && existingPost.id !== id) {
            throw new Error('A post with this slug already exists');
          }
        }

        const updateData = sanitizeForFirestore({
          ...postData,
          updatedAt: Timestamp.now()
        });

        await updateDoc(docRef, updateData);
        return;
      } catch (error: any) {
        console.error('Error updating blog post:', error);
        throw new Error(error.message || 'Failed to update blog post');
      }
    }

    const posts = ensureLocalPosts();
    const index = posts.findIndex(post => post.id === id);
    if (index === -1) {
      throw new Error('Post niet gevonden');
    }
    const current = posts[index];
    if (postData.slug && posts.some(post => post.slug === postData.slug && post.id !== id)) {
      throw new Error('A post with this slug already exists');
    }
    const updated: LocalBlogPost = {
      ...current,
      ...postData,
      id,
    };
  const copy = [...posts];
  copy[index] = updated;
  copy.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  writeLocalPosts(copy);
  }

  /**
   * Delete a blog post
   */
  static async deletePost(id: string): Promise<void> {
    // First get the slug before deleting
    let slug: string | undefined;
    
    if (this.useFirestore && db) {
      try {
        const docRef = doc(db, this.COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          slug = docSnap.data().slug;
        }
        await deleteDoc(docRef);
        
        // Track deletion to prevent re-sync from static data
        if (slug) {
          addDeletedPostSlug(slug);
          console.log(`[BlogService] Added ${slug} to deleted posts tracking`);
        }
        return;
      } catch (error) {
        console.error('[BlogService] Error deleting blog post from Firestore:', error);
        throw new Error('Failed to delete blog post from Firestore');
      }
    }

    const posts = ensureLocalPosts();
    const postToDelete = posts.find(post => post.id === id);
    if (postToDelete) {
      slug = postToDelete.slug;
    }
    
    const filtered = posts.filter(post => post.id !== id);
    filtered.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
    writeLocalPosts(filtered);
    
    // Track deletion to prevent re-sync from static data
    if (slug) {
      addDeletedPostSlug(slug);
      console.log(`[BlogService] Added ${slug} to deleted posts tracking`);
    }
  }

  /**
   * Generate a slug from a title
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Publish a draft post
   */
  static async publishPost(id: string): Promise<void> {
    await this.updatePost(id, {
      isDraft: false,
      publishedDate: new Date().toISOString()
    });
  }

  /**
   * Convert Firestore document to BlogPostData
   */
  private static documentToPost(doc: QueryDocumentSnapshot<DocumentData>): BlogPostData {
    const data = doc.data();
    return {
      id: doc.id,
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      imageUrl: data.imageUrl,
      category: data.category,
  tags: data.tags,
      author: data.author,
      publishedDate: data.publishedDate,
      isDraft: data.isDraft || false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      seo: data.seo
    };
  }

  /**
   * Get posts by category
   */
  static async getPostsByCategory(category: string): Promise<BlogPostData[]> {
    if (this.useFirestore && db) {
      try {
        const snapshot = await getDocs(
          query(collection(db, this.COLLECTION), orderBy('publishedDate', 'desc'))
        );
        const posts = snapshot.docs.map((doc) => this.documentToPost(doc));
        return posts.filter((post) => post.category === category && !post.isDraft);
      } catch (error) {
        console.error('Error fetching posts by category:', error);
        throw new Error('Failed to fetch posts by category');
      }
    }

    const posts = ensureLocalPosts();
    return posts
      .filter(post => post.category === category && !post.isDraft)
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  }
}

export default BlogService;