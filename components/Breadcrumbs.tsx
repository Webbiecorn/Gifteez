import React from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  // Generate BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `https://gifteez.nl${item.href}` }),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className={`bg-secondary/30 ${className}`}>
        <ol className="container mx-auto flex items-center gap-2 px-4 py-3 text-sm text-gray-600">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <li aria-hidden="true" className="text-gray-400">
                  /
                </li>
              )}
              <li>
                {item.href ? (
                  <a href={item.href} className="transition-colors hover:text-primary">
                    {item.label}
                  </a>
                ) : item.onClick ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="transition-colors hover:text-primary"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="font-semibold text-primary">{item.label}</span>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>
    </>
  )
}

export default Breadcrumbs
