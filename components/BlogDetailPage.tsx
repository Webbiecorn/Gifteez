
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Meta from './Meta';
import ImageWithFallback from './ImageWithFallback';
import InternalLinkCTA from './InternalLinkCTA';
import { BlogPost, NavigateTo, ContentBlock, ShowToast, ComparisonTableBlock, ProsConsBlock, VerdictBlock, FAQBlock, ImageBlock } from '../types';
import { useBlogContext } from '../contexts/BlogContext';
import BlogService from '../services/blogService';
import { blogPostDataToBlogPost } from '../services/blogMapper';
import { CalendarIcon, ChevronRightIcon, FacebookIcon, TwitterIcon, WhatsAppIcon, CheckIcon, XCircleIcon, StarIcon, BookOpenIcon, SparklesIcon, TargetIcon, ShareIcon, MailIcon, UserIcon, TagIcon } from './IconComponents';
import GiftResultCard from './GiftResultCard';
import { pinterestPageVisit } from '../services/pinterestTracking';
import { gaDownloadResource, gaPageView } from '../services/googleAnalytics';
import SocialShare from './SocialShare';

// Print styles component
const PrintStyles = () => (
    <style
        dangerouslySetInnerHTML={{
            __html: `
            @media print {
                .no-print { display: none !important; }
                .print-break-before { page-break-before: always; }
                .print-break-after { page-break-after: always; }
                body { font-size: 12pt; line-height: 1.4; }
                .prose { max-width: none; }
                .prose img { max-width: 100% !important; height: auto !important; }
                .prose h1, .prose h2, .prose h3 { page-break-after: avoid; }
                .prose p { orphans: 3; widows: 3; }
                a { color: black !important; text-decoration: underline !important; }
                .bg-gradient-to-r { background: white !important; }
                .shadow-xl, .shadow-2xl { box-shadow: none !important; }
                .border { border: 1px solid #ccc !important; }
            }
        `
        }}
    />
);

interface BlogDetailPageProps {
    slug: string;
    navigateTo: NavigateTo;
    showToast: ShowToast;
}

const BlogCardSmall: React.FC<{ post: BlogPost; navigateTo: NavigateTo; }> = ({ post, navigateTo }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" onClick={() => navigateTo('blogDetail', { slug: post.slug })}>
        <div className="overflow-hidden w-full h-32 relative">
            <ImageWithFallback src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="p-4">
            <h4 className="font-display text-sm font-bold text-primary line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors duration-300">{post.title}</h4>
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{post.category}</span>
                <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {new Date(post.publishedDate).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' })}
                </span>
            </div>
        </div>
    </div>
);

const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ slug, navigateTo, showToast }) => {
    const { posts, loading: postsLoading, findPostBySlug } = useBlogContext();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [heroFitMode, setHeroFitMode] = useState<'contain' | 'cover'>(() => {
        if (typeof window === 'undefined') {
            return 'contain';
        }
        const stored = window.localStorage.getItem('gifteezHeroFit');
        return stored === 'cover' ? 'cover' : 'contain';
    });
    const [globalImageFit, setGlobalImageFit] = useState<'contain' | 'cover'>(() => {
        if (typeof window === 'undefined') {
            return 'cover';
        }
        const stored = window.localStorage.getItem('gifteezGlobalImageFit');
        return stored === 'contain' ? 'contain' : 'cover';
    });
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showJumpToTop, setShowJumpToTop] = useState(false);
    const [imageErrors, setImageErrors] = useState<Set<string>>(() => new Set());

    useEffect(() => {
        if (postsLoading) {
            return;
        }

        const existing = findPostBySlug(slug);
        if (existing) {
            setPost(existing);
            setFetchError(null);
            return;
        }

        let isMounted = true;
        setIsFetching(true);
        setFetchError(null);

        BlogService.getPostBySlug(slug)
            .then((data) => {
                if (!isMounted) return;
                if (!data || data.isDraft) {
                    setPost(null);
                    setFetchError('Deze blogpost kon niet worden gevonden.');
                    return;
                }
                setPost(blogPostDataToBlogPost(data));
            })
            .catch(() => {
                if (!isMounted) return;
                setPost(null);
                setFetchError('Er ging iets mis bij het laden van de blogpost.');
            })
            .finally(() => {
                if (!isMounted) return;
                setIsFetching(false);
            });

        return () => {
            isMounted = false;
        };
    }, [slug, postsLoading, findPostBySlug, posts]);

    useEffect(() => {
        if (!post || typeof window === 'undefined') {
            return;
        }

        const updateScrollProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollProgress(Math.min(scrollPercent, 100));
            setShowJumpToTop(scrollTop > 300);
        };

        window.addEventListener('scroll', updateScrollProgress);
        updateScrollProgress();

        const appendedScripts: HTMLElement[] = [];
        const appendJsonLd = (schema: Record<string, unknown>) => {
            const scriptEl = document.createElement('script');
            scriptEl.type = 'application/ld+json';
            scriptEl.innerHTML = JSON.stringify(schema);
            document.head.appendChild(scriptEl);
            appendedScripts.push(scriptEl);
            return scriptEl;
        };

        const articleSchema = {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': window.location.href
            },
            headline: post.title,
            description: post.excerpt,
            image: post.imageUrl,
            author: {
                '@type': 'Person',
                name: post.author.name,
                image: post.author.avatarUrl
            },
            publisher: {
                '@type': 'Organization',
                name: 'Gifteez.nl',
                logo: {
                    '@type': 'ImageObject',
                    url: 'https://gifteez.nl/android-chrome-512x512.png'
                }
            },
            datePublished: post.publishedDate,
            dateModified: post.publishedDate
        };

        appendJsonLd(articleSchema);

        const faqBlocks = post.content.filter((b): b is FAQBlock => b.type === 'faq');
        if (faqBlocks.length) {
            const entities = faqBlocks.flatMap(block =>
                block.items.map(item => ({
                    '@type': 'Question',
                    name: item.question,
                    acceptedAnswer: { '@type': 'Answer', text: item.answer }
                }))
            );
            if (entities.length) {
                const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entities };
                appendJsonLd(faqSchema);
            }
        }

        const breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${window.location.origin}/` },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: `${window.location.origin}/blog` },
                { '@type': 'ListItem', position: 3, name: post.title, item: `${window.location.origin}/blog/${post.slug}` }
            ]
        };

        appendJsonLd(breadcrumbSchema);

        pinterestPageVisit('blog_article', `blog_${post.slug}_${Date.now()}`);
        gaPageView(`/blog/${post.slug}`, post.title);

        return () => {
            window.removeEventListener('scroll', updateScrollProgress);
            appendedScripts.forEach((el) => {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
        };
    }, [post]);

    const relatedPosts = useMemo(
        () => (post ? posts.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 3) : []),
        [posts, post]
    );

    const handleContentClick = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            if (!post) {
                return;
            }

            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            const anchor = target.closest('a');
            if (!anchor) {
                return;
            }

            const hrefValue = anchor.getAttribute('href') ?? '';
            if (!hrefValue) {
                return;
            }

            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            const isInternalDownload = hrefValue.startsWith('/downloads/');
            const isAbsoluteDownload = origin && hrefValue.startsWith(`${origin}/downloads/`);

            if (!isInternalDownload && !isAbsoluteDownload) {
                return;
            }

            const resourcePath = isAbsoluteDownload ? hrefValue.replace(origin, '') : hrefValue;
            const label = anchor.textContent?.trim() || undefined;

            gaDownloadResource(resourcePath, {
                label,
                slug: post.slug,
                title: post.title,
            });
        },
        [post]
    );

    if (postsLoading || isFetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-muted-rose/30 to-white">
                <div className="text-center space-y-3">
                    <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600">Blogpost laden...</p>
                </div>
            </div>
        );
    }

    if (fetchError || !post) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white via-muted-rose/30 to-white flex items-center justify-center px-4">
                <div className="max-w-lg bg-white border border-gray-100 shadow-xl rounded-3xl p-8 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 text-2xl">😕</div>
                    <h1 className="text-2xl font-bold text-gray-900">Blogpost niet gevonden</h1>
                    <p className="text-gray-600">{fetchError ?? 'Het artikel waar je naar zocht bestaat niet meer of is verplaatst.'}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigateTo('blog')}
                            className="px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Bekijk alle gidsen
                        </button>
                        <button
                            onClick={() => navigateTo('home')}
                            className="px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Terug naar home
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    // Calculate reading time
    const calculateReadingTime = (content: ContentBlock[]): number => {
        const text = content
            .filter(block => block.type === 'paragraph' || block.type === 'heading')
            .map(block => {
                if (block.type === 'paragraph') {
                    return block.content;
                } else if (block.type === 'heading') {
                    return block.content;
                }
                return '';
            })
            .join(' ');
        
        const wordsPerMinute = 200; // Average reading speed
        const words = text.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    };

    const readingTime = calculateReadingTime(post.content);

    const heroImage = post.imageUrl;
    const heroDisplaySrc = heroImage ? (imageErrors.has(heroImage) ? '/images/amazon-placeholder.png' : heroImage) : null;

    // Image error handler
    const handleImageError = (imageUrl: string) => {
        setImageErrors(prev => new Set([...prev, imageUrl]));
    };

    const toggleHeroFit = () => {
        setHeroFitMode(prev => {
            const next = prev === 'contain' ? 'cover' : 'contain';
            localStorage.setItem('gifteezHeroFit', next);
            return next;
        });
    };

    const toggleGlobalImageFit = () => {
        setGlobalImageFit(prev => {
            const next = prev === 'cover' ? 'contain' : 'cover';
            localStorage.setItem('gifteezGlobalImageFit', next);
            return next;
        });
    };
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(`Bekijk deze cadeaugids op Gifteez.nl: ${post?.title ?? ''}`);

  // Native Web Share API function
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Bekijk deze cadeaugids: ${post.title}`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareUrl);
      showToast('Link gekopieerd naar klembord!', 'success');
    }
  };

        const socialLinks = [
            { name: 'Facebook', icon: FacebookIcon, url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
            { name: 'Twitter', icon: TwitterIcon, url: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}` },
            { name: 'WhatsApp', icon: WhatsAppIcon, url: `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}` }
        ];
        const headings = post.content.filter(block => block.type === 'heading') as {type: 'heading', content: string}[];
        const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    // Removed special-case preprocessing for legacy post 'vergelijking-draadloze-oordopjes'
    // (Content pruning September 2025)

    const renderContentBlock = (block: ContentBlock, index: number) => {
        // No legacy earbuds candidate grid rendering (removed post)

        switch(block.type) {
                case 'heading':
                        return (
                            <h2
                                key={index}
                                id={slugify(block.content)}
                                className="scroll-mt-24 text-2xl md:text-3xl font-display font-bold text-primary mb-6 mt-12 first:mt-0 relative group"
                            >
                                <span className="relative inline-block">
                                    {block.content}
                                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent-hover rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                </span>
                            </h2>
                        );
                case 'paragraph':
                        return (
                            <div
                                        key={index}
                                        className="content-paragraph mb-6"
                                        dangerouslySetInnerHTML={{ __html: block.content }}
                                    />
                                );
        case 'image': {
            const { src, alt, caption, href } = block as ImageBlock;
                        if (!src) {
                            return null;
                        }
                        const broken = imageErrors.has(src);
                        const displaySrc = broken ? '/images/amazon-placeholder.png' : src;
                        const imageElement = (
                            <img
                                src={displaySrc}
                                alt={alt || post.title}
                                loading="lazy"
                                decoding="async"
                                className={`${globalImageFit === 'cover' ? 'w-full h-full object-cover' : 'w-full h-auto object-contain'} transition-transform duration-500`}
                                onError={() => handleImageError(src)}
                            />
                        );
                        return (
                            <figure key={index} className="my-12">
                                <div className={`relative overflow-hidden rounded-3xl border border-gray-100 shadow-xl bg-white ${globalImageFit === 'cover' ? 'h-80 md:h-[26rem]' : 'p-4 md:p-6'}`}>
                                    {globalImageFit === 'cover' && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                                    )}
                                    {href ? (
                                        <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
                                            {imageElement}
                                        </a>
                                    ) : (
                                        imageElement
                                    )}
                                </div>
                                {(caption || alt) && (
                                    <figcaption className="mt-4 text-center text-sm text-gray-500">
                                        {caption || alt}
                                    </figcaption>
                                )}
                            </figure>
                        );
                }
                case 'gift':
                        return (
                            <div key={index} className="my-12 bg-gradient-to-r from-secondary to-muted-rose rounded-2xl p-8 border border-gray-100 shadow-lg">
                                <GiftResultCard 
                                    gift={block.content} 
                                    index={index} 
                                    showToast={showToast} 
                                    isEmbedded={true} 
                                    imageHeightClass="h-32"
                                    imageFit="contain"
                                />
                            </div>
                        );
        case 'comparisonTable':
            const tableBlock = block as ComparisonTableBlock;
            return (
                <div key={index} className="my-12 overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-100">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-white uppercase bg-gradient-to-r from-accent to-accent-hover">
                            <tr>
                                <th scope="col" className="px-8 py-4 font-bold text-white rounded-tl-2xl">Specificatie</th>
                                {tableBlock.headers.map((header, i) => (
                                    <th key={i} scope="col" className="px-8 py-4 font-bold text-white text-center" style={{ background: i === tableBlock.headers.length - 1 ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : undefined }}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableBlock.rows.map((row, i) => (
                                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-muted-rose/70 transition-colors duration-200`}>
                                    <th scope="row" className="px-8 py-4 font-bold text-gray-900 whitespace-nowrap border-r border-gray-200 bg-gradient-to-r from-gray-100 to-gray-50">
                                        {row.feature}
                                    </th>
                                    {row.values.map((value, j) => (
                                        <td key={j} className="px-8 py-4 border-r border-gray-100 text-center font-medium text-gray-700 last:border-r-0">
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        case 'prosCons':
            const prosConsBlock = block as ProsConsBlock;
            return (
                <div key={index} className={`my-12 grid grid-cols-1 md:grid-cols-${prosConsBlock.items.length} gap-8`}>
                    {prosConsBlock.items.map((item, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-accent to-accent-hover p-6">
                                <h4 className="font-display font-bold text-xl text-white text-center">{item.title}</h4>
                            </div>
                            <div className="p-6">
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-5 h-5 text-green-600" />
                                        </div>
                                        <h5 className="font-bold text-green-700 text-lg">Pluspunten</h5>
                                    </div>
                                    <ul className="space-y-3">
                                        {item.pros.map((pro, j) => (
                                            <li key={j} className="flex items-start gap-3">
                                                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700 leading-relaxed">{pro}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <XCircleIcon className="w-5 h-5 text-red-500" />
                                        </div>
                                        <h5 className="font-bold text-red-700 text-lg">Minpunten</h5>
                                    </div>
                                    <ul className="space-y-3">
                                        {item.cons.map((con, j) => (
                                            <li key={j} className="flex items-start gap-3">
                                                <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700 leading-relaxed">{con}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        case 'verdict':
            const verdictBlock = block as VerdictBlock;
            return (
                <div key={index} className="my-12 relative overflow-hidden bg-white border-2 border-muted-rose rounded-2xl shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-muted-rose via-white to-secondary/80"></div>
                    <div className="relative p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-accent to-highlight rounded-full flex items-center justify-center shadow-lg">
                                <StarIcon className="w-8 h-8 text-white"/>
                            </div>
                            <h3 className="font-display text-3xl md:text-4xl font-bold text-slate-900">{verdictBlock.title}</h3>
                        </div>
                        <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-4xl">{verdictBlock.content}</p>
                    </div>
                </div>
            )
    }
  }

  const formattedDate = new Date(post.publishedDate).toLocaleDateString('nl-NL', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

    return (
        <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-secondary/20">
                <Meta 
                    title={`${post.title} | Gifteez Blog`}
                    description={post.excerpt}
                    canonical={`https://gifteez.nl/blog/${post.slug}`}
                    ogImage={post.imageUrl.startsWith('http') ? post.imageUrl : `https://gifteez.nl${post.imageUrl}`}
                    type="article"
                    author={post.author?.name || 'Gifteez Redactie'}
                    publishedDate={post.publishedDate}
                    category={post.category}
                    keywords={post.seo?.keywords || []}
                />
        {/* Print Styles */}
        <PrintStyles />
        
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
            <div 
                className="h-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-300 ease-out"
                style={{ width: `${scrollProgress}%` }}
            ></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {heroDisplaySrc && (
                <section className="mb-12">
                    <div className={`relative overflow-hidden rounded-3xl border border-gray-100 shadow-2xl ${heroFitMode === 'cover' ? 'h-[340px] sm:h-[420px] lg:h-[520px]' : 'bg-white p-6 sm:p-10'}`}>
                        {heroFitMode === 'cover' ? (
                            <img
                                src={heroDisplaySrc}
                                alt={post.title}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                                onError={() => heroImage && handleImageError(heroImage)}
                            />
                        ) : (
                            <div className="relative flex items-center justify-center min-h-[260px] sm:min-h-[320px]">
                                <img
                                    src={heroDisplaySrc}
                                    alt={post.title}
                                    className="max-h-[420px] w-full sm:w-auto object-contain"
                                    loading="lazy"
                                    decoding="async"
                                    onError={() => heroImage && handleImageError(heroImage)}
                                />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent pointer-events-none"></div>
                        <div className="absolute top-6 left-6 flex flex-wrap items-center gap-3 text-sm font-semibold">
                            <span className="bg-white/85 text-primary px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm">{post.category}</span>
                            <span className="bg-white/75 text-gray-700 px-4 py-1.5 rounded-full shadow-md backdrop-blur-sm">{formattedDate}</span>
                        </div>
                        <div className="absolute top-6 right-6 flex flex-wrap gap-3">
                            <button
                                onClick={toggleHeroFit}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/55 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
                                type="button"
                            >
                                <span className="inline-flex h-2 w-2 rounded-full bg-white/80" aria-hidden="true"></span>
                                {heroFitMode === 'cover' ? 'Vullend' : 'Volledig zichtbaar'}
                            </button>
                            <button
                                onClick={handleNativeShare}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
                                type="button"
                            >
                                <ShareIcon className="w-4 h-4" />
                                Deel artikel
                            </button>
                        </div>
                    </div>
                </section>
            )}
            <nav aria-label="Breadcrumb" className="mb-8">
                <ol className="flex items-center gap-2 text-sm text-gray-600">
                    <li><button onClick={() => navigateTo('home')} className="hover:text-primary transition-colors font-medium">Home</button></li>
                    <li><ChevronRightIcon className="w-4 h-4 text-gray-400" /></li>
                    <li><button onClick={() => navigateTo('blog')} className="hover:text-primary transition-colors font-medium">Blog</button></li>
                    <li><ChevronRightIcon className="w-4 h-4 text-gray-400" /></li>
                    <li><span className="font-medium text-gray-800 line-clamp-1" aria-current="page">{post.title}</span></li>
                </ol>
            </nav>

            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                <main className="lg:col-span-8">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                        
                        {/* Article Header */}
                        <div className="p-8 md:p-12 border-b border-gray-100">
                            <div className="text-center">
                                <p className="text-sm font-bold text-primary uppercase tracking-wider mb-4">{post.category}</p>
                                <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                    {post.title}
                                </h1>
                                <p className="text-lg text-gray-600 mb-6">
                                    {post.excerpt}
                                </p>
                                <div className="flex flex-wrap justify-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <ImageWithFallback
                                            src={post.author.avatarUrl}
                                            alt={post.author.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <span className="font-semibold text-gray-700">{post.author.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span>{formattedDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <TargetIcon className="w-4 h-4" />
                                        <span>~{readingTime} min lezen</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-8 md:p-12">
                            {/* Table of Contents */}
                            {headings.length > 1 && (
                                <nav className="mb-12 p-6 bg-gradient-to-r from-secondary to-muted-rose rounded-2xl border border-muted-rose" aria-labelledby="toc-heading">
                                    <div className="flex items-center gap-3 mb-4">
                                        <SparklesIcon className="w-6 h-6 text-accent" aria-hidden="true" />
                                        <h2 id="toc-heading" className="font-display font-bold text-primary text-xl">In dit artikel</h2>
                                    </div>
                                    <ol className="space-y-3" role="list">
                                        {headings.map((heading, i) => (
                                            <li key={i} className="flex items-center gap-2" role="listitem">
                                                <span className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold" aria-hidden="true">{i + 1}</span>
                                                <a 
                                                    href={`#${slugify(heading.content)}`} 
                                                    className="font-semibold text-primary hover:text-accent hover:underline transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded px-2 py-1"
                                                    aria-describedby={`heading-${i}-description`}
                                                >
                                                    {heading.content}
                                                </a>
                                                <span id={`heading-${i}-description`} className="sr-only">Spring naar sectie {heading.content}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </nav>
                            )}

                            {/* Article Actions */}
                            <div className="mb-8 flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-sm font-medium text-gray-600 mr-2">Acties:</span>
                                <button
                                    onClick={toggleGlobalImageFit}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 rounded-lg text-gray-700 hover:text-gray-900 transition-colors duration-200 text-sm font-medium border border-gray-200"
                                    type="button"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16M12 4v16" />
                                    </svg>
                                    Afbeeldingen: {globalImageFit === 'cover' ? 'vullend' : 'volledig zichtbaar'}
                                </button>
                                
                                <button
                                    onClick={() => window.print()}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 rounded-lg text-gray-700 hover:text-gray-900 transition-colors duration-200 text-sm font-medium border border-gray-200"
                                    aria-label="Print dit artikel"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print
                                </button>
                                
                                <button
                                    onClick={() => {
                                        // Toggle save for later functionality
                                        const isSaved = localStorage.getItem(`saved_${post.slug}`);
                                        if (isSaved) {
                                            localStorage.removeItem(`saved_${post.slug}`);
                                            showToast('Artikel verwijderd uit opgeslagen artikelen', 'info');
                                        } else {
                                            localStorage.setItem(`saved_${post.slug}`, 'true');
                                            showToast('Artikel opgeslagen voor later!', 'success');
                                        }
                                    }}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 rounded-lg text-gray-700 hover:text-gray-900 transition-colors duration-200 text-sm font-medium border border-gray-200"
                                    aria-label="Opslaan voor later"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    {localStorage.getItem(`saved_${post.slug}`) ? 'Opgeslagen' : 'Opslaan'}
                                </button>
                                
                                <button
                                    onClick={() => {
                                        const url = window.location.href;
                                        navigator.clipboard.writeText(url);
                                        showToast('Link gekopieerd naar klembord!', 'success');
                                    }}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 rounded-lg text-gray-700 hover:text-gray-900 transition-colors duration-200 text-sm font-medium border border-gray-200"
                                    aria-label="Kopieer artikel link"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Kopieer link
                                </button>
                            </div>

                            {/* Article Meta Information */}
                            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-600 border-b border-gray-100 pb-6">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4" aria-hidden="true" />
                                    <time dateTime={post.publishedDate} aria-label={`Gepubliceerd op ${formattedDate}`}>
                                        Gepubliceerd: {formattedDate}
                                    </time>
                                </div>
                                <div className="flex items-center gap-2">
                                    <UserIcon className="w-4 h-4" aria-hidden="true" />
                                    <span>Auteur: {post.author.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpenIcon className="w-4 h-4" aria-hidden="true" />
                                    <span>Categorie: {post.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted-rose text-accent rounded-full text-xs font-medium">
                                        <SparklesIcon className="w-3 h-3" aria-hidden="true" />
                                        {readingTime} min lezen
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-highlight/10 text-highlight rounded-full text-xs font-medium">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        {Math.floor(Math.random() * 5000) + 1000} views
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted-rose text-accent rounded-full text-xs font-medium">
                                        <CheckIcon className="w-3 h-3 text-accent" aria-hidden="true" />
                                        Bijgewerkt {new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {/* Article Content */}
                            <article
                                className="prose prose-lg lg:prose-xl max-w-none text-gray-700 prose-headings:font-display prose-headings:text-primary prose-headings:font-bold prose-headings:leading-tight prose-p:leading-relaxed prose-p:mb-6 prose-strong:text-gray-900 prose-strong:font-semibold prose-a:text-primary prose-a:font-semibold hover:prose-a:text-accent prose-a:no-underline prose-a:underline-offset-4 prose-a:transition-colors prose-img:rounded-3xl prose-img:shadow-xl prose-img:border prose-img:border-gray-100 prose-img:bg-white prose-li:marker:text-accent"
                                onClick={handleContentClick}
                            >
                                {post.content.map(renderContentBlock)}
                            </article>

                            {/* Author Bio Section */}
                            <div className="mt-16 bg-gradient-to-r from-secondary to-muted-rose rounded-3xl p-8 border border-muted-rose" data-author-section>
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                    <div className="flex-shrink-0">
                                        <ImageWithFallback
                                            src={post.author.avatarUrl}
                                            alt={post.author.name}
                                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <UserIcon className="w-6 h-6 text-accent" />
                                            <h3 className="font-display text-2xl font-bold text-primary">Over {post.author.name}</h3>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            {post.author.name === 'Gifteez Redactie' 
                                                ? 'Ons team van cadeau-experts helpt je bij het vinden van het perfecte cadeau voor elke gelegenheid. Met jarenlange ervaring in cadeau-advies delen we eerlijke reviews en praktische tips.'
                                                : post.author.name === 'Linda Groen'
                                                ? 'Linda is onze duurzaamheidsexpert met een passie voor eco-vriendelijke cadeaus. Zij helpt je bewuste keuzes te maken die zowel de ontvanger als de planeet ten goede komen.'
                                                : post.author.name === 'Tech Expert'
                                                ? 'Onze tech-specialist houdt je op de hoogte van de nieuwste gadgets en innovaties. Met diepgaande kennis van technologie helpt hij je de beste tech-cadeaus te kiezen.'
                                                : post.author.name === 'Mark de Cadeau-Expert'
                                                ? 'Mark is onze cadeauspecialist met expertise in persoonlijke cadeau-advies. Hij weet precies hoe je iemand blij kunt maken met een attent en doordacht cadeau.'
                                                : 'Een expert op het gebied van cadeau-advies met jarenlange ervaring in het helpen van mensen de perfecte cadeaus te vinden.'
                                            }
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            <span className="inline-flex items-center gap-2 bg-muted-rose text-accent px-3 py-1 rounded-full text-sm font-medium">
                                                <BookOpenIcon className="w-4 h-4" />
                                                Cadeau Expert
                                            </span>
                                            <span className="inline-flex items-center gap-2 bg-highlight/10 text-highlight px-3 py-1 rounded-full text-sm font-medium">
                                                <CheckIcon className="w-4 h-4" />
                                                {Math.floor(Math.random() * 50) + 10} Artikelen
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Affiliate Disclosure */}
                            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <TagIcon className="w-4 h-4 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-yellow-800 mb-2">Affiliate Disclosure</h4>
                                        <p className="text-yellow-700 text-sm leading-relaxed">
                                            Sommige links in dit artikel zijn affiliate links. Als je via deze links iets koopt, ontvangen wij een kleine commissie zonder extra kosten voor jou. 
                                            Dit helpt ons om gratis content te blijven maken. Onze mening blijft altijd onafhankelijk en eerlijk.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Bottom CTA */}
                    <div className="mt-16 relative overflow-hidden bg-purple-800">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-700 to-purple-600 opacity-95"></div>
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="relative p-8 md:p-12 text-center text-white">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                                <TargetIcon className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">Het perfecte cadeau nog niet gevonden?</h2>
                            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-8">
                                Probeer de AI GiftFinder en krijg binnen 30 seconden een gepersonaliseerde lijst met cadeau-ideeën.
                            </p>
                            <button
                                onClick={() => navigateTo('giftFinder')}
                                className="inline-flex items-center gap-3 bg-white text-primary font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
                            >
                                <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                                <span>Start GiftFinder</span>
                            </button>
                        </div>
                    </div>

                    {/* Article Engagement Section */}
                    <div className="mt-16 bg-gradient-to-r from-secondary to-muted-rose rounded-3xl p-8 border border-muted-rose" data-comments-section>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted-rose rounded-full mb-4">
                                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="font-display text-2xl font-bold text-primary mb-2">Wat vind je van dit artikel?</h3>
                            <p className="text-accent">Deel je mening of stel een vraag in de reacties</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-8">
                            <button
                                onClick={() => showToast('Bedankt voor je positieve feedback! 👍', 'success')}
                                className="flex items-center justify-center gap-3 p-4 bg-white hover:bg-highlight/10 rounded-2xl border border-highlight/40 hover:border-highlight/60 transition-all duration-300 group"
                            >
                                <svg className="w-6 h-6 text-highlight group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                                <span className="font-medium text-highlight">Helpful</span>
                            </button>

                            <button
                                onClick={() => showToast('Bedankt voor je feedback! We verbeteren continu.', 'info')}
                                className="flex items-center justify-center gap-3 p-4 bg-white hover:bg-yellow-50 rounded-2xl border border-yellow-200 hover:border-yellow-300 transition-all duration-300 group"
                            >
                                <svg className="w-6 h-6 text-yellow-600 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span className="font-medium text-yellow-700">Suggestie</span>
                            </button>

                            <button
                                onClick={() => showToast('Bedankt voor je reactie! 💬', 'info')}
                                className="flex items-center justify-center gap-3 p-4 bg-white hover:bg-muted-rose/70 rounded-2xl border border-muted-rose hover:border-accent transition-all duration-300 group"
                            >
                                <svg className="w-6 h-6 text-accent group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="font-medium text-primary">Reageer</span>
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-accent mb-4">
                                💡 <strong>Pro tip:</strong> Gebruik de snelle navigatie in de zijbalk om direct naar interessante secties te springen!
                            </p>
                        </div>
                    </div>

                    {/* Internal Links - Related Content */}
                    <div className="mt-16 mb-8">
                        <h3 className="font-display text-2xl font-bold text-primary mb-6 text-center">
                            📌 Ontdek meer op Gifteez
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <InternalLinkCTA
                                to="/giftfinder"
                                title="🎁 AI GiftFinder"
                                description="Vind binnen 30 seconden het perfecte cadeau met onze slimme AI tool. Vul je budget, gelegenheid en interesses in voor gepersonaliseerde suggesties."
                                icon="🤖"
                                variant="primary"
                            />
                            <InternalLinkCTA
                                to="/deals"
                                title="🔥 Beste Deals"
                                description="Bekijk dagelijks de beste cadeau deals van Coolblue en Amazon. Van tech gadgets tot lifestyle producten met de hoogste korting."
                                icon="💰"
                                variant="accent"
                            />
                        </div>
                    </div>

                    {/* Newsletter Signup Section */}
                    <div className="mt-16 relative overflow-hidden rounded-3xl shadow-2xl bg-purple-800" data-newsletter-section>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-700 to-purple-600 opacity-95"></div>
                        <div className="relative p-8 md:p-12 text-center text-white">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                                    <MailIcon className="w-8 h-8 text-white" aria-hidden="true" />
                                </div>
                                <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">Blijf op de hoogte van de beste cadeaus</h2>
                                <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-8">
                                    Ontvang wekelijks de nieuwste cadeau-ideeën, aanbiedingen en tips rechtstreeks in je inbox.
                                </p>
                                <form 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.target as HTMLFormElement);
                                        const email = formData.get('email') as string;
                                        
                                        if (!email || !email.includes('@')) {
                                            showToast('Voer een geldig e-mailadres in', 'error');
                                            return;
                                        }
                                        
                                        // Simulate newsletter signup
                                        showToast('Bedankt voor je aanmelding! Je ontvangt binnenkort onze beste cadeau-tips.', 'success');
                                        (e.target as HTMLFormElement).reset();
                                    }}
                                    className="max-w-md mx-auto"
                                    aria-labelledby="newsletter-heading"
                                >
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <label htmlFor="newsletter-email" className="sr-only">E-mailadres</label>
                                        <input
                                            id="newsletter-email"
                                            name="email"
                                            type="email"
                                            placeholder="jouw@email.nl"
                                            required
                                            aria-describedby="email-help"
                                            className="flex-1 px-4 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                                        />
                                        <button 
                                            type="submit"
                                            className="bg-white text-purple-600 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-purple-600"
                                            aria-describedby="submit-help"
                                        >
                                            Aanmelden
                                        </button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center justify-between mt-3 text-white/70 text-sm gap-2">
                                        <span id="email-help">Geen spam, je kunt je altijd eenvoudig afmelden.</span>
                                        <span id="submit-help" className="sr-only">Klik om je aan te melden voor onze nieuwsbrief</span>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Sticky Table of Contents Sidebar */}
                {headings.length > 1 && (
                    <aside className="hidden lg:block lg:col-span-4" aria-label="Inhoudsopgave navigatie">
                        <div className="sticky top-28">
                            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <SparklesIcon className="w-6 h-6 text-accent" aria-hidden="true" />
                                    <h3 className="font-display text-xl font-bold text-primary">Inhoudsopgave</h3>
                                </div>
                                <nav aria-label="Artikel secties">
                                    <ol className="space-y-3" role="list">
                                        {headings.map((heading, i) => (
                                            <li key={i} role="listitem">
                                                <a 
                                                    href={`#${slugify(heading.content)}`} 
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted-rose/70 transition-colors duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                                                    aria-describedby={`sidebar-heading-${i}-description`}
                                                >
                                                    <span className="w-6 h-6 bg-muted-rose text-accent rounded-full flex items-center justify-center text-xs font-bold group-hover:bg-accent group-hover:text-white transition-colors duration-300" aria-hidden="true">
                                                        {i + 1}
                                                    </span>
                                                    <span className="font-medium text-gray-700 group-hover:text-accent transition-colors duration-300 text-sm leading-tight">
                                                        {heading.content}
                                                    </span>
                                                </a>
                                                <span id={`sidebar-heading-${i}-description`} className="sr-only">Spring naar sectie {heading.content}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </nav>
                                
                                {/* Reading Progress */}
                                <div className="mt-8 pt-6 border-t border-gray-100" aria-label="Leesvoortgang">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-gray-600">Leesvoortgang</span>
                                        <span className="text-sm font-bold text-accent" aria-live="polite">{Math.round(scrollProgress)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={Math.round(scrollProgress)} aria-valuemin={0} aria-valuemax={100}>
                                        <div 
                                            className="bg-gradient-to-r from-accent to-accent-hover h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${scrollProgress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Quick Navigation */}
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-800 mb-3">Snelle navigatie</h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => document.getElementById('toc-heading')?.scrollIntoView({ behavior: 'smooth' })}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-accent hover:bg-muted-rose/70 rounded-lg transition-colors duration-200"
                                        >
                                            📋 Inhoudsopgave
                                        </button>
                                        <button
                                            onClick={() => document.querySelector('[data-author-section]')?.scrollIntoView({ behavior: 'smooth' })}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-accent hover:bg-muted-rose/70 rounded-lg transition-colors duration-200"
                                        >
                                            👤 Over auteur
                                        </button>
                                        <button
                                            onClick={() => document.querySelector('[data-newsletter-section]')?.scrollIntoView({ behavior: 'smooth' })}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-accent hover:bg-muted-rose/70 rounded-lg transition-colors duration-200"
                                        >
                                            📧 Nieuwsbrief
                                        </button>
                                        <button
                                            onClick={() => document.querySelector('[data-comments-section]')?.scrollIntoView({ behavior: 'smooth' })}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-accent hover:bg-muted-rose/70 rounded-lg transition-colors duration-200"
                                        >
                                            💬 Reacties
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* Jump to Top Button */}
            {showJumpToTop && (
                <button
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="fixed bottom-8 right-8 bg-gradient-to-r from-accent to-accent-hover text-white p-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 z-50 group"
                    aria-label="Terug naar boven"
                >
                    <ChevronRightIcon className="w-6 h-6 transform rotate-[-90deg] group-hover:rotate-[-90deg] group-hover:scale-110 transition-transform duration-300" />
                </button>
            )}
            {/* Related Guides */}
            <section className="mt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-primary mb-8 flex items-center gap-3">
                        <SparklesIcon className="w-7 h-7 text-accent" />
                        Gerelateerde Gidsen
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {posts.filter(p => p.slug !== post.slug).slice(0,2).map(rel => (
                            <div 
                                key={rel.slug} 
                                onClick={() => navigateTo('blogDetail', { slug: rel.slug })}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden group border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                            >
                                <div className="overflow-hidden h-40">
                                    <ImageWithFallback src={rel.imageUrl} alt={rel.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-5 flex flex-col h-full">
                                    <span className="inline-block text-[11px] font-semibold tracking-wide px-2 py-1 bg-muted-rose text-accent rounded-full mb-3 uppercase">{rel.category}</span>
                                    <h4 className="font-display text-lg font-bold text-primary leading-snug line-clamp-2 mb-3">{rel.title}</h4>
                                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{rel.excerpt}</p>
                                    <div className="mt-auto inline-flex items-center gap-2 text-accent font-semibold text-sm group-hover:underline underline-offset-4">
                                        Lees meer <ChevronRightIcon className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="bg-gradient-to-br from-accent to-accent-hover rounded-2xl p-6 flex flex-col justify-center text-white shadow-lg">
                            <h4 className="font-display text-xl font-bold mb-3">Meer Cadeau Inspiratie?</h4>
                            <p className="text-sm text-secondary mb-4 leading-relaxed">Gebruik onze AI GiftFinder voor een persoonlijke lijst cadeau ideeën – sneller kiezen, beter geven.</p>
                            <button onClick={() => navigateTo('giftFinder', {})} className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold transition-colors">
                                Start GiftFinder <TargetIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
  );
};

export default BlogDetailPage;