import React from 'react'
import type { BlogPost, ContentBlock } from '../types'

interface BlogPreviewProps {
  post: BlogPost
  isOpen: boolean
  onClose: () => void
}

const contentToString = (content: BlogPost['content']): string => {
  if (typeof content === 'string') {
    return content
  }

  const blockToString = (block: ContentBlock): string => {
    switch (block.type) {
      case 'heading':
      case 'paragraph':
        return block.content
      case 'gift':
        return `${block.content.productName}: ${block.content.description ?? ''}`
      case 'image':
        return block.alt ?? ''
      case 'comparisonTable':
        return [block.headers.join(' | '), ...block.rows.map((row) => row.values.join(' | '))].join(
          '\n'
        )
      case 'prosCons':
        return block.items
          .map((item) => `${item.title}\n+ ${item.pros.join(', ')}\n- ${item.cons.join(', ')}`)
          .join('\n')
      case 'verdict':
        return `${block.title}: ${block.content}`
      case 'faq':
        return block.items.map((item) => `${item.question}: ${item.answer}`).join('\n')
      default:
        return ''
    }
  }

  return content.map(blockToString).join('\n\n')
}

// Enhanced content renderer that handles both HTML and markdown
const renderContent = (rawContent: BlogPost['content']): string => {
  const content = contentToString(rawContent)

  // Check if content is already HTML (contains HTML tags)
  const isHTML = /<[a-z][\s\S]*>/i.test(content)

  if (isHTML) {
    // Content is already HTML from TinyMCE, just return it
    return content
  }

  // Content is markdown, convert it to HTML
  return (
    content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 mt-6">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 mt-8">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-8">$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.*)\*\*\*/gim, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/gim,
        '<a href="$2" class="text-rose-600 hover:text-rose-700 underline" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      // Images
      .replace(
        /!\[([^\]]*)\]\(([^)]+)\)/gim,
        '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />'
      )
      // Line breaks and paragraphs
      .split('\n\n')
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0)
      .map((paragraph) => {
        // Check if it's already wrapped in HTML tags
        if (paragraph.startsWith('<')) {
          return paragraph
        }
        return `<p class="mb-4 leading-relaxed">${paragraph}</p>`
      })
      .join('')
      // Lists
      .replace(/^\* (.+)$/gim, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/(<li.*<\/li>)/gim, '<ul class="mb-4 space-y-1">$1</ul>')
  )
}

export const BlogPreview: React.FC<BlogPreviewProps> = ({ post, isOpen, onClose }) => {
  if (!isOpen) return null

  const formattedDate = new Date(
    post.publishedAt ?? post.createdAt ?? post.publishedDate
  ).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const contentString = contentToString(post.content)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Preview</h2>
            <p className="text-sm text-gray-600">
              {post.published ? 'Published' : 'Draft'} • {formattedDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <article className="max-w-3xl mx-auto p-6">
            {/* Featured Image */}
            {post.imageUrl && (
              <div className="mb-8">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Article Header */}
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-rose-100 text-rose-800 text-sm font-medium rounded-full">
                  {post.category}
                </span>
                {!post.published && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                    Draft
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

              {post.excerpt && (
                <p className="text-xl text-gray-600 leading-relaxed">{post.excerpt}</p>
              )}

              <div className="flex items-center text-sm text-gray-500 mt-4 pt-4 border-t">
                <time dateTime={post.publishedAt || post.createdAt}>{formattedDate}</time>
                <span className="mx-2">•</span>
                <span>
                  {Math.ceil(contentString.split(' ').filter(Boolean).length / 200)} min leestijd
                </span>
              </div>
            </header>

            {/* Article Content */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: renderContent(post.content),
              }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Preview van {post.slug ? `/blog/${post.slug}` : 'nieuwe post'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Sluiten
            </button>
            <a
              href={post.published && post.slug ? `/blog/${post.slug}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-lg font-medium ${
                post.published && post.slug
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {post.published ? 'Bekijk Live' : 'Niet Gepubliceerd'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
