import type { Author, BlogPost, ContentBlock, ImageBlock } from '../types';
import type { BlogPostData } from './blogService';

const stripHtml = (value: string): string => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const encodeUrl = (value: string): string => {
  try {
    return encodeURI(value);
  } catch {
    return value;
  }
};

const buildAnchor = (label: string, href: string): string => {
  const safeLabel = escapeHtml(label);
  const safeHref = encodeUrl(href.trim());
  return `<a href="${safeHref}" class="inline-link font-semibold text-primary hover:text-accent underline underline-offset-2" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`;
};

const injectLinks = (text: string): string => {
  const parts: string[] = [];
  const markdownLink = /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = markdownLink.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(text.slice(lastIndex, match.index)));
    }
    parts.push(buildAnchor(match[1], match[2]));
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(escapeHtml(text.slice(lastIndex)));
  }

  return parts.join('');
};

const buildListHtml = (lines: string[], ordered: boolean): string => {
  const tag = ordered ? 'ol' : 'ul';
  const items = lines
    .map((line) => line.replace(ordered ? /^\d+\.\s+/ : /^[-*]\s+/, ''))
    .map((item) => `<li>${injectLinks(item)}</li>`)
    .join('');

  return `<${tag}>${items}</${tag}>`;
};

const convertPlainTextToBlocks = (text: string): ContentBlock[] => {
  const segments = text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const blocks: ContentBlock[] = [];

  segments.forEach((segment) => {
    if (!segment) return;

    const linkedImageMatch = segment.match(/^\[!\[([^\]]*)]\(([^)]+)\)]\((https?:\/\/[^\s)]+)\)(?:\s*"([^"]*)")?$/);
    if (linkedImageMatch) {
      const [, alt = '', src, href, caption] = linkedImageMatch;
      blocks.push({
        type: 'image',
        src: src.trim(),
        alt: alt || undefined,
        href: href.trim(),
        caption: caption || undefined,
      } as ImageBlock);
      return;
    }

    const imageMatch = segment.match(/^!\[([^\]]*)]\(([^)]+)\)(?:\s*"([^"]*)")?$/);
    if (imageMatch) {
      const [, alt = '', src, caption] = imageMatch;
      blocks.push({
        type: 'image',
        src: src.trim(),
        alt: alt || undefined,
        caption: caption || undefined,
      } as ImageBlock);
      return;
    }

    const headingMatch = segment.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const [, hashes, headingText] = headingMatch;
      const textContent = headingText.trim();
      if (textContent) {
        blocks.push({ type: 'heading', content: textContent });
      }
      return;
    }

    const lines = segment.split('\n');
    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      blocks.push({ type: 'paragraph', content: buildListHtml(lines, false) });
      return;
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      blocks.push({ type: 'paragraph', content: buildListHtml(lines, true) });
      return;
    }

    const paragraphHtml = injectLinks(segment).replace(/\n/g, '<br />');
    blocks.push({ type: 'paragraph', content: `<p>${paragraphHtml}</p>` });
  });

  return blocks;
};

const convertHtmlToBlocks = (html: string): ContentBlock[] => {
  if (!html.trim()) {
    return [];
  }

  const hasHtmlTags = /<[^>]+>/.test(html);
  if (!hasHtmlTags) {
    return convertPlainTextToBlocks(html);
  }

  const segments = html
    .replace(/\r\n/g, '\n')
    .split(/(<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>)/gi)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const blocks: ContentBlock[] = [];

  segments.forEach((segment) => {
    const headingMatch = segment.match(/^<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>$/i);
    if (headingMatch) {
      const headingText = stripHtml(headingMatch[1]);
      if (headingText) {
        blocks.push({ type: 'heading', content: headingText });
      }
      return;
    }

    if (segment) {
      blocks.push({ type: 'paragraph', content: segment });
    }
  });

  if (blocks.length === 0) {
    blocks.push({ type: 'paragraph', content: html });
  }

  return blocks;
};

export const blogPostDataToBlogPost = (data: BlogPostData): BlogPost => {
  const baseImage = data.imageUrl || '/og-image.png';
  const author: Author = {
    name: data.author?.name || 'Team Gifteez',
    avatarUrl: data.author?.avatarUrl || '/images/gifteez-logo.png'
  };

  const contentBlocks = data.contentBlocks && data.contentBlocks.length > 0
    ? data.contentBlocks
    : convertHtmlToBlocks(data.content || '');

  return {
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    imageUrl: baseImage,
    category: data.category || 'Algemeen',
    author,
    publishedDate: data.publishedDate,
    content: contentBlocks
  };
};

export const blogPostDataListToBlogPosts = (items: BlogPostData[]): BlogPost[] =>
  items.map(blogPostDataToBlogPost);

export const contentStringToBlocks = (value: string): ContentBlock[] => convertHtmlToBlocks(value);
