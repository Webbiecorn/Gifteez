import React, { useMemo } from 'react'
import type { BlogPost, ContentBlock, Gift } from '../types'

interface ContentPreviewProps {
  isOpen: boolean
  onClose: () => void
  post: Partial<BlogPost>
  title: string
}

export default function ContentPreview({ isOpen, onClose, post, title }: ContentPreviewProps) {
  if (!isOpen) return null

  const previewBlocks = useMemo(() => {
    if (!post.content) {
      return [] as Array<ContentBlock | { type: 'legacy'; content: string }>
    }

    if (typeof post.content === 'string') {
      return [{ type: 'legacy', content: post.content }]
    }

    if (Array.isArray(post.content)) {
      return post.content
    }

    return [] as Array<ContentBlock | { type: 'legacy'; content: string }>
  }, [post.content])

  const renderBlock = (
    block: ContentBlock | { type: 'legacy'; content: string },
    index: number
  ) => {
    switch (block.type) {
      case 'heading':
        return (
          <h2 key={index} className="mt-10 text-2xl font-semibold text-gray-900 first:mt-0">
            {block.content}
          </h2>
        )
      case 'paragraph':
        return (
          <p key={index} className="mt-4 text-base leading-relaxed text-gray-700">
            {block.content}
          </p>
        )
      case 'image':
        return (
          <figure key={index} className="my-8">
            <img
              src={block.src}
              alt={block.alt ?? ''}
              className="mx-auto max-h-96 w-full rounded-lg object-contain"
            />
            {block.caption && (
              <figcaption className="mt-2 text-center text-sm text-gray-500">
                {block.caption}
              </figcaption>
            )}
          </figure>
        )
      case 'gift': {
        const gift = block.content as Gift
        return (
          <div key={index} className="mt-6 rounded-xl border border-rose-100 bg-rose-50/50 p-4">
            <p className="text-sm font-semibold text-rose-600">Gift aanbeveling</p>
            <p className="mt-2 text-lg font-medium text-gray-900">{gift.productName}</p>
            <p className="mt-1 text-sm text-gray-600">{gift.description}</p>
            <p className="mt-3 text-sm font-semibold text-gray-800">Prijs: {gift.priceRange}</p>
          </div>
        )
      }
      case 'comparisonTable':
        return (
          <div key={index} className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {block.headers.map((header, headerIndex) => (
                    <th
                      key={headerIndex}
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <th
                      scope="row"
                      className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-700"
                    >
                      {row.feature}
                    </th>
                    {row.values.map((value, valueIndex) => (
                      <td key={valueIndex} className="px-4 py-2 text-sm text-gray-600">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'prosCons':
        return (
          <div key={index} className="mt-6 grid gap-4 md:grid-cols-2">
            {block.items.map((item, itemIndex) => (
              <div key={itemIndex} className="rounded-lg border border-gray-100 bg-white p-4">
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <div className="mt-3 grid gap-2 text-sm text-gray-700 md:grid-cols-2">
                  <div>
                    <p className="font-semibold text-emerald-600">Pros</p>
                    <ul className="mt-1 list-disc pl-5 text-gray-600">
                      {item.pros.map((prosItem, prosIndex) => (
                        <li key={prosIndex}>{prosItem}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-rose-600">Cons</p>
                    <ul className="mt-1 list-disc pl-5 text-gray-600">
                      {item.cons.map((consItem, consIndex) => (
                        <li key={consIndex}>{consItem}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      case 'verdict':
        return (
          <div
            key={index}
            className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Verdict
            </p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{block.title}</p>
            <p className="mt-1 text-sm text-gray-700">{block.content}</p>
          </div>
        )
      case 'faq':
        return (
          <div key={index} className="mt-6 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Veelgestelde vragen
            </p>
            {block.items.map((faqItem, faqIndex) => (
              <details key={faqIndex} className="rounded-lg border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer text-base font-semibold text-gray-900">
                  {faqItem.question}
                </summary>
                <p className="mt-2 text-sm text-gray-600">{faqItem.answer}</p>
              </details>
            ))}
          </div>
        )
      case 'legacy':
        return (
          <div key={index} className="mt-4 space-y-3 text-base leading-relaxed text-gray-700">
            {block.content.split(/\n{2,}/).map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex}>{paragraph}</p>
            ))}
          </div>
        )
      default:
        return (
          <pre
            key={index}
            className="mt-4 overflow-x-auto rounded-lg bg-gray-900/80 p-4 text-xs text-gray-100"
          >
            {JSON.stringify(block, null, 2)}
          </pre>
        )
    }
  }

  const isPublished = Boolean((post as Partial<BlogPost>).publishedDate)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto w-full">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Preview: {title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6">
          {/* Blog Post Preview */}
          <article className="max-w-3xl mx-auto">
            {/* Featured Image */}
            {post.imageUrl && (
              <div className="mb-8">
                <img
                  src={post.imageUrl}
                  alt={post.title || 'Preview image'}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Title */}
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {post.title || 'Untitled Post'}
              </h1>

              {/* Meta info */}
              <div className="flex items-center text-sm text-gray-600 space-x-4">
                <span>Preview Mode</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString('nl-NL')}</span>
                {post.category && (
                  <>
                    <span>•</span>
                    <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs">
                      {post.category}
                    </span>
                  </>
                )}
              </div>
            </header>

            {/* Excerpt */}
            {post.excerpt && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700 italic">{post.excerpt}</p>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {previewBlocks.length > 0 ? (
                previewBlocks.map((block, index) => renderBlock(block, index))
              ) : (
                <p className="text-gray-500 italic">Geen content beschikbaar voor preview.</p>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
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
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Status: <span className="font-medium">{isPublished ? 'Published' : 'Draft'}</span>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
