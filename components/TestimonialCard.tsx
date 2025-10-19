import React from 'react'
import type { Testimonial } from '../types'

interface TestimonialCardProps {
  testimonial: Testimonial
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-white">
      <p className="font-serif-italic text-base text-gray-700 italic leading-relaxed">
        "{testimonial.quote}"
      </p>
      <p className="mt-3 font-bold text-primary text-right text-sm">- {testimonial.author}</p>
    </div>
  )
}

export default TestimonialCard
