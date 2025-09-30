import React from 'react';
import { BlogPost } from '../types';
import { marked } from 'marked';

interface ContentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  post: Partial<BlogPost>;
  title: string;
}

export default function ContentPreview({ isOpen, onClose, post, title }: ContentPreviewProps) {
  if (!isOpen) return null;

  const previewContent = post.content ? marked(post.content) : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto w-full">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Preview: {title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
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
              {previewContent ? (
                <div dangerouslySetInnerHTML={{ __html: previewContent }} />
              ) : (
                <p className="text-gray-500 italic">No content to preview</p>
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
              Status: <span className="font-medium">
                {post.published ? 'Published' : 'Draft'}
              </span>
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
  );
}