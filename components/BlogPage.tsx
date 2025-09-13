import React, { useState, useMemo, useEffect } from 'react';
import { Container } from './layout/Container';
import { BlogPost, NavigateTo } from '../types';
import { blogPosts } from '../data/blogData';
import { SearchIcon, BookOpenIcon, CalendarIcon, UserIcon, SparklesIcon, MenuIcon, TargetIcon } from './IconComponents';
import ImageWithFallback from './ImageWithFallback';
import { NewsletterSignup } from './NewsletterSignup';
import Card from './Card';

const BlogCard: React.FC<{ post: BlogPost; navigateTo: NavigateTo; isFeatured?: boolean; }> = ({ post, navigateTo, isFeatured = false }) => {
    const formattedDate = new Date(post.publishedDate).toLocaleDateString('nl-NL', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const readingTime = Math.ceil(post.excerpt.split(' ').length / 200); // Rough estimate

        return (
                <Card
                    as="article"
                    variant={isFeatured ? 'highlight' : 'interactive'}
                    className={`rounded-3xl overflow-hidden flex flex-col group ${isFeatured ? 'md:col-span-2 lg:col-span-2' : ''}`}
                >
            <div className="relative overflow-hidden cursor-pointer" onClick={() => navigateTo('blogDetail', { slug: post.slug })}>
                <ImageWithFallback
                    src={post.imageUrl}
                    alt={post.title}
                    className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${isFeatured ? 'h-64 md:h-80' : 'h-48'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg backdrop-blur-sm">
                        {post.category}
                    </span>
                </div>

                {/* Reading Time */}
                <div className="absolute top-4 right-4">
                    <div className="bg-black/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {readingTime} min
                    </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <TargetIcon className="w-6 h-6 text-primary" />
                    </div>
                </div>
            </div>

            <div className={`p-6 flex flex-col flex-grow ${isFeatured ? 'md:p-8' : ''}`}>
                <h3 className={`font-display font-bold text-primary mt-2 flex-grow leading-tight group-hover:text-emerald-600 transition-colors duration-300 ${isFeatured ? 'text-xl md:text-2xl' : 'text-lg'}`}>
                    <button
                        onClick={() => navigateTo('blogDetail', { slug: post.slug })}
                        className="text-left hover:underline decoration-2 underline-offset-4"
                    >
                        {post.title}
                    </button>
                </h3>

                <p className={`mt-3 text-gray-600 leading-relaxed ${isFeatured ? 'text-base' : 'line-clamp-3 text-sm'}`}>
                    {post.excerpt}
                </p>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ImageWithFallback
                            src={post.author.avatarUrl}
                            alt={post.author.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">{post.author.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <CalendarIcon className="w-3 h-3" />
                                <span>{formattedDate}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigateTo('blogDetail', { slug: post.slug })}
                        className="inline-flex items-center gap-2 text-primary hover:text-emerald-600 font-semibold text-sm transition-colors duration-300 group"
                    >
                        <span>Lees meer</span>
                        <BookOpenIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                </div>
            </div>
        </Card>
    );
};

const FeaturedBlogCard: React.FC<{ post: BlogPost; navigateTo: NavigateTo; }> = ({ post, navigateTo }) => {
    const formattedDate = new Date(post.publishedDate).toLocaleDateString('nl-NL', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <Card as="article" variant="highlight" className="rounded-3xl overflow-hidden lg:grid lg:grid-cols-5">
            <div className="relative lg:col-span-3 overflow-hidden">
                <ImageWithFallback
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-64 lg:h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                {/* Featured Badge */}
                <div className="absolute top-6 left-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg animate-pulse">
                        <SparklesIcon className="w-4 h-4" />
                        UITGELICHT
                    </div>
                </div>

                {/* Category */}
                <div className="absolute bottom-6 left-6">
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {post.category}
                    </span>
                </div>
            </div>

            <div className="lg:col-span-2 p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                    <SparklesIcon className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Trending</span>
                </div>

                <h2 className="font-display text-2xl lg:text-3xl font-bold text-primary mb-4 leading-tight group-hover:text-emerald-600 transition-colors duration-300">
                    {post.title}
                </h2>

                <p className="text-gray-600 leading-relaxed text-base mb-6 line-clamp-3">
                    {post.excerpt}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                    <ImageWithFallback
                        src={post.author.avatarUrl}
                        alt={post.author.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div>
                        <p className="font-bold text-gray-900">{post.author.name}</p>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formattedDate}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigateTo('blogDetail', { slug: post.slug })}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                >
                    <span>Lees de volledige gids</span>
                    <BookOpenIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
            </div>
        </Card>
    );
};


const BlogPage: React.FC<{ navigateTo: NavigateTo; }> = ({ navigateTo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAuthor, setSelectedAuthor] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const title = 'Cadeaugidsen & Blog — Gifteez.nl';
        const description = 'Inspiratie, tips en de beste cadeau-ideeën voor elke gelegenheid. Ontdek onze nieuwste cadeaugidsen op Gifteez.';
        document.title = title;
        const ensure = (selector: string, create: () => HTMLElement) => {
            let el = document.head.querySelector(selector) as HTMLElement | null;
            if (!el) { el = create(); document.head.appendChild(el); }
            return el;
        };
        const metaDesc = ensure('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' }));
        metaDesc.setAttribute('content', description);
        const canonical = ensure('link[rel="canonical"]', () => { const l = document.createElement('link'); l.setAttribute('rel','canonical'); return l; });
        canonical.setAttribute('href', window.location.origin + '/blog');
        // ItemList structured data
        // Structured data tuned: previously sliced to 25; now fully dynamic for current post set (September 2025 cleanup)
        const itemList = {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            'name': 'Cadeaugidsen',
            'itemListElement': blogPosts.map((p, i) => ({
                '@type': 'ListItem',
                'position': i + 1,
                'url': window.location.origin + '/blog/' + p.slug,
                'name': p.title
            }))
        };
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.innerHTML = JSON.stringify(itemList);
        document.head.appendChild(script);
        return () => { document.head.removeChild(script); };
    }, []);

  const categories = useMemo(() => ['All', ...new Set(blogPosts.map(p => p.category))], []);
  const authors = useMemo(() => ['All', ...new Set(blogPosts.map(p => p.author.name))], []);
  const years = useMemo(() => {
    const allYears = new Set(blogPosts.map(p => new Date(p.publishedDate).getFullYear().toString()));
    const sortedYears = Array.from(allYears).sort((a, b) => Number(b) - Number(a));
    return ['All', ...sortedYears];
  }, []);

  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  const filteredPosts = useMemo(() => {
    return otherPosts
      .filter(post => selectedCategory === 'All' || post.category === selectedCategory)
      .filter(post => selectedAuthor === 'All' || post.author.name === selectedAuthor)
      .filter(post => selectedYear === 'All' || new Date(post.publishedDate).getFullYear().toString() === selectedYear)
      .filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, selectedCategory, selectedAuthor, selectedYear]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedAuthor('All');
    setSelectedYear('All');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
        {/* Hero Section */}
    <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,#10b98122,transparent_70%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-emerald-50/50" />
            {/* Background decorative elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
                <div className="absolute top-1/4 right-20 w-24 h-24 bg-white rounded-full"></div>
                <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full"></div>
                <div className="absolute bottom-10 right-10 w-20 h-20 bg-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full opacity-5"></div>
            </div>

            <Container size="xl" className="py-20 md:py-28 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-600 text-white rounded-2xl mb-8 shadow-xl ring-4 ring-emerald-500/20">
                        <BookOpenIcon className="w-12 h-12" />
                    </div>
                    <h1 className="typo-h1 mb-6 leading-[1.05] text-slate-900">
                        Cadeau <span className="text-emerald-600">Inspiratie</span>
                    </h1>
                    <p className="typo-lead text-slate-600 max-w-3xl mx-auto mb-10">
                        Jouw bron voor inspiratie, tips en de beste cadeau-ideeën voor elke gelegenheid. Ontdek onze nieuwste cadeaugidsen.
                    </p>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                        {[{label:'Cadeaugidsen',value:blogPosts.length},{label:'Categorieën',value:categories.length-1},{label:'Experts',value:authors.length-1},{label:'Inspiratie',value:'24/7'}].map(stat => (
                          <div key={stat.label} className="rounded-2xl p-5 bg-white shadow-sm ring-1 ring-emerald-100/60">
                            <div className="text-2xl md:text-3xl font-bold text-emerald-600">{stat.value}</div>
                            <div className="text-sm text-slate-500">{stat.label}</div>
                          </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700">
                          <BookOpenIcon className="w-4 h-4" /> Gratis Gidsen
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700">
                          <SparklesIcon className="w-4 h-4" /> Expert Tips
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700">
                          <UserIcon className="w-4 h-4" /> Voor Iedereen
                        </div>
                    </div>
                </div>
            </Container>
        </section>

        <Container size="xl" className="py-16">
            {/* Featured Post */}
            <section className="mb-20">
                <FeaturedBlogCard post={featuredPost} navigateTo={navigateTo} />
            </section>

            {/* Filters and Search */}
            <section className="mb-16">
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100">
                    <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                        <div className="flex flex-wrap gap-3 items-center">
                            <span className="font-semibold text-primary mr-2">Categorieën:</span>
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
                                        selectedCategory === category
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-gray-500" />
                                <select
                                    aria-label="Filter op auteur"
                                    value={selectedAuthor}
                                    onChange={e => setSelectedAuthor(e.target.value)}
                                    className="py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm text-sm"
                                >
                                    {authors.map(author => (
                                        <option key={author} value={author}>{author === 'All' ? 'Alle Auteurs' : author}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-gray-500" />
                                <select
                                    aria-label="Filter op publicatiejaar"
                                    value={selectedYear}
                                    onChange={e => setSelectedYear(e.target.value)}
                                    className="py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm text-sm"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year === 'All' ? 'Alle Jaren' : year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <input
                                    type="search"
                                    placeholder="Zoek in gidsen..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-12 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm w-64"
                                    aria-label="Zoek in gidsen"
                                />
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                            </div>

                            {(searchQuery || selectedCategory !== 'All' || selectedAuthor !== 'All' || selectedYear !== 'All') && (
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-full text-sm transition-colors duration-300"
                                >
                                    <span>Wis filters</span>
                                    <MenuIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <main>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post) => (
                        <BlogCard key={post.slug} post={post} navigateTo={navigateTo} />
                    ))}
                </div>
                {filteredPosts.length === 0 && (
                    <div className="col-span-full text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <SearchIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-lg font-semibold">Geen gidsen gevonden.</p>
                        <p className="text-gray-500 mt-1">Probeer een andere categorie of zoekterm.</p>
                    </div>
                )}
            </main>

            {/* Newsletter Signup Section */}
            <section className="my-16">
                <NewsletterSignup 
                    variant="inline" 
                    className="max-w-2xl mx-auto"
                />
            </section>
    </Container>
    </div>
  );
};

export default BlogPage;