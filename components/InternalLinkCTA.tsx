import React from 'react'

interface InternalLinkCTAProps {
  to: string
  title: string
  description: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'accent'
}

const InternalLinkCTA: React.FC<InternalLinkCTAProps> = ({
  to,
  title,
  description,
  icon = '🎁',
  variant = 'primary',
}) => {
  const variantClasses = {
    primary:
      'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 hover:border-primary/40',
    secondary:
      'bg-gradient-to-r from-secondary/30 to-secondary/50 border-secondary/30 hover:border-secondary/50',
    accent:
      'bg-gradient-to-r from-accent/10 to-purple-500/10 border-accent/20 hover:border-accent/40',
  }

  return (
    <a
      href={to}
      className={`block p-6 rounded-xl border-2 ${variantClasses[variant]} transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] group`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-display text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
            {title}
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
          <div className="mt-3 flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
            <span>Ontdek meer</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
    </a>
  )
}

export default InternalLinkCTA
