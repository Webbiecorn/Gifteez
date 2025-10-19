import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
  variant?: 'default' | 'interactive' | 'highlight' | 'subtle'
  padded?: boolean
  hoverLift?: boolean
  glow?: boolean
  border?: boolean
}

const base = 'rounded-2xl bg-white transition-all duration-300'

const variantClasses: Record<string, string> = {
  default: 'shadow-sm hover:shadow-md',
  interactive: 'shadow-md hover:shadow-xl focus-within:shadow-xl',
  highlight: 'shadow-lg border border-muted-rose hover:shadow-accent/30 hover:border-accent/60',
  subtle: 'shadow-none border border-gray-100 hover:border-gray-200',
}

const Card: React.FC<CardProps> = ({
  as: Tag = 'div',
  variant = 'default',
  padded = true,
  hoverLift = true,
  glow = false,
  border = false,
  className = '',
  children,
  ...rest
}) => {
  const classes = [
    base,
    variantClasses[variant],
    padded ? 'p-6' : '',
    hoverLift ? 'hover:-translate-y-1' : '',
    glow ? 'hover:ring-2 hover:ring-accent/30 hover:ring-offset-2' : '',
    border ? 'border border-gray-100' : '',
    'focus-within:outline-none focus-within:ring-2 focus-within:ring-accent/40',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  )
}

export default Card
