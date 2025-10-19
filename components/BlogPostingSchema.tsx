import React from 'react';
import { BlogPost } from '../types';

interface BlogPostingSchemaProps {
  post: BlogPost;
}

const BlogPostingSchema: React.FC<BlogPostingSchemaProps> = ({ post }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || post.metaDescription || post.title,
    "image": post.image ? [
      `https://gifteez.nl${post.image}`
    ] : [],
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": "Gifteez Team",
      "url": "https://gifteez.nl/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Gifteez",
      "logo": {
        "@type": "ImageObject",
        "url": "https://gifteez.nl/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://gifteez.nl/blog/${post.slug}`
    },
    "articleSection": post.category || "Cadeaus",
    "keywords": post.tags?.join(', ') || "cadeaus, cadeau-ideeën, gifteez",
    "wordCount": post.content?.length || 0,
    "articleBody": post.excerpt || ""
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default BlogPostingSchema;
