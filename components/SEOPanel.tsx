import React, { useState, useEffect, useCallback } from 'react'
import SEOManager from '../services/seoManager'
import type { SEOData, SEOAnalysis } from '../services/seoManager'

interface SEOPanelProps {
  title: string
  content: string
  excerpt: string
  imageUrl?: string
  slug?: string
  onSEOChange: (seoData: SEOData) => void
}

const SEOPanel: React.FC<SEOPanelProps> = ({
  title,
  content,
  excerpt,
  imageUrl,
  slug,
  onSEOChange,
}) => {
  const [seoData, setSeoData] = useState<SEOData | null>(null)
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [customSEO, setCustomSEO] = useState(false)

  const seoManager = SEOManager.getInstance()

  const regenerateSEO = useCallback(() => {
    if (!title && !content) {
      return
    }
    const generatedSEO = seoManager.generateSEOData(title, content, excerpt, imageUrl, slug)
    setSeoData(generatedSEO)

    const seoAnalysis = seoManager.analyzeSEO(generatedSEO, content)
    setAnalysis(seoAnalysis)

    onSEOChange(generatedSEO)
    setCustomSEO(false)
  }, [content, excerpt, imageUrl, onSEOChange, seoManager, slug, title])

  useEffect(() => {
    if (customSEO) {
      return
    }
    if (title || content) {
      const generatedSEO = seoManager.generateSEOData(title, content, excerpt, imageUrl, slug)
      setSeoData(generatedSEO)

      const seoAnalysis = seoManager.analyzeSEO(generatedSEO, content)
      setAnalysis(seoAnalysis)

      onSEOChange(generatedSEO)
    }
  }, [title, content, excerpt, imageUrl, slug, onSEOChange, customSEO, seoManager])

  const handleSEOFieldChange = (field: keyof SEOData, value: string) => {
    if (!seoData) return

    const updatedSEO = { ...seoData, [field]: value }
    setSeoData(updatedSEO)

    const seoAnalysis = seoManager.analyzeSEO(updatedSEO, content)
    setAnalysis(seoAnalysis)

    onSEOChange(updatedSEO)
  }

  const handleKeywordsChange = (keywords: string) => {
    if (!seoData) return

    const keywordArray = keywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
    const updatedSEO = { ...seoData, keywords: keywordArray }
    setSeoData(updatedSEO)

    const seoAnalysis = seoManager.analyzeSEO(updatedSEO, content)
    setAnalysis(seoAnalysis)

    onSEOChange(updatedSEO)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200'
    if (score >= 60) return 'bg-yellow-100 border-yellow-200'
    return 'bg-red-100 border-red-200'
  }

  if (!seoData || !analysis) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">SEO analyse laden...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${getScoreBg(analysis.score)}`}
          >
            <span className={`text-sm font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">SEO Optimalisatie</h3>
            <p className="text-sm text-gray-600">
              {analysis.score >= 80
                ? 'Uitstekend'
                : analysis.score >= 60
                  ? 'Goed'
                  : 'Heeft aandacht nodig'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              regenerateSEO()
            }}
            className="px-3 py-1 text-xs rounded-full border border-gray-200 font-medium text-gray-600 hover:bg-gray-100"
          >
            Herbereken
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setCustomSEO(!customSEO)
            }}
            className={`px-3 py-1 text-xs rounded-full font-medium ${
              customSEO
                ? 'bg-rose-100 text-rose-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {customSEO ? 'Automatisch' : 'Handmatig'}
          </button>
          <svg
            className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* SEO Analysis */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">SEO Analyse</h4>

            {analysis.issues.length > 0 && (
              <div className="mb-2">
                <span className="text-sm font-medium text-red-600">Problemen:</span>
                <ul className="text-sm text-red-600 list-disc list-inside ml-2">
                  {analysis.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.warnings.length > 0 && (
              <div className="mb-2">
                <span className="text-sm font-medium text-yellow-600">Waarschuwingen:</span>
                <ul className="text-sm text-yellow-600 list-disc list-inside ml-2">
                  {analysis.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.suggestions.length > 0 && (
              <div>
                <span className="text-sm font-medium text-blue-600">Suggesties:</span>
                <ul className="text-sm text-blue-600 list-disc list-inside ml-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* SEO Fields */}
          {customSEO && (
            <div className="space-y-4">
              {/* Meta Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Titel ({seoData.metaTitle.length}/60)
                </label>
                <input
                  type="text"
                  value={seoData.metaTitle}
                  onChange={(e) => handleSEOFieldChange('metaTitle', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="SEO titel voor zoekmachines..."
                />
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Beschrijving ({seoData.metaDescription.length}/160)
                </label>
                <textarea
                  value={seoData.metaDescription}
                  onChange={(e) => handleSEOFieldChange('metaDescription', e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="Korte beschrijving voor in zoekresultaten..."
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords (komma gescheiden)
                </label>
                <input
                  type="text"
                  value={seoData.keywords.join(', ')}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="cadeau, kerst, valentijn, verjaardag..."
                />
              </div>

              {/* Social Media Preview */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Social Media Preview</h4>
                <div className="border border-gray-200 rounded-lg bg-white p-3">
                  {seoData.ogImage && (
                    <img
                      src={seoData.ogImage}
                      alt="Social preview"
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <h5 className="font-medium text-blue-600 text-sm">{seoData.ogTitle}</h5>
                  <p className="text-xs text-gray-600 mt-1">{seoData.ogDescription}</p>
                  <p className="text-xs text-gray-400 mt-1">gifteez-7533b.web.app</p>
                </div>
              </div>
            </div>
          )}

          {/* Meta Tags Preview */}
          <div>
            <button
              onClick={() => {
                const metaTags = seoManager.generateMetaTags(seoData)
                navigator.clipboard.writeText(metaTags)
                alert('Meta tags gekopieerd naar klembord!')
              }}
              className="text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              📋 Kopieer Meta Tags
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SEOPanel
