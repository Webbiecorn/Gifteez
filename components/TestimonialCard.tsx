
import React from 'react';
import { Testimonial } from '../types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <p className="font-serif-italic text-lg text-gray-700 italic">"{testimonial.quote}"</p>
      <p className="mt-4 font-bold text-primary text-right">- {testimonial.author}</p>
    </div>
  );
};

export default TestimonialCard;
