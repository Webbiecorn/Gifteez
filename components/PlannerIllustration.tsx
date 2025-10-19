import React from 'react'
import ImageWithFallback from './ImageWithFallback'

// Terug naar het bestaande bestand zonder streepje (plannerillustration.png) zodat het zichtbaar is.
const PlannerIllustration: React.FC = () => (
  <ImageWithFallback
    src="/images/plannerillustration.png"
    alt="Gratis Cadeau Planner downloaden – Gifteez mascotte plant cadeau ideeën en avonturen"
    width={400}
    height={400}
    showSkeleton
    fit="contain"
    className="rounded-lg shadow-xl bg-white p-2 transform hover:scale-105 transition-transform duration-300"
  />
)

export default PlannerIllustration
