
import React, { useEffect, useState } from 'react';
import ImageWithFallback from './ImageWithFallback';
import { BlogPost, NavigateTo, Gift, ContentBlock, ShowToast, ComparisonTableBlock, ProsConsBlock, VerdictBlock } from '../types';
import { blogPosts } from '../data/blogData';
import { CalendarIcon, ChevronRightIcon, FacebookIcon, TwitterIcon, WhatsAppIcon, CheckIcon, XCircleIcon, StarIcon, BookOpenIcon, SparklesIcon, TargetIcon, ShareIcon } from './IconComponents';
import GiftResultCard from './GiftResultCard';
import AmazonTeaser from './AmazonTeaser';

interface BlogDetailPageProps {
  post: BlogPost;
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

const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ post, navigateTo, showToast }) => {
    // User toggle for hero image fit mode
    const [heroFitMode, setHeroFitMode] = useState<'contain' | 'cover'>(() => {
        const stored = localStorage.getItem('gifteezHeroFit');
        return stored === 'cover' ? 'cover' : 'contain';
    });
    // Global apply to all in-article images (future-proof; currently only hero uses contain/cover)
    const [globalImageFit, setGlobalImageFit] = useState<'contain' | 'cover'>(() => {
        const stored = localStorage.getItem('gifteezGlobalImageFit');
        return stored === 'contain' ? 'contain' : 'cover';
    });

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
    
    useEffect(() => {
        document.title = `${post.title} — Gifteez.nl`;
        const ensure = (selector: string, create: () => HTMLElement) => {
            let el = document.head.querySelector(selector) as HTMLElement | null;
            if (!el) { el = create(); document.head.appendChild(el); }
            return el;
        };
        const metaDesc = ensure('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' }));
        metaDesc.setAttribute('content', post.excerpt);
        const canonical = ensure('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel='canonical'; return l; });
        canonical.setAttribute('href', window.location.origin + '/blog/' + post.slug);
    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
        },
        "headline": post.title,
        "description": post.excerpt,
        "image": post.imageUrl,
        "author": {
            "@type": "Person",
            "name": post.author.name,
            "image": post.author.avatarUrl
        },
        "publisher": {
            "@type": "Organization",
            "name": "Gifteez.nl",
            "logo": {
                "@type": "ImageObject",
                "url": "https://gifteez.nl/android-chrome-512x512.png"
            }
        },
        "datePublished": post.publishedDate,
        "dateModified": post.publishedDate
    };
    
        const script = document.createElement('script'); script.type='application/ld+json'; script.innerHTML=JSON.stringify(schema); document.head.appendChild(script);
        const breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
                { '@type': 'ListItem', position: 1, name: 'Home', item: window.location.origin + '/' },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: window.location.origin + '/blog' },
                { '@type': 'ListItem', position: 3, name: post.title, item: window.location.origin + '/blog/' + post.slug }
            ]
        };
        const breadcrumbScript = document.createElement('script'); breadcrumbScript.type='application/ld+json'; breadcrumbScript.innerHTML = JSON.stringify(breadcrumbSchema); document.head.appendChild(breadcrumbScript);
    // (Duplicate ensure/metaDesc removed – initial definitions above reused here)

        const url = window.location.href;
        const setMeta = (attr: 'name'|'property', key: string, content: string) => {
            const sel = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`;
            const el = ensure(sel, () => { const m = document.createElement('meta'); m.setAttribute(attr, key); return m; });
            el.setAttribute('content', content);
            return el;
        };
        // Open Graph
        const ogTitle = setMeta('property', 'og:title', `${post.title} — Gifteez.nl`);
        const ogDesc = setMeta('property', 'og:description', post.excerpt);
        const ogType = setMeta('property', 'og:type', 'article');
        const ogUrl = setMeta('property', 'og:url', url);
        const ogImage = setMeta('property', 'og:image', post.imageUrl);
    // Extra Open Graph image metadata (helps some scrapers)
    setMeta('property', 'og:image:alt', post.title);
    setMeta('property', 'og:image:type', 'image/png');
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '1200');
        // Twitter
        const twCard = setMeta('name', 'twitter:card', 'summary_large_image');
        const twTitle = setMeta('name', 'twitter:title', `${post.title} — Gifteez.nl`);
        const twDesc = setMeta('name', 'twitter:description', post.excerpt);
        const twImage = setMeta('name', 'twitter:image', post.imageUrl);
    setMeta('name', 'twitter:image:alt', post.title);


    return () => { document.head.removeChild(script); document.head.removeChild(breadcrumbScript);
            // Don't remove meta tags; allow next page to overwrite. Only JSON-LD is cleaned up.
    };
  }, [post]);

  const shareUrl = window.location.href;
  const shareText = encodeURIComponent(`Bekijk deze cadeaugids op Gifteez.nl: ${post.title}`);

  const socialLinks = [
    { name: 'Facebook', icon: FacebookIcon, url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
    { name: 'Twitter', icon: TwitterIcon, url: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}` },
    { name: 'WhatsApp', icon: WhatsAppIcon, url: `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}` }
  ];

  const relatedPosts = blogPosts.filter(p => p.category === post.category && p.slug !== post.slug).slice(0, 3);
  
  const headings = post.content.filter(block => block.type === 'heading') as {type: 'heading', content: string}[];
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    // Preprocess for earbuds candidate grid
    let earbudsCandidateIndexes: number[] = [];
    if (post.slug === 'vergelijking-draadloze-oordopjes') {
        const headingIdx = post.content.findIndex(b => b.type === 'heading' && b.content === 'De Kandidaten');
        if (headingIdx !== -1) {
            // The next three gift blocks after heading become candidates (defensive filtering)
            for (let i = headingIdx + 1; i < post.content.length; i++) {
                const b = post.content[i];
                if (b.type === 'gift') earbudsCandidateIndexes.push(i);
                else if (b.type === 'heading' && earbudsCandidateIndexes.length < 3) break; // stop early if structure shifts
                if (earbudsCandidateIndexes.length === 3) break;
            }
        }
    }

    const renderContentBlock = (block: ContentBlock, index: number) => {
        const isEarbudsPost = post.slug === 'vergelijking-draadloze-oordopjes';
        if (isEarbudsPost && earbudsCandidateIndexes.includes(index)) {
            // Render grid wrapper only once at first candidate
            if (index === earbudsCandidateIndexes[0]) {
                const candidateBlocks = earbudsCandidateIndexes.map(ci => post.content[ci]) as any[];
                return (
                    <div key={index} className="my-8">
                <div className="grid gap-8 md:grid-cols-3">
                            {candidateBlocks.map((cb, i) => (
                                <GiftResultCard
                                    key={i}
                                    gift={cb.content}
                                    index={i}
                                    showToast={showToast}
                                    isEmbedded={true}
                    imageHeightClass="h-40"
                    imageFit="contain"
                    hideAmazonBadge={true}
                    candidateVariant={true}
                                />
                            ))}
                        </div>
                    </div>
                );
            }
            // Skip rendering for other candidate indices (already rendered)
            return null;
        }

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
                                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                </span>
                            </h2>
                        );
                case 'paragraph':
                        return <p key={index} dangerouslySetInnerHTML={{ __html: block.content }} className="mb-6 text-gray-700 leading-relaxed text-lg" />
                case 'gift':
                        return (
                            <div key={index} className="my-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-100 shadow-lg">
                                <GiftResultCard gift={block.content} index={index} showToast={showToast} isEmbedded={true} />
                            </div>
                        );
        case 'comparisonTable':
            const tableBlock = block as ComparisonTableBlock;
            return (
                <div key={index} className="my-12 overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-100">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-white uppercase bg-gradient-to-r from-blue-600 to-indigo-600">
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
                                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-200`}>
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
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
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
                <div key={index} className="my-12 relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative p-8 md:p-12 text-white">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <StarIcon className="w-8 h-8 text-yellow-300"/>
                            </div>
                            <h3 className="font-display text-3xl md:text-4xl font-bold">{verdictBlock.title}</h3>
                        </div>
                        <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-4xl">{verdictBlock.content}</p>
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
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary via-blue-500 to-indigo-600 text-white overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
                <div className="absolute top-1/4 right-20 w-24 h-24 bg-white rounded-full"></div>
                <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full"></div>
                <div className="absolute bottom-10 right-10 w-20 h-20 bg-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full opacity-5"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                        <BookOpenIcon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4">{post.category}</p>
                    <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        {post.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                        {post.excerpt}
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                            <ImageWithFallback
                                src={post.author.avatarUrl}
                                alt={post.author.name}
                                className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                            />
                            <span className="font-semibold">{post.author.name}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                            <TargetIcon className="w-4 h-4" />
                            <span>~{Math.ceil(post.excerpt.split(' ').length / 200)} min lezen</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                        {/* Featured Image */}
                        <div className="relative overflow-hidden group">
                            <button
                                onClick={toggleHeroFit}
                                className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full text-xs font-semibold text-primary shadow-lg hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105"
                                aria-label={heroFitMode === 'contain' ? 'Vul kader (cover)' : 'Pas in venster (contain)'}
                            >
                                {heroFitMode === 'contain' ? 'Vullen' : 'Inpassen'}
                            </button>
                            <button
                                onClick={toggleGlobalImageFit}
                                className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full text-xs font-semibold text-primary shadow-lg hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105"
                                aria-label={globalImageFit === 'cover' ? 'Alle blogafbeeldingen insluiten (contain)' : 'Alle blogafbeeldingen vullen (cover)'}
                            >
                                {globalImageFit === 'cover' ? 'Alle: Inpassen' : 'Alle: Vullen'}
                            </button>

                            {/* Prefer optimized modern formats if available */}
                            {post.imageUrl.endsWith('.png') ? (
                                <picture>
                                    <source srcSet={post.imageUrl.replace(/\.png$/, '.avif')} type="image/avif" />
                                    <source srcSet={post.imageUrl.replace(/\.png$/, '.webp')} type="image/webp" />
                                    <img src={post.imageUrl} alt={post.title} className={`w-full h-64 md:h-96 object-${heroFitMode} group-hover:scale-105 transition-transform duration-700`} width={1200} height={1200} loading="lazy" />
                                </picture>
                            ) : (
                                <ImageWithFallback src={post.imageUrl} alt={post.title} className="w-full h-64 md:h-96 group-hover:scale-105 transition-transform duration-700" fit={heroFitMode} />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>

                        <div className="p-8 md:p-12">
                            {/* Table of Contents */}
                            {headings.length > 1 && (
                                <nav className="mb-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100" aria-labelledby="toc-heading">
                                    <div className="flex items-center gap-3 mb-4">
                                        <SparklesIcon className="w-6 h-6 text-blue-600" />
                                        <h2 id="toc-heading" className="font-display font-bold text-primary text-xl">In dit artikel</h2>
                                    </div>
                                    <ol className="space-y-3">
                                        {headings.map((heading, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                                <a href={`#${slugify(heading.content)}`} className="font-semibold text-primary hover:text-blue-600 hover:underline transition-colors duration-300">
                                                    {heading.content}
                                                </a>
                                            </li>
                                        ))}
                                    </ol>
                                </nav>
                            )}

                            {/* Article Content */}
                            <article className="prose prose-lg lg:prose-xl max-w-none text-gray-700 prose-headings:font-display prose-headings:text-primary prose-headings:font-bold prose-headings:leading-tight prose-p:leading-relaxed prose-p:mb-6 prose-strong:text-gray-900 prose-strong:font-semibold">
                                {post.content.map(renderContentBlock)}
                            </article>
                        </div>
                    </div>

                    {/* Enhanced Bottom CTA */}
                    <div className="mt-16 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-indigo-600 opacity-90"></div>
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
                </main>

                <aside className="lg:col-span-4 mt-12 lg:mt-0">
                    <div className="space-y-8 sticky top-28">
                        {/* Share Section */}
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                                    <ShareIcon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-display text-xl font-bold text-primary">Deel deze gids</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {socialLinks.map(social => (
                                    <a
                                        key={social.name}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Share this article on ${social.name}`}
                                        className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl text-primary hover:from-blue-600 hover:to-indigo-600 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg group"
                                    >
                                        <social.icon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                                        <span className="text-sm font-semibold">{social.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Related Articles */}
                        {relatedPosts.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                                        <BookOpenIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-display text-xl font-bold text-primary">Gerelateerde Gidsen</h3>
                                </div>
                                <div className="space-y-4">
                                    {relatedPosts.map(related => (
                                        <BlogCardSmall key={related.slug} post={related} navigateTo={navigateTo} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Amazon Teaser */}
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                    <SparklesIcon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-display text-xl font-bold text-primary">Aanbevolen Producten</h3>
                            </div>
                            <AmazonTeaser
                                items={[
                                    { title: 'JBL Tune 510BT On‑Ear Koptelefoon', imageUrl: 'https://m.media-amazon.com/images/I/61ZP0edkQwL._AC_SL1000_.jpg', affiliateUrl: 'https://www.amazon.nl/dp/B08VJDLPG3?tag=gifteez77-21' },
                                    { title: 'Rituals Sakura Gift Set', imageUrl: 'https://m.media-amazon.com/images/I/71CH1Ejh1cL._AC_SL1000_.jpg', affiliateUrl: 'https://www.amazon.nl/dp/B07W7J5Z5J?tag=gifteez77-21' }
                                ]}
                                fallbackImageSrc="/images/amazon-placeholder.png"
                                note="Amazon‑afbeeldingen laden extern; bij 404 tonen we een placeholder."
                            />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    </div>
  );
};

export default BlogDetailPage;