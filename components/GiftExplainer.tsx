import React, { useState } from 'react'
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from './ui/Badge'

interface GiftExplainerProps {
  explanations: string[]
  totalScore?: number
  budgetFit?: number
  occasionFit?: number
  personaFit?: number
  trendScore?: number
  className?: string
}

/**
 * Shows "Waarom dit cadeau?" explanation for AI-recommended gifts
 * Increases trust and click-through rate
 */
export function GiftExplainer({
  explanations,
  totalScore,
  budgetFit,
  occasionFit,
  personaFit,
  trendScore,
  className = '',
}: GiftExplainerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Show top 2 explanations by default
  const visibleExplanations = isExpanded ? explanations : explanations.slice(0, 2)
  const hasMore = explanations.length > 2

  // Convert score to confidence level
  const getConfidenceLevel = (
    score?: number
  ): { label: string; variant: 'success' | 'primary' | 'secondary' } => {
    if (!score) return { label: 'Aanbevolen', variant: 'secondary' }

    if (score >= 0.8) return { label: 'Top match', variant: 'success' }
    if (score >= 0.6) return { label: 'Goede match', variant: 'primary' }
    return { label: 'Match', variant: 'secondary' }
  }

  const confidence = getConfidenceLevel(totalScore)

  return (
    <div className={`bg-primary-50 border border-primary-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary-600 flex-shrink-0" />
          <h4 className="font-semibold text-primary-900 text-sm">Waarom dit cadeau?</h4>
        </div>

        {totalScore !== undefined && (
          <Badge variant={confidence.variant} size="sm">
            {confidence.label}
          </Badge>
        )}
      </div>

      {/* Explanations */}
      <ul className="space-y-2 mb-3">
        {visibleExplanations.map((explanation, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-primary-800">
            <span className="text-primary-500 mt-0.5">•</span>
            <span>{explanation}</span>
          </li>
        ))}
      </ul>

      {/* Show more/less button */}
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Minder tonen
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              {explanations.length - 2} meer {explanations.length - 2 === 1 ? 'reden' : 'redenen'}
            </>
          )}
        </button>
      )}

      {/* Score breakdown (optional, shown when expanded) */}
      {isExpanded &&
        (budgetFit !== undefined ||
          occasionFit !== undefined ||
          personaFit !== undefined ||
          trendScore !== undefined) && (
          <div className="mt-4 pt-3 border-t border-primary-200">
            <p className="text-xs font-medium text-primary-700 mb-2">Score details:</p>
            <div className="grid grid-cols-2 gap-2">
              {budgetFit !== undefined && <ScoreBar label="Budget" score={budgetFit} />}
              {occasionFit !== undefined && <ScoreBar label="Gelegenheid" score={occasionFit} />}
              {personaFit !== undefined && <ScoreBar label="Persoonlijkheid" score={personaFit} />}
              {trendScore !== undefined && <ScoreBar label="Populariteit" score={trendScore} />}
            </div>
          </div>
        )}
    </div>
  )
}

/**
 * Mini score bar for individual score components
 */
function ScoreBar({ label, score }: { label: string; score: number }) {
  const percentage = Math.round(score * 100)

  // Color based on score
  const getColor = () => {
    if (score >= 0.8) return 'bg-success-500'
    if (score >= 0.6) return 'bg-primary-500'
    return 'bg-secondary-400'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-primary-700">{label}</span>
        <span className="text-xs font-medium text-primary-900">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-primary-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Compact version for use in cards
 */
export function GiftExplainerCompact({
  explanations,
  totalScore,
  className = '',
}: Pick<GiftExplainerProps, 'explanations' | 'totalScore' | 'className'>) {
  if (explanations.length === 0) return null

  const confidence = totalScore && totalScore >= 0.8 ? 'success' : 'primary'

  return (
    <div className={`flex items-start gap-2 text-sm ${className}`}>
      <Lightbulb className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-primary-800 line-clamp-2">{explanations[0]}</p>
        {explanations.length > 1 && (
          <p className="text-primary-600 text-xs mt-1">
            +{explanations.length - 1} meer {explanations.length - 1 === 1 ? 'reden' : 'redenen'}
          </p>
        )}
      </div>
      {totalScore !== undefined && totalScore >= 0.8 && (
        <Badge variant={confidence} size="sm" className="flex-shrink-0">
          Top
        </Badge>
      )}
    </div>
  )
}
