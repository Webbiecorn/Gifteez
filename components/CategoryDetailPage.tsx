import React, { useEffect, useState } from 'react'
import Breadcrumbs from './Breadcrumbs'
import Button from './Button'
import { ChevronLeftIcon } from './IconComponents'
import { Container } from './layout/Container'
import LoadingSpinner from './LoadingSpinner'
import Meta from './Meta'
import type { NavigateTo, DealItem } from '../types'

interface CategoryDetailPageProps {
  navigateTo: NavigateTo
  categoryId: string
  categoryTitle: string
  categoryDescription?: string
  products: DealItem[]
  renderProductCard: (product: DealItem, index: number) => React.ReactNode
}

const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({
  navigateTo,
  categoryId,
  categoryTitle,
  categoryDescription,
  products,
  renderProductCard,
}) => {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = `${categoryTitle} | Gifteez.nl Deals`
    window.scrollTo(0, 0)
  }, [categoryTitle])

  return (
    <>
      <Meta
        title={`${categoryTitle} - Beste Deals & Aanbiedingen`}
        description={
          categoryDescription ||
          `Ontdek de beste deals voor ${categoryTitle}. Handmatig geselecteerd door onze experts.`
        }
        canonical={`/deals/category/${categoryId}`}
      />

      <div className="bg-gradient-to-b from-white via-light-bg to-white min-h-screen">
        <Container size="xl" className="py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Home', path: '/' },
              { label: 'Deals', path: '/deals' },
              { label: categoryTitle, path: `/deals/category/${categoryId}` },
            ]}
            navigateTo={navigateTo}
          />

          {/* Back button */}
          <div className="mb-8">
            <Button
              variant="secondary"
              onClick={() => navigateTo('deals')}
              className="flex items-center gap-2"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              Terug naar alle deals
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
              {categoryTitle}
            </h1>
            {categoryDescription && (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">{categoryDescription}</p>
            )}
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent font-medium">
              <span className="text-2xl">🎁</span>
              <span>
                {products.length} product{products.length !== 1 ? 'en' : ''} gevonden
              </span>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="large" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => (
                <div key={product.id}>{renderProductCard(product, index)}</div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Geen producten gevonden</h3>
              <p className="text-gray-500 mb-6">
                Er zijn momenteel geen deals beschikbaar in deze categorie
              </p>
              <Button variant="primary" onClick={() => navigateTo('deals')}>
                Bekijk andere categorieën
              </Button>
            </div>
          )}
        </Container>
      </div>
    </>
  )
}

export default CategoryDetailPage
