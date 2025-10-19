import React from 'react'
import ImageWithFallback from './ImageWithFallback'

// Increment this when updating the image assets
const version = 'v20250907-2'

const QuizIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <picture>
      <source srcSet={`/images/quiz-illustration.webp?${version}`} type="image/webp" />
      <ImageWithFallback
        src={`/images/quiz-illustration.png?${version}`}
        alt="Gifteez mascotte presenteert de Cadeau Quiz op een podium"
        width={600}
        height={600}
        fit="contain"
        showSkeleton
        className={'w-full h-full object-contain ' + (className || '')}
      />
    </picture>
  )
}

export default QuizIllustration
