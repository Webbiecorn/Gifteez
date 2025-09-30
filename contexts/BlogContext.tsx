import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import BlogService, { BlogPostData } from '../services/blogService';
import { blogPostDataListToBlogPosts, blogPostDataToBlogPost } from '../services/blogMapper';
import type { BlogPost } from '../types';

interface BlogContextValue {
  posts: BlogPost[];
  rawPosts: BlogPostData[];
  loading: boolean;
  error: Error | null;
  refresh: (options?: { includeDrafts?: boolean }) => Promise<void>;
  findPostBySlug: (slug: string) => BlogPost | undefined;
  findRawPostBySlug: (slug: string) => BlogPostData | undefined;
}

const BlogContext = createContext<BlogContextValue | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawPosts, setRawPosts] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async (options?: { includeDrafts?: boolean }) => {
    setLoading(true);
    try {
      const data = await BlogService.getPosts(options?.includeDrafts ?? false);
      setRawPosts(data);
      setError(null);
    } catch (err) {
      console.error('Kon blogposts niet laden:', err);
      setError(err instanceof Error ? err : new Error('Onbekende fout bij laden van blogposts'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const posts = useMemo(
    () => blogPostDataListToBlogPosts(rawPosts.filter((post) => !post.isDraft)),
    [rawPosts]
  );

  const findRawPostBySlug = useCallback(
    (slug: string) => rawPosts.find((post) => post.slug === slug),
    [rawPosts]
  );

  const findPostBySlug = useCallback(
    (slug: string) => {
      const rawPost = findRawPostBySlug(slug);
      return rawPost ? blogPostDataToBlogPost(rawPost) : undefined;
    },
    [findRawPostBySlug]
  );

  const value = useMemo<BlogContextValue>(
    () => ({ posts, rawPosts, loading, error, refresh, findPostBySlug, findRawPostBySlug }),
    [posts, rawPosts, loading, error, refresh, findPostBySlug, findRawPostBySlug]
  );

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export const useBlogContext = (): BlogContextValue => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlogContext moet binnen een BlogProvider worden gebruikt');
  }
  return context;
};
