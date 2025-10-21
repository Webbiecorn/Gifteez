import React, { useEffect, useState } from 'react'
import Breadcrumbs from './Breadcrumbs'
import Button from './Button'
import { ChevronLeftIcon, GiftIcon, SparklesIcon, HeartIcon } from './IconComponents'
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

  // Check if this is the gift sets category
  const isGiftSetsCategory = categoryTitle.toLowerCase().includes('gift set')

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

      <div className="bg-gradient-to-b from-white via-rose-50/30 to-white min-h-screen">
        {/* Hero Section met gradient en decorative elements */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white">
          {/* Animated background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-300/20 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          </div>

          <Container size="xl" className="relative z-10 py-16 md:py-24">
            {/* Breadcrumbs - styled for dark background */}
            <div className="mb-8">
              <div className="text-white/90">
                <Breadcrumbs
                  items={[
                    { label: 'Home', path: '/' },
                    { label: 'Deals', path: '/deals' },
                    { label: categoryTitle, path: `/deals/category/${categoryId}` },
                  ]}
                  navigateTo={navigateTo}
                />
              </div>
            </div>

            {/* Hero content */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-semibold">
                  <SparklesIcon className="h-5 w-5" />
                  <span>Handmatig geselecteerd</span>
                </div>

                {/* Title */}
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  {categoryTitle}
                </h1>

                {/* Description */}
                {categoryDescription && (
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                    {categoryDescription}
                  </p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3">
                    <GiftIcon className="h-6 w-6" />
                    <div>
                      <div className="text-2xl font-bold">{products.length}</div>
                      <div className="text-xs text-white/80">Producten</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3">
                    <HeartIcon className="h-6 w-6" />
                    <div>
                      <div className="text-2xl font-bold">Top Rated</div>
                      <div className="text-xs text-white/80">Kwaliteit</div>
                    </div>
                  </div>
                </div>

                {/* Back button */}
                <Button
                  variant="secondary"
                  onClick={() => navigateTo('deals')}
                  className="bg-white text-rose-600 hover:bg-white/90 inline-flex items-center gap-2"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  Terug naar alle deals
                </Button>
              </div>

              {/* Decorative visual side */}
              <div className="relative hidden md:block">
                <div className="relative">
                  {/* Floating cards effect */}
                  <div className="absolute inset-0 grid grid-cols-2 gap-4 opacity-80">
                    <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 transform rotate-3 hover:rotate-6 transition-transform">
                      <div className="w-12 h-12 rounded-full bg-pink-400/50 mb-3" />
                      <div className="h-3 bg-white/30 rounded mb-2" />
                      <div className="h-3 bg-white/20 rounded w-2/3" />
                    </div>
                    <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 transform -rotate-3 hover:-rotate-6 transition-transform mt-8">
                      <div className="w-12 h-12 rounded-full bg-purple-400/50 mb-3" />
                      <div className="h-3 bg-white/30 rounded mb-2" />
                      <div className="h-3 bg-white/20 rounded w-2/3" />
                    </div>
                    <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 transform rotate-2 hover:rotate-4 transition-transform -mt-4">
                      <div className="w-12 h-12 rounded-full bg-rose-400/50 mb-3" />
                      <div className="h-3 bg-white/30 rounded mb-2" />
                      <div className="h-3 bg-white/20 rounded w-2/3" />
                    </div>
                    <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 transform -rotate-2 hover:-rotate-4 transition-transform mt-4">
                      <div className="w-12 h-12 rounded-full bg-orange-400/50 mb-3" />
                      <div className="h-3 bg-white/30 rounded mb-2" />
                      <div className="h-3 bg-white/20 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>

          {/* Wave separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-12 md:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C150,80 350,80 600,50 C850,20 1050,20 1200,80 L1200,120 L0,120 Z" fill="white" />
            </svg>
          </div>
        </div>

        <Container size="xl" className="py-12">

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
