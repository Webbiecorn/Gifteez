import React, { useState, useMemo, useEffect } from 'react';
import { BlogPost, NavigateTo } from '../types';
import { blogPosts } from '../data/blogData';
import { SearchIcon } from './IconComponents';

const BlogCard: React.FC<{ post: BlogPost; navigateTo: NavigateTo; }> = ({ post, navigateTo }) => {
    const formattedDate = new Date(post.publishedDate).toLocaleDateString('nl-NL', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    return (
        <article className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transition-transform duration-300 hover:-translate-y-1">
            <div className="overflow-hidden cursor-pointer" onClick={() => navigateTo('blogDetail', { slug: post.slug })}>
                <img src={post.imageUrl} alt={post.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <p className="text-sm font-bold text-primary">{post.category.toUpperCase()}</p>
                <h3 className="font-display text-2xl font-bold text-primary mt-2 flex-grow">
                    <button onClick={() => navigateTo('blogDetail', { slug: post.slug })} className="text-left hover:text-accent transition-colors duration-200">{post.title}</button>
                </h3>
                <p className="mt-2 text-gray-600 line-clamp-3">{post.excerpt}</p>
                 <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-500">
                    <img src={post.author.avatarUrl} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <p className="font-bold text-gray-700">{post.author.name}</p>
                        <p>{formattedDate}</p>
                    </div>
                </div>
            </div>
        </article>
    );
};

const FeaturedBlogCard: React.FC<{ post: BlogPost; navigateTo: NavigateTo; }> = ({ post, navigateTo }) => {
    const formattedDate = new Date(post.publishedDate).toLocaleDateString('nl-NL', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    return (
        <article className="bg-white rounded-lg shadow-xl overflow-hidden md:grid md:grid-cols-2 group" >
            <div className="overflow-hidden">
                <img src={post.imageUrl} alt={post.title} className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
            </div>
            <div className="p-8 flex flex-col justify-center">
                <p className="text-sm font-bold text-accent">UITGELICHT</p>
                <h2 className="font-display text-3xl font-bold text-primary mt-2">{post.title}</h2>
                <p className="mt-4 text-gray-600">{post.excerpt}</p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-600">
                     <img src={post.author.avatarUrl} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <p className="font-bold text-gray-700">{post.author.name}</p>
                        <p>{formattedDate}</p>
                    </div>
                </div>
                <button onClick={() => navigateTo('blogDetail', { slug: post.slug })} className="mt-6 font-bold text-primary group-hover:text-accent transition-colors text-left">
                    Lees de volledige gids →
                </button>
            </div>
        </article>
    );
};


const BlogPage: React.FC<{ navigateTo: NavigateTo; }> = ({ navigateTo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAuthor, setSelectedAuthor] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  useEffect(() => {
    const pageDescription = "Jouw bron voor inspiratie, tips en de beste cadeau-ideeën voor elke gelegenheid. Perfect voorbereid met de gidsen van Gifteez.";
    const schema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Onze Cadeaugidsen & Blogs - Gifteez.nl",
      "description": pageDescription,
      "url": window.location.href,
      "publisher": {
        "@type": "Organization",
        "name": "Gifteez.nl"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);

    const metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    metaDesc.content = pageDescription;
    document.head.appendChild(metaDesc);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(metaDesc);
    };
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

  const selectClasses = "p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white transition";

  return (
    <div className="bg-light-bg">
        <section className="bg-secondary py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-primary">Onze Cadeaugidsen & Blogs</h1>
                <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">Jouw bron voor inspiratie, tips en de beste cadeau-ideeën voor elke gelegenheid.</p>
            </div>
        </section>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Featured Post */}
            <section className="mb-16 animate-fade-in">
                <FeaturedBlogCard post={featuredPost} navigateTo={navigateTo} />
            </section>

            {/* Filters and Search */}
            <section className="mb-12 p-6 bg-white rounded-lg shadow-md sticky top-24 z-40 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex flex-wrap gap-x-6 gap-y-4 items-center">
                        <div className="flex flex-wrap gap-2 items-center">
                            {categories.map(category => (
                                <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`py-2 px-4 rounded-full text-sm font-bold transition-colors ${
                                    selectedCategory === category
                                    ? 'bg-primary text-white shadow'
                                    : 'bg-gray-100 text-primary hover:bg-secondary'
                                }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-4 items-center">
                             <select
                                aria-label="Filter op auteur"
                                value={selectedAuthor}
                                onChange={e => setSelectedAuthor(e.target.value)}
                                className={selectClasses}
                            >
                                {authors.map(author => (
                                    <option key={author} value={author}>{author === 'All' ? 'Alle Auteurs' : author}</option>
                                ))}
                            </select>
                             <select
                                aria-label="Filter op publicatiejaar"
                                value={selectedYear}
                                onChange={e => setSelectedYear(e.target.value)}
                                className={selectClasses}
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year === 'All' ? 'Alle Jaren' : year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <input
                        type="search"
                        placeholder="Zoek in gidsen..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                        aria-label="Zoek in gidsen"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
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
                        <p className="text-gray-600 text-lg font-semibold">Geen gidsen gevonden.</p>
                        <p className="text-gray-500 mt-1">Probeer een andere categorie of zoekterm.</p>
                    </div>
                )}
            </main>
        </div>
    </div>
  );
};

export default BlogPage;