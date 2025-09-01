
import React, { useEffect } from 'react';
import { BlogPost, NavigateTo, Gift, ContentBlock, ShowToast, ComparisonTableBlock, ProsConsBlock, VerdictBlock } from '../types';
import { blogPosts } from '../data/blogData';
import { CalendarIcon, ChevronRightIcon, FacebookIcon, TwitterIcon, WhatsAppIcon, CheckIcon, XCircleIcon, StarIcon } from './IconComponents';
import GiftResultCard from './GiftResultCard';
import AmazonTeaser from './AmazonTeaser';

interface BlogDetailPageProps {
  post: BlogPost;
  navigateTo: NavigateTo;
  showToast: ShowToast;
}

const BlogCardSmall: React.FC<{ post: BlogPost; navigateTo: NavigateTo; }> = ({ post, navigateTo }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer flex gap-4" onClick={() => navigateTo('blogDetail', { slug: post.slug })}>
        <div className="overflow-hidden w-1/3">
            <img src={post.imageUrl} alt={post.title} className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"/>
        </div>
        <div className="p-2 w-2/3">
            <h4 className="font-display text-md font-bold text-primary line-clamp-2">{post.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{post.category}</p>
        </div>
    </div>
);

const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ post, navigateTo, showToast }) => {
    
  useEffect(() => {
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
                "url": "https://picsum.photos/seed/logo/200/60" // Placeholder logo
            }
        },
        "datePublished": post.publishedDate,
        "dateModified": post.publishedDate
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);

        const ensure = (selector: string, create: () => HTMLElement) => {
            let el = document.head.querySelector(selector) as HTMLElement | null;
            if (!el) { el = create(); document.head.appendChild(el); }
            return el;
        };

        const metaDesc = ensure('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' }));
        metaDesc.setAttribute('content', post.excerpt);

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
        // Twitter
        const twCard = setMeta('name', 'twitter:card', 'summary_large_image');
        const twTitle = setMeta('name', 'twitter:title', `${post.title} — Gifteez.nl`);
        const twDesc = setMeta('name', 'twitter:description', post.excerpt);
        const twImage = setMeta('name', 'twitter:image', post.imageUrl);


    return () => {
      document.head.removeChild(script);
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
    
  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch(block.type) {
        case 'heading':
            return <h2 key={index} id={slugify(block.content)} className="scroll-mt-24">{block.content}</h2>
        case 'paragraph':
            return <p key={index}>{block.content}</p>
        case 'gift':
            return <div key={index} className="my-8"><GiftResultCard gift={block.content} index={index} showToast={showToast} isEmbedded={true}/></div>
        case 'comparisonTable':
            const tableBlock = block as ComparisonTableBlock;
            return (
                <div key={index} className="my-8 overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 border-collapse">
                        <thead className="text-xs text-primary uppercase bg-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3 border border-gray-300">Specificatie</th>
                                {tableBlock.headers.map((header, i) => (
                                    <th key={i} scope="col" className="px-6 py-3 border border-gray-300 text-center">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableBlock.rows.map((row, i) => (
                                <tr key={i} className="bg-white border-b">
                                    <th scope="row" className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap border border-gray-300">{row.feature}</th>
                                    {row.values.map((value, j) => (
                                        <td key={j} className="px-6 py-4 border border-gray-300 text-center">{value}</td>
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
                <div key={index} className={`my-8 grid grid-cols-1 md:grid-cols-${prosConsBlock.items.length} gap-6`}>
                    {prosConsBlock.items.map((item, i) => (
                        <div key={i}>
                            <h4 className="font-display font-bold text-lg text-primary mb-4 text-center">{item.title}</h4>
                            <div className="space-y-4">
                                <div>
                                    <h5 className="font-bold text-green-600 mb-2">Pluspunten</h5>
                                    <ul className="space-y-2">
                                        {item.pros.map((pro, j) => (
                                            <li key={j} className="flex items-start gap-2">
                                                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">{pro}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-red-600 mb-2">Minpunten</h5>
                                    <ul className="space-y-2">
                                        {item.cons.map((con, j) => (
                                            <li key={j} className="flex items-start gap-2">
                                                <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">{con}</span>
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
                <div key={index} className="my-10 p-6 bg-secondary border-l-4 border-accent rounded-r-lg">
                    <div className="flex items-center gap-3">
                        <StarIcon className="w-8 h-8 text-accent"/>
                        <h3 className="font-display text-2xl font-bold text-primary">{verdictBlock.title}</h3>
                    </div>
                    <p className="mt-3 text-gray-800 leading-relaxed">{verdictBlock.content}</p>
                </div>
            )
    }
  }

  const formattedDate = new Date(post.publishedDate).toLocaleDateString('nl-NL', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="bg-light-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav aria-label="Breadcrumb" className="mb-8">
                <ol className="flex items-center gap-1 text-sm text-gray-600">
                    <li><button onClick={() => navigateTo('home')} className="hover:text-primary transition-colors">Home</button></li>
                    <li><ChevronRightIcon className="w-4 h-4" /></li>
                    <li><button onClick={() => navigateTo('blog')} className="hover:text-primary transition-colors">Blog</button></li>
                    <li><ChevronRightIcon className="w-4 h-4" /></li>
                    <li><span className="font-medium text-gray-800 line-clamp-1" aria-current="page">{post.title}</span></li>
                </ol>
            </nav>

            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                <main className="lg:col-span-8">
                    <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg">
                        <header>
                            <p className="text-sm font-bold text-accent">{post.category.toUpperCase()}</p>
                            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mt-2">{post.title}</h1>
                            <div className="flex items-center gap-x-6 mt-6 text-sm text-gray-600 border-b pb-6">
                                <div className="flex items-center gap-2">
                                    <img src={post.author.avatarUrl} alt={post.author.name} className="w-10 h-10 rounded-full object-cover"/>
                                    <span className="font-semibold">{post.author.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5"/>
                                    <time dateTime={post.publishedDate}>{formattedDate}</time>
                                </div>
                            </div>
                        </header>

                        <div className="w-full my-8 rounded-lg overflow-hidden">
                            <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover"/>
                        </div>
                        
                        {headings.length > 1 && (
                            <nav className="p-6 bg-secondary rounded-lg my-8" aria-labelledby="toc-heading">
                                <h2 id="toc-heading" className="font-display font-bold text-primary text-xl mb-3">In dit artikel</h2>
                                <ol className="space-y-2 list-decimal list-inside">
                                    {headings.map((heading, i) => (
                                        <li key={i}>
                                            <a href={`#${slugify(heading.content)}`} className="font-semibold text-primary hover:text-accent hover:underline transition-colors">
                                                {heading.content}
                                            </a>
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        )}
                        
                        <article className="prose prose-lg lg:prose-xl max-w-none text-gray-700 prose-headings:font-display prose-headings:text-primary prose-p:leading-relaxed">
                            {post.content.map(renderContentBlock)}
                        </article>
                    </div>
                </main>

                <aside className="lg:col-span-4 mt-12 lg:mt-0">
                    <div className="space-y-8 sticky top-28">
                        {/* Share box */}
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="font-display text-xl font-bold text-primary mb-4">Deel deze gids</h3>
                            <div className="flex justify-center space-x-3">
                                {socialLinks.map(social => (
                                    <a 
                                        key={social.name}
                                        href={social.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        aria-label={`Share this article on ${social.name}`}
                                        className="p-3 bg-secondary rounded-full text-primary hover:bg-primary hover:text-white transition-colors"
                                    >
                                        <social.icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Related Articles */}
                        {relatedPosts.length > 0 && (
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="font-display text-xl font-bold text-primary mb-4">Gerelateerde Gidsen</h3>
                                <div className="space-y-4">
                                    {relatedPosts.map(related => (
                                        <BlogCardSmall key={related.slug} post={related} navigateTo={navigateTo} />
                                    ))}
                                </div>
                            </div>
                        )}

                                                {/* Amazon teaser (no API required) */}
                                                <div className="bg-white p-6 rounded-lg shadow-lg">
                                                    <AmazonTeaser
                                                        items={[
                                                            { title: 'JBL Tune 510BT On‑Ear Koptelefoon', imageUrl: 'https://m.media-amazon.com/images/I/61ZP0edkQwL._AC_SL1500_.jpg', affiliateUrl: 'https://www.amazon.nl/dp/B08VJDLPG3?tag=gifteez77-21' },
                                                            { title: 'Rituals Sakura Gift Set', imageUrl: 'https://m.media-amazon.com/images/I/71CH1Ejh1cL._AC_SL1500_.jpg', affiliateUrl: 'https://www.amazon.nl/dp/B07W7J5Z5J?tag=gifteez77-21' }
                                                        ]}
                                                        note="Amazon‑links werken zonder API. Tag ingesteld: gifteez77-21."
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