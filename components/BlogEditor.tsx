import React, { useEffect, useMemo, useState } from 'react';
import { blogPosts } from '../data/blogData';
import ImageUpload from './ImageUpload';
import BlogService, { BlogPostData } from '../services/blogService';
import { BlogPreview } from './BlogPreview';
import RichTextEditor from './RichTextEditor';
import SEOPanel from './SEOPanel';
import { SEOData } from '../services/seoManager';
import { contentStringToBlocks } from '../services/blogMapper';
import CoolblueFeedService, { CoolblueProduct } from '../services/coolblueFeedService';
import { AmazonProductLibrary, type AmazonProduct } from '../services/amazonProductLibrary';

interface BlogEditorProps {
  onClose: () => void;
  postId?: string;
  postSlug?: string;
  initialPost?: BlogPostData | null;
}

type ProductSource = 'coolblue' | 'amazon';

interface EditorProduct {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  imageUrl?: string;
  price?: number;
  originalPrice?: number;
  affiliateLink?: string;
  tags?: string[];
  source: ProductSource;
}

const countWords = (value?: string) => {
  if (!value) {
    return 0;
  }
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
};

const BlogEditor: React.FC<BlogEditorProps> = ({ onClose, postId, postSlug, initialPost }) => {
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isDraft, setIsDraft] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [coolblueProducts, setCoolblueProducts] = useState<EditorProduct[]>([]);
  const [amazonProducts, setAmazonProducts] = useState<EditorProduct[]>([]);
  const [productFilter, setProductFilter] = useState<'all' | ProductSource>('all');
  const [productSearch, setProductSearch] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const wordCount = useMemo(() => countWords(content), [content]);
  const readMinutes = useMemo(() => (wordCount ? Math.max(1, Math.round(wordCount / 220)) : 0), [wordCount]);
  const seoTitle = useMemo(() => (seoData?.metaTitle ?? title).trim(), [seoData, title]);
  const seoDescription = useMemo(() => (seoData?.metaDescription ?? excerpt).trim(), [seoData, excerpt]);
  const seoTitleLength = seoTitle.length;
  const seoDescriptionLength = seoDescription.length;
  const keywordsCount = useMemo(() => {
    if (!seoData?.keywords) {
      return 0;
    }
    return seoData.keywords.filter((keyword) => keyword.trim().length > 0).length;
  }, [seoData]);
  const hasHero = Boolean(imageUrl);
  const marketingChecklist = useMemo(
    () => [
      { id: 'hero', label: 'Hero-afbeelding toegevoegd', ok: hasHero },
      { id: 'words', label: 'Minimaal 400 woorden', ok: wordCount >= 400 },
      {
        id: 'seoTitle',
        label: 'SEO titel 35-60 tekens',
        ok: seoTitleLength >= 35 && seoTitleLength <= 60,
      },
      {
        id: 'metaDescription',
        label: 'Meta description 80-160 tekens',
        ok: seoDescriptionLength >= 80 && seoDescriptionLength <= 160,
      },
    ],
    [hasHero, wordCount, seoTitleLength, seoDescriptionLength]
  );
  const checklistScore = useMemo(() => {
    if (!marketingChecklist.length) {
      return 0;
    }
    const completed = marketingChecklist.filter((item) => item.ok).length;
    return Math.round((completed / marketingChecklist.length) * 100);
  }, [marketingChecklist]);

  const combinedProducts = useMemo(() => [...coolblueProducts, ...amazonProducts], [coolblueProducts, amazonProducts]);

  const filteredProducts = useMemo(() => {
    if (!combinedProducts.length) {
      return [];
    }
    const term = productSearch.trim().toLowerCase();
    let pool = combinedProducts;
    if (productFilter !== 'all') {
      pool = pool.filter((product) => product.source === productFilter);
    }
    if (term) {
      pool = pool.filter((product) => {
        const haystack = `${product.name} ${product.description ?? ''} ${(product.tags ?? []).join(' ')}`.toLowerCase();
        return haystack.includes(term);
      });
    }
    return pool.slice(0, 12);
  }, [combinedProducts, productFilter, productSearch]);

  const applyPostData = (existingPost: BlogPostData) => {
    setPost(existingPost);
    setTitle(existingPost.title || '');
    setExcerpt(existingPost.excerpt || '');
    setCategory(existingPost.category || '');
    setContent(existingPost.content || '');
    setImageUrl(existingPost.imageUrl || '');
    setIsDraft(existingPost.isDraft ?? true);
    setSeoData(existingPost.seo ?? null);
  };

  useEffect(() => {
    const loadPost = async () => {
      if (initialPost) {
        applyPostData(initialPost);
        setIsLoading(false);
        return;
      }

      if (postId) {
        setIsLoading(true);
        try {
          const existingPost = await BlogService.getPostById(postId);
          if (existingPost) {
            applyPostData(existingPost);
          }
        } catch (error) {
          console.error('Error loading post:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (postSlug) {
        // Fallback voor bestaande posts uit static data
        const existingPost = blogPosts.find(p => p.slug === postSlug);
        if (existingPost) {
          setTitle(existingPost.title);
          setExcerpt(existingPost.excerpt);
          setCategory(existingPost.category);
          setImageUrl(existingPost.imageUrl || '');
          
          // Convert content blocks to simple text for now
          const textContent = existingPost.content
            .filter(block => block.type === 'paragraph' || block.type === 'heading')
            .map(block => `${block.type === 'heading' ? '# ' : ''}${block.content}`)
            .join('\n\n');
          setContent(textContent);
        }
      }
    };

    loadPost();
  }, [postId, postSlug, initialPost]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const [coolblueFeed, amazonFeed] = await Promise.all([
          CoolblueFeedService.loadProducts(),
          AmazonProductLibrary.loadProducts(),
        ]);

        if (cancelled) return;

        const coolblueGallery: EditorProduct[] = coolblueFeed
          .filter((product) => (product.imageUrl || product.image) && product.affiliateLink)
          .slice(0, 100)
          .map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description ?? product.shortDescription,
            shortDescription: product.shortDescription,
            imageUrl: product.imageUrl || product.image,
            price: product.price,
            originalPrice: product.originalPrice,
            affiliateLink: product.affiliateLink,
            tags: product.tags,
            source: 'coolblue',
          }));
        setCoolblueProducts(coolblueGallery);

        const amazonGallery: EditorProduct[] = amazonFeed
          .filter((product) => product.affiliateLink)
          .map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description ?? product.shortDescription,
            shortDescription: product.shortDescription,
            imageUrl: product.imageLarge ?? product.image,
            price: product.price,
            originalPrice: product.originalPrice,
            affiliateLink: product.affiliateLink,
            tags: product.tags,
            source: 'amazon',
          }));
        setAmazonProducts(amazonGallery);
      } catch (error) {
        console.warn('Kon productafbeeldingen niet laden voor blogeditor:', error);
        if (!cancelled) {
          setCoolblueProducts([]);
          setAmazonProducts([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const appendToContent = (snippet: string) => {
    setContent((prev) => {
      const trimmed = prev.trimEnd();
      const spacer = trimmed.length ? '\n\n' : '';
      return `${trimmed}${spacer}${snippet}`.trimStart();
    });
  };

  const handleInsertProduct = (product: EditorProduct, variant: 'image+link' | 'link-only') => {
    const imageSrc = product.imageUrl;
    const pieces: string[] = [];

    if (variant === 'image+link') {
      if (imageSrc) {
        pieces.push(`![${product.name}](${imageSrc})`);
      }

      const description = product.shortDescription || product.description;
      if (description) {
        pieces.push(description);
      }
    }

    if (!product.affiliateLink) {
      if (!pieces.length) {
        return;
      }
      appendToContent(pieces.join('\n\n'));
      return;
    }

    const retailerLabel = product.source === 'amazon' ? 'Amazon' : 'Coolblue';
    const linkLabel = variant === 'link-only'
      ? `👉 Bekijk ${product.name} bij ${retailerLabel}`
      : `Bekijk ${product.name} bij ${retailerLabel}`;
    pieces.push(`[${linkLabel}](${product.affiliateLink})`);

    appendToContent(pieces.join('\n\n'));
  };

  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      alert('Titel is verplicht');
      return;
    }

    setIsSaving(true);
    
    try {
      const slug = post?.slug || BlogService.generateSlug(title);
      const contentBlocks = contentStringToBlocks(content);
      const postData: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug,
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        imageUrl: imageUrl || undefined,
        category: category || 'Algemeen',
        author: {
          name: 'Admin',
          avatarUrl: 'https://i.pravatar.cc/150?u=admin'
        },
        publishedDate: publish ? new Date().toISOString() : (post?.publishedDate || new Date().toISOString()),
        isDraft: publish ? false : isDraft,
        contentBlocks: contentBlocks.length ? contentBlocks : undefined,
        seo: seoData ? {
          metaTitle: seoData.metaTitle,
          metaDescription: seoData.metaDescription,
          keywords: seoData.keywords,
          ogTitle: seoData.ogTitle,
          ogDescription: seoData.ogDescription,
          ogImage: seoData.ogImage,
          canonicalUrl: seoData.canonicalUrl
        } : {
          metaTitle: title.trim(),
          metaDescription: excerpt.trim(),
          keywords: [category]
        }
      };

      if (postId) {
        // Update bestaande post
        await BlogService.updatePost(postId, postData);
        alert(`Blog post ${publish ? 'gepubliceerd' : 'opgeslagen'}!`);
      } else {
        // Nieuwe post aanmaken
        const newPostId = await BlogService.createPost(postData);
        alert(`Nieuwe blog post ${publish ? 'gepubliceerd' : 'opgeslagen'}! ID: ${newPostId}`);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving post:', error);
      alert(`Fout bij opslaan: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (url: string, filename: string) => {
    setImageUrl(url);
  };

  const handleImageDelete = () => {
    setImageUrl('');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 flex items-center space-x-4">
          <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Post laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">
              {post ? 'Blog Post Bewerken' : 'Nieuwe Blog Post'}
            </h2>
            {post && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isDraft ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {isDraft ? 'Concept' : 'Gepubliceerd'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Editor Insights */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Content status</p>
                <p className="mt-2 text-2xl font-semibold text-rose-600">
                  {wordCount} woorden
                </p>
                <p className="text-xs text-rose-500">
                  {wordCount ? `≈ ${readMinutes} min leestijd` : 'Begin met schrijven'}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">SEO-signalen</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-emerald-600">{seoTitleLength}</span>
                  <span className="text-xs text-emerald-500">tekens titel</span>
                </div>
                <p className="text-xs text-emerald-500">
                  Meta description {seoDescriptionLength}/160 · keywords {keywordsCount}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
                  <span>Marketing checklist</span>
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-600">
                    {checklistScore}% klaar
                  </span>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  {marketingChecklist.map((item) => (
                    <li
                      key={item.id}
                      className={`flex items-center gap-2 ${item.ok ? 'text-emerald-600' : 'text-gray-500'}`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                          item.ok ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {item.ok ? '✓' : '•'}
                      </span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="Geef je blog post een titel..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="">Selecteer categorie...</option>
                <option value="Tech">Tech</option>
                <option value="Duurzaam">Duurzaam</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Reviews">Reviews</option>
              </select>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Samenvatting
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="Korte samenvatting voor op de blog overzichtspagina..."
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hoofdafbeelding
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Deze afbeelding verschijnt als hero bovenaan het artikel. Lever bij voorkeur een liggende afbeelding van minimaal 1600×900 px aan.
              </p>
              <ImageUpload
                currentImage={imageUrl}
                onImageUpload={handleImageUpload}
                onImageDelete={handleImageDelete}
                folder="blog-images"
                className="max-w-md"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Schrijf je blog post content hier..."
                  height={500}
                />
              </div>
            </div>

            {/* Product media helper */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product visuals & affiliate links
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 text-xs font-medium text-gray-600">
                    {[
                      { key: 'all' as const, label: 'Alle bronnen' },
                      { key: 'coolblue' as const, label: 'Coolblue' },
                      { key: 'amazon' as const, label: 'Amazon.nl' },
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setProductFilter(option.key)}
                        className={`rounded-full px-3 py-1 transition-colors ${
                          productFilter === option.key
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="search"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Zoek in producten..."
                    className="w-56 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 space-y-4">
                <p className="text-xs text-gray-500">
                  Voeg eenvoudig productafbeeldingen toe aan je artikel. Klik op <strong>Afbeelding + link</strong> om meteen een mooie afbeelding inclusief affiliate link in de tekst te plakken, of kies <strong>Alleen link</strong> voor een snelle call-to-action.
                </p>
                {isLoadingProducts ? (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    Producten laden...
                  </div>
                ) : filteredProducts.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredProducts.map((product) => {
                      const imageSrc = product.imageUrl || '/images/amazon-placeholder.png';
                      const priceLabel = typeof product.price === 'number' && Number.isFinite(product.price) && product.price > 0 ? `€${product.price.toFixed(2)}` : undefined;
                      const retailerLabel = product.source === 'amazon' ? 'Amazon.nl' : 'Coolblue';
                      return (
                        <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 shadow-sm">
                          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-100">
                            <img src={imageSrc} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <div className="flex-1 flex flex-col">
                            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-gray-400">
                              <span>{retailerLabel}</span>
                              {product.tags?.length ? (
                                <span className="truncate max-w-[45%]">{product.tags.slice(0, 2).join(' • ')}</span>
                              ) : null}
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h4>
                            {priceLabel && <p className="text-xs text-gray-500 mb-3">{priceLabel}</p>}
                            {product.description && (
                              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                            )}
                            <div className="mt-auto flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleInsertProduct(product, 'image+link')}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                                disabled={!product.affiliateLink}
                              >
                                Afbeelding + link
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInsertProduct(product, 'link-only')}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
                                disabled={!product.affiliateLink}
                              >
                                Alleen link
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Geen producten gevonden. Probeer een andere zoekterm of controleer of de productfeeds geladen zijn.
                  </p>
                )}
              </div>
            </div>

            {/* SEO Optimization */}
            {(title || content) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO & Social Media
                </label>
                <SEOPanel
                  title={title}
                  content={content}
                  excerpt={excerpt}
                  imageUrl={imageUrl}
                  slug={post?.slug}
                  onSEOChange={setSeoData}
                />
              </div>
            )}

            {/* Preview */}
            {content && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Live Preview
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-60 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    {content.split('\n\n').map((block, idx) => {
                      if (block.startsWith('# ')) {
                        return <h3 key={idx} className="text-lg font-semibold mb-2">{block.substring(2)}</h3>;
                      }
                      return <p key={idx} className="mb-3 text-gray-700">{block}</p>;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isDraft}
                onChange={(e) => setIsDraft(e.target.checked)}
                className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-sm text-gray-600">Opslaan als concept</span>
            </label>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPreview(true)}
              disabled={!title.trim() || !content.trim()}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Preview</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuleren
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving || !title.trim()}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSaving && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isSaving ? 'Opslaan...' : 'Opslaan'}</span>
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving || !title.trim()}
              className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSaving && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isSaving ? 'Publiceren...' : 'Publiceren'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Preview Modal */}
      {showPreview && (
        <BlogPreview
          post={{
            id: post?.id || 'new',
            title,
            excerpt,
            content,
            category,
            imageUrl: imageUrl || undefined,
            slug: post?.slug || '',
            published: !isDraft,
            isDraft,
            publishedAt: post?.publishedAt || new Date().toISOString(),
            createdAt: post?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: []
          }}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default BlogEditor;