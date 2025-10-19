import React, { useState } from 'react'
import { ChevronDownIcon } from './IconComponents'

interface AccordionProps {
  title: string
  children: React.ReactNode
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-display font-bold text-primary">{title}</span>
        <ChevronDownIcon
          className={`w-6 h-6 text-primary transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-4 text-gray-600">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Accordion
