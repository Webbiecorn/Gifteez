import React, { useState } from 'react'
import { ChevronDownIcon } from './IconComponents'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps {
  items: FAQItem[]
  title?: string
  variant?: 'default' | 'compact'
}

const FAQSection: React.FC<FAQSectionProps> = ({
  items,
  title = 'Veelgestelde vragen',
  variant = 'default',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={variant === 'compact' ? 'space-y-4' : 'space-y-6'}>
      {title && (
        <h2
          className={`font-display font-bold text-slate-900 ${
            variant === 'compact' ? 'text-xl' : 'text-2xl md:text-3xl'
          }`}
        >
          {title}
        </h2>
      )}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
          >
            <button
              onClick={() => toggleItem(index)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-slate-50"
              aria-expanded={openIndex === index}
            >
              <span className="font-semibold text-slate-900">{item.question}</span>
              <ChevronDownIcon
                className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                openIndex === index ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="px-5 pb-5 text-slate-600 leading-relaxed">{item.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQSection
