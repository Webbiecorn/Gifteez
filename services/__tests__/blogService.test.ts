import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import BlogService, { type BlogPostData } from '../blogService'
import * as firebaseModule from '../firebase'

// Mock Firebase modules
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
    })),
  },
}))

vi.mock('../firebase', () => ({
  db: {},
  firebaseEnabled: false,
}))

vi.mock('../../data/blogData', () => ({
  blogPosts: [
    {
      slug: 'static-post-1',
      title: 'Static Post 1',
      excerpt: 'First static post',
      content: [{ type: 'paragraph', content: 'Content for static post 1' }],
      imageUrl: 'https://example.com/static1.jpg',
      category: 'Gifts',
      tags: ['static'],
      author: { name: 'Static Author' },
      publishedDate: '2024-01-01T00:00:00.000Z',
    },
    {
      slug: 'static-post-2',
      title: 'Static Post 2',
      excerpt: 'Second static post',
      content: [{ type: 'heading', content: 'Heading' }],
      imageUrl: 'https://example.com/static2.jpg',
      category: 'Tips',
      tags: ['static', 'tips'],
      author: { name: 'Static Author' },
      publishedDate: '2024-01-02T00:00:00.000Z',
    },
  ],
}))

describe('blogService', () => {
  let cryptoSpy: any
  let uuidCounter = 0

  beforeEach(() => {
    localStorage.clear()

    // Reset Firebase mocks
    vi.clearAllMocks()
    vi.mocked(firebaseModule).firebaseEnabled = false

    // Mock crypto.randomUUID with unique IDs
    uuidCounter = 0
    cryptoSpy = vi
      .spyOn(crypto, 'randomUUID')
      .mockImplementation(() => `test-uuid-${++uuidCounter}` as any)
  })

  afterEach(() => {
    localStorage.clear()
    cryptoSpy?.mockRestore()
  })

  describe('getPosts', () => {
    it('should return static posts from localStorage when no custom posts exist', async () => {
      const posts = await BlogService.getPosts()

      expect(posts).toHaveLength(2)
      expect(posts[0].slug).toBe('static-post-2') // Newest first
      expect(posts[1].slug).toBe('static-post-1')
    })

    it('should filter out draft posts by default', async () => {
      const draftPost = {
        id: 'draft-1',
        slug: 'draft-post',
        title: 'Draft Post',
        excerpt: 'Draft excerpt',
        content: 'Draft content',
        category: 'Gifts',
        author: { name: 'Author' },
        publishedDate: '2024-06-01T00:00:00.000Z',
        isDraft: true,
      }

      localStorage.setItem(
        'gifteez_blog_posts_v1',
        JSON.stringify([
          draftPost,
          {
            id: 'static-post-1',
            slug: 'static-post-1',
            title: 'Static Post 1',
            excerpt: 'First static post',
            content: 'Content for static post 1',
            category: 'Gifts',
            tags: ['static'],
            author: { name: 'Static Author' },
            publishedDate: '2024-01-01T00:00:00.000Z',
            isDraft: false,
          },
        ])
      )

      const posts = await BlogService.getPosts(false)

      expect(posts).toHaveLength(2) // Only published posts + static-post-2
      expect(posts.some((p) => p.slug === 'draft-post')).toBe(false)
    })

    it('should include draft posts when includeDrafts is true', async () => {
      const draftPost = {
        id: 'draft-1',
        slug: 'draft-post',
        title: 'Draft Post',
        excerpt: 'Draft excerpt',
        content: 'Draft content',
        category: 'Gifts',
        author: { name: 'Author' },
        publishedDate: '2024-06-01T00:00:00.000Z',
        isDraft: true,
      }

      localStorage.setItem(
        'gifteez_blog_posts_v1',
        JSON.stringify([
          draftPost,
          {
            id: 'static-post-1',
            slug: 'static-post-1',
            title: 'Static Post 1',
            excerpt: 'First static post',
            content: 'Content for static post 1',
            category: 'Gifts',
            tags: ['static'],
            author: { name: 'Static Author' },
            publishedDate: '2024-01-01T00:00:00.000Z',
            isDraft: false,
          },
        ])
      )

      const posts = await BlogService.getPosts(true)

      expect(posts.length).toBeGreaterThanOrEqual(3) // Draft + published
      expect(posts.some((p) => p.slug === 'draft-post')).toBe(true)
    })

    it('should sort posts by publishedDate descending', async () => {
      localStorage.setItem(
        'gifteez_blog_posts_v1',
        JSON.stringify([
          {
            id: 'post-3',
            slug: 'post-3',
            title: 'Post 3',
            excerpt: 'Excerpt 3',
            content: 'Content 3',
            category: 'Gifts',
            author: { name: 'Author' },
            publishedDate: '2024-03-01T00:00:00.000Z',
            isDraft: false,
          },
          {
            id: 'post-1',
            slug: 'post-1',
            title: 'Post 1',
            excerpt: 'Excerpt 1',
            content: 'Content 1',
            category: 'Gifts',
            author: { name: 'Author' },
            publishedDate: '2024-01-01T00:00:00.000Z',
            isDraft: false,
          },
        ])
      )

      const posts = await BlogService.getPosts()

      // Should be sorted newest first
      expect(new Date(posts[0].publishedDate).getTime()).toBeGreaterThan(
        new Date(posts[1].publishedDate).getTime()
      )
    })
  })

  describe('getPostBySlug', () => {
    it('should return a post matching the slug', async () => {
      const post = await BlogService.getPostBySlug('static-post-1')

      expect(post).not.toBeNull()
      expect(post?.slug).toBe('static-post-1')
      expect(post?.title).toBe('Static Post 1')
    })

    it('should return null for non-existent slug', async () => {
      const post = await BlogService.getPostBySlug('non-existent-slug')

      expect(post).toBeNull()
    })

    it('should find custom posts from localStorage', async () => {
      localStorage.setItem(
        'gifteez_blog_posts_v1',
        JSON.stringify([
          {
            id: 'custom-1',
            slug: 'custom-post',
            title: 'Custom Post',
            excerpt: 'Custom excerpt',
            content: 'Custom content',
            category: 'Gifts',
            author: { name: 'Author' },
            publishedDate: '2024-05-01T00:00:00.000Z',
            isDraft: false,
          },
        ])
      )

      const post = await BlogService.getPostBySlug('custom-post')

      expect(post).not.toBeNull()
      expect(post?.slug).toBe('custom-post')
      expect(post?.title).toBe('Custom Post')
    })
  })

  describe('getPostById', () => {
    it('should return a post matching the ID', async () => {
      localStorage.setItem(
        'gifteez_blog_posts_v1',
        JSON.stringify([
          {
            id: 'test-id-123',
            slug: 'test-post',
            title: 'Test Post',
            excerpt: 'Test excerpt',
            content: 'Test content',
            category: 'Gifts',
            author: { name: 'Author' },
            publishedDate: '2024-05-01T00:00:00.000Z',
            isDraft: false,
          },
        ])
      )

      const post = await BlogService.getPostById('test-id-123')

      expect(post).not.toBeNull()
      expect(post?.id).toBe('test-id-123')
      expect(post?.title).toBe('Test Post')
    })

    it('should return null for non-existent ID', async () => {
      const post = await BlogService.getPostById('non-existent-id')

      expect(post).toBeNull()
    })

    it('should match static post by slug when ID equals slug', async () => {
      const post = await BlogService.getPostById('static-post-1')

      expect(post).not.toBeNull()
      expect(post?.slug).toBe('static-post-1')
    })
  })

  describe('createPost', () => {
    it('should create a new post in localStorage', async () => {
      const newPostData: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: 'new-post',
        title: 'New Post',
        excerpt: 'New excerpt',
        content: 'New content',
        category: 'Gifts',
        author: { name: 'Test Author' },
        publishedDate: '2024-05-15T00:00:00.000Z',
        isDraft: false,
      }

      const postId = await BlogService.createPost(newPostData)

      expect(postId).toMatch(/^test-uuid-\d+$/)

      const posts = await BlogService.getPosts()
      const createdPost = posts.find((p) => p.slug === 'new-post')

      expect(createdPost).toBeDefined()
      expect(createdPost?.title).toBe('New Post')
      expect(createdPost?.id).toBe(postId)
    })

    it('should throw error if slug already exists', async () => {
      const newPostData: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: 'static-post-1', // Already exists
        title: 'Duplicate Post',
        excerpt: 'Duplicate excerpt',
        content: 'Duplicate content',
        category: 'Gifts',
        author: { name: 'Author' },
        publishedDate: '2024-05-15T00:00:00.000Z',
        isDraft: false,
      }

      await expect(BlogService.createPost(newPostData)).rejects.toThrow(
        'A post with this slug already exists'
      )
    })

    it('should generate local ID when crypto.randomUUID is unavailable', async () => {
      // Mock crypto.randomUUID to be undefined (not a function)
      cryptoSpy.mockRestore()
      const originalRandomUUID = crypto.randomUUID
      Object.defineProperty(crypto, 'randomUUID', {
        value: undefined,
        configurable: true,
      })

      const newPostData: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: 'fallback-id-post',
        title: 'Fallback ID Post',
        excerpt: 'Fallback excerpt',
        content: 'Fallback content',
        category: 'Gifts',
        author: { name: 'Author' },
        publishedDate: '2024-05-15T00:00:00.000Z',
        isDraft: false,
      }

      const postId = await BlogService.createPost(newPostData)

      expect(postId).toMatch(/^local-\d+-[a-z0-9]+$/)

      const post = await BlogService.getPostById(postId)
      expect(post).not.toBeNull()
      expect(post?.slug).toBe('fallback-id-post')

      // Restore
      Object.defineProperty(crypto, 'randomUUID', {
        value: originalRandomUUID,
        configurable: true,
      })
    })
  })

  describe('updatePost', () => {
    it('should update an existing post', async () => {
      // Create a post first
      const newPostData: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: 'update-test',
        title: 'Original Title',
        excerpt: 'Original excerpt',
        content: 'Original content',
        category: 'Gifts',
        author: { name: 'Author' },
        publishedDate: '2024-05-15T00:00:00.000Z',
        isDraft: false,
      }

      const postId = await BlogService.createPost(newPostData)

      // Update the post
      await BlogService.updatePost(postId, {
        title: 'Updated Title',
        excerpt: 'Updated excerpt',
      })

      const updatedPost = await BlogService.getPostById(postId)

      expect(updatedPost?.title).toBe('Updated Title')
      expect(updatedPost?.excerpt).toBe('Updated excerpt')
      expect(updatedPost?.content).toBe('Original content') // Unchanged
    })

    it('should throw error when updating non-existent post', async () => {
      await expect(
        BlogService.updatePost('non-existent-id', { title: 'New Title' })
      ).rejects.toThrow('Post niet gevonden')
    })

    it('should throw error when changing slug to existing slug', async () => {
      // Try to update a post to use a static post slug
      const post1: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: 'unique-update-test',
        title: 'Update Test',
        excerpt: 'Excerpt',
        content: 'Content',
        category: 'Gifts',
        author: { name: 'Author' },
        publishedDate: '2024-05-15T00:00:00.000Z',
        isDraft: false,
      }

      const id1 = await BlogService.createPost(post1)

      // Try to update to static-post-1 slug (already exists from static data)
      await expect(BlogService.updatePost(id1, { slug: 'static-post-1' })).rejects.toThrow(
        'A post with this slug already exists'
      )
    })

    it('should allow updating slug to the same value', async () => {
      const postData: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: 'same-slug',
        title: 'Test Post',
        excerpt: 'Excerpt',
        content: 'Content',
        category: 'Gifts',
        author: { name: 'Author' },
        publishedDate: '2024-05-15T00:00:00.000Z',
        isDraft: false,
      }

      const postId = await BlogService.createPost(postData)

      // Update with same slug should not throw
      await expect(
        BlogService.updatePost(postId, { slug: 'same-slug', title: 'New Title' })
      ).resolves.not.toThrow()

      const post = await BlogService.getPostById(postId)
      expect(post?.title).toBe('New Title')
      expect(post?.slug).toBe('same-slug')
    })
  })

  describe('deletePost', () => {
    it('should delete a post from localStorage', async () => {
      // Create a post
      const postData: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: 'to-delete',
        title: 'To Delete',
        excerpt: 'Will be deleted',
        content: 'Content',
        category: 'Gifts',
        author: { name: 'Author' },
        publishedDate: '2024-05-15T00:00:00.000Z',
        isDraft: false,
      }

      const postId = await BlogService.createPost(postData)

      // Delete the post
      await BlogService.deletePost(postId)

      const deletedPost = await BlogService.getPostById(postId)
      expect(deletedPost).toBeNull()
    })

    it('should track deleted post slug to prevent re-sync', async () => {
      const postData: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: 'tracked-delete',
        title: 'Tracked Delete',
        excerpt: 'Will track deletion',
        content: 'Content',
        category: 'Gifts',
        author: { name: 'Author' },
        publishedDate: '2024-05-15T00:00:00.000Z',
        isDraft: false,
      }

      const postId = await BlogService.createPost(postData)
      await BlogService.deletePost(postId)

      // Check that slug is in deleted tracking
      const deletedSlugs = localStorage.getItem('gifteez_deleted_blog_posts')
      expect(deletedSlugs).toBeTruthy()
      const parsed = JSON.parse(deletedSlugs!)
      expect(parsed).toContain('tracked-delete')
    })

    it('should not throw error when deleting non-existent post', async () => {
      // Should silently succeed
      await expect(BlogService.deletePost('non-existent-id')).resolves.not.toThrow()
    })

    it('should prevent re-syncing of deleted static posts', async () => {
      // Get initial posts (should include static-post-1)
      let posts = await BlogService.getPosts()
      const hasStaticPost1Before = posts.some((p) => p.slug === 'static-post-1')
      expect(hasStaticPost1Before).toBe(true)

      // Delete static-post-1
      const staticPost = posts.find((p) => p.slug === 'static-post-1')
      await BlogService.deletePost(staticPost!.id!)

      // Clear cache and re-fetch
      localStorage.removeItem('gifteez_blog_posts_v1')
      posts = await BlogService.getPosts()

      // static-post-1 should NOT reappear
      const hasStaticPost1After = posts.some((p) => p.slug === 'static-post-1')
      expect(hasStaticPost1After).toBe(false)
    })
  })

  describe('generateSlug', () => {
    it('should convert title to lowercase slug', () => {
      const slug = BlogService.generateSlug('Hello World')
      expect(slug).toBe('hello-world')
    })

    it('should replace spaces with hyphens', () => {
      const slug = BlogService.generateSlug('Multiple   Spaces')
      expect(slug).toBe('multiple-spaces')
    })

    it('should remove special characters', () => {
      const slug = BlogService.generateSlug('Title! With @Special #Characters$')
      expect(slug).toBe('title-with-special-characters')
    })

    it('should remove leading and trailing hyphens', () => {
      const slug = BlogService.generateSlug('  Leading and Trailing  ')
      expect(slug).toBe('leading-and-trailing')
    })

    it('should handle underscores', () => {
      const slug = BlogService.generateSlug('Title_With_Underscores')
      expect(slug).toBe('title-with-underscores')
    })

    it('should handle empty string', () => {
      const slug = BlogService.generateSlug('')
      expect(slug).toBe('')
    })
  })

  describe('publishPost', () => {
    it('should publish a draft post', async () => {
      const draftData: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: 'draft-to-publish',
        title: 'Draft Post',
        excerpt: 'Draft excerpt',
        content: 'Draft content',
        category: 'Gifts',
        author: { name: 'Author' },
        publishedDate: '2024-05-15T00:00:00.000Z',
        isDraft: true,
      }

      const postId = await BlogService.createPost(draftData)

      // Check it's a draft
      let post = await BlogService.getPostById(postId)
      expect(post?.isDraft).toBe(true)

      // Publish it
      await BlogService.publishPost(postId)

      // Check it's now published
      post = await BlogService.getPostById(postId)
      expect(post?.isDraft).toBe(false)
      // publishedDate should be updated to now
      const publishedDate = new Date(post!.publishedDate)
      const now = new Date()
      expect(publishedDate.getTime()).toBeGreaterThan(now.getTime() - 5000) // Within 5 seconds
    })
  })

  describe('getPostsByCategory', () => {
    it('should return only posts from specified category', async () => {
      localStorage.setItem(
        'gifteez_blog_posts_v1',
        JSON.stringify([
          {
            id: 'gifts-1',
            slug: 'gifts-1',
            title: 'Gifts Post 1',
            excerpt: 'Excerpt',
            content: 'Content',
            category: 'Gifts',
            author: { name: 'Author' },
            publishedDate: '2024-05-01T00:00:00.000Z',
            isDraft: false,
          },
          {
            id: 'tips-1',
            slug: 'tips-1',
            title: 'Tips Post 1',
            excerpt: 'Excerpt',
            content: 'Content',
            category: 'Tips',
            author: { name: 'Author' },
            publishedDate: '2024-05-02T00:00:00.000Z',
            isDraft: false,
          },
        ])
      )

      const giftPosts = await BlogService.getPostsByCategory('Gifts')

      expect(giftPosts.length).toBeGreaterThanOrEqual(1)
      expect(giftPosts.every((p) => p.category === 'Gifts')).toBe(true)
    })

    it('should exclude draft posts', async () => {
      // Create posts directly using service to ensure they're in the system
      const draftPost: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: 'category-draft-test',
        title: 'Category Draft',
        excerpt: 'Excerpt',
        content: 'Content',
        category: 'UniqueCategory',
        author: { name: 'Author' },
        publishedDate: '2024-05-01T00:00:00.000Z',
        isDraft: true,
      }

      const publishedPost: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: 'category-published-test',
        title: 'Category Published',
        excerpt: 'Excerpt',
        content: 'Content',
        category: 'UniqueCategory',
        author: { name: 'Author' },
        publishedDate: '2024-05-02T00:00:00.000Z',
        isDraft: false,
      }

      await BlogService.createPost(draftPost)
      await BlogService.createPost(publishedPost)

      const posts = await BlogService.getPostsByCategory('UniqueCategory')

      expect(posts.some((p) => p.slug === 'category-draft-test')).toBe(false)
      expect(posts.some((p) => p.slug === 'category-published-test')).toBe(true)
    })

    it('should return empty array for non-existent category', async () => {
      const posts = await BlogService.getPostsByCategory('NonExistent')

      expect(posts).toEqual([])
    })

    it('should sort posts by publishedDate descending', async () => {
      // Create posts with service
      const oldPost: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: 'sort-test-old',
        title: 'Old Post',
        excerpt: 'Excerpt',
        content: 'Content',
        category: 'SortTest',
        author: { name: 'Author' },
        publishedDate: '2024-01-01T00:00:00.000Z',
        isDraft: false,
      }

      const newPost: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: 'sort-test-new',
        title: 'New Post',
        excerpt: 'Excerpt',
        content: 'Content',
        category: 'SortTest',
        author: { name: 'Author' },
        publishedDate: '2024-06-01T00:00:00.000Z',
        isDraft: false,
      }

      await BlogService.createPost(oldPost)
      await BlogService.createPost(newPost)

      const posts = await BlogService.getPostsByCategory('SortTest')

      expect(posts).toHaveLength(2)
      // First post should be newer
      expect(new Date(posts[0].publishedDate).getTime()).toBeGreaterThan(
        new Date(posts[1].publishedDate).getTime()
      )
    })
  })

  describe('Edge Cases & Integration', () => {
    it('should handle localStorage quota exceeded gracefully', async () => {
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError')
      })

      const postData: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: 'quota-test',
        title: 'Quota Test',
        excerpt: 'Excerpt',
        content: 'Content',
        category: 'Gifts',
        author: { name: 'Author' },
        publishedDate: '2024-05-15T00:00:00.000Z',
        isDraft: false,
      }

      // Should not throw, but return ID
      const postId = await BlogService.createPost(postData)
      expect(postId).toBeTruthy()

      // Restore original
      Storage.prototype.setItem = originalSetItem
    })

    it('should sync static posts on first load', async () => {
      // Clear localStorage
      localStorage.clear()

      const posts = await BlogService.getPosts()

      // Should have static posts
      expect(posts.length).toBeGreaterThanOrEqual(2)
      expect(posts.some((p) => p.slug === 'static-post-1')).toBe(true)
      expect(posts.some((p) => p.slug === 'static-post-2')).toBe(true)
    })

    it('should handle corrupted localStorage data', async () => {
      // Set corrupted data
      localStorage.setItem('gifteez_blog_posts_v1', 'not-valid-json{]')

      // Should fall back to static posts
      const posts = await BlogService.getPosts()

      expect(posts.length).toBeGreaterThanOrEqual(2)
      expect(posts.some((p) => p.slug === 'static-post-1')).toBe(true)
    })

    it('should handle localStorage with non-array data', async () => {
      // Set non-array data
      localStorage.setItem('gifteez_blog_posts_v1', JSON.stringify({ not: 'an-array' }))

      // Should fall back to static posts
      const posts = await BlogService.getPosts()

      expect(posts.length).toBeGreaterThanOrEqual(2)
      expect(posts.some((p) => p.slug === 'static-post-1')).toBe(true)
    })

    it('should handle rapid create/update/delete operations', async () => {
      // Sequential operations to avoid race conditions with localStorage
      const ids: string[] = []

      // Rapid create
      for (let i = 0; i < 5; i++) {
        const id = await BlogService.createPost({
          slug: `rapid-${i}`,
          title: `Rapid ${i}`,
          excerpt: 'Excerpt',
          content: 'Content',
          category: 'Gifts',
          author: { name: 'Author' },
          publishedDate: `2024-05-${String(i + 1).padStart(2, '0')}T00:00:00.000Z`,
          isDraft: false,
        })
        ids.push(id)
      }

      expect(ids).toHaveLength(5)

      // Verify they were created
      for (const id of ids) {
        const post = await BlogService.getPostById(id)
        expect(post).not.toBeNull()
      }

      // Rapid update (sequential to avoid race)
      for (let i = 0; i < ids.length; i++) {
        await BlogService.updatePost(ids[i], { title: `Updated Rapid ${i}` })
      }

      // Verify updates by checking individual posts
      for (let i = 0; i < ids.length; i++) {
        const post = await BlogService.getPostById(ids[i])
        expect(post?.title).toBe(`Updated Rapid ${i}`)
      }

      // Rapid delete
      for (const id of ids) {
        await BlogService.deletePost(id)
      }

      // Verify deletions
      for (const id of ids) {
        const post = await BlogService.getPostById(id)
        expect(post).toBeNull()
      }
    })

    it('should maintain referential integrity across operations', async () => {
      // Create post
      const id = await BlogService.createPost({
        slug: 'integrity-test',
        title: 'Integrity Test',
        excerpt: 'Excerpt',
        content: 'Content',
        category: 'Gifts',
        author: { name: 'Author' },
        publishedDate: '2024-05-15T00:00:00.000Z',
        isDraft: false,
      })

      // Get post by ID
      const byId = await BlogService.getPostById(id)

      // Get post by slug
      const bySlug = await BlogService.getPostBySlug('integrity-test')

      // Get all posts
      const allPosts = await BlogService.getPosts()
      const fromAll = allPosts.find((p) => p.id === id)

      // All should reference the same post
      expect(byId?.id).toBe(id)
      expect(bySlug?.id).toBe(id)
      expect(fromAll?.id).toBe(id)
      expect(byId?.title).toBe('Integrity Test')
      expect(bySlug?.title).toBe('Integrity Test')
      expect(fromAll?.title).toBe('Integrity Test')
    })
  })
})
