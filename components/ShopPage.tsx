import React, { useContext } from 'react'
import { CartContext } from '../contexts/CartContext'
import { shopProducts } from '../data/shopData'
import Button from './Button'
import ImageWithFallback from './ImageWithFallback'
import type { ShowToast, Product } from '../types'

interface ShopPageProps {
  showToast: ShowToast
}

const ProductCard: React.FC<{ product: Product; onAddToCart: () => void }> = ({
  product,
  onAddToCart,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group">
      <div className="overflow-hidden">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-display text-2xl font-bold text-primary">{product.name}</h3>
        <p className="mt-2 text-gray-600 flex-grow">{product.description}</p>
        <div className="mt-6 flex justify-between items-center">
          <p className="font-display text-3xl font-bold text-blue-600">
            €{product.price.toFixed(2)}
          </p>
          <Button variant="accent" onClick={onAddToCart}>
            In Winkelwagen
          </Button>
        </div>
      </div>
    </div>
  )
}

const ShopPage: React.FC<ShopPageProps> = ({ showToast }) => {
  const cart = useContext(CartContext)

  const handleAddToCart = (product: Product) => {
    cart?.addToCart(product)
    showToast(`${product.name} toegevoegd aan winkelwagen!`)
  }

  return (
    <div className="bg-light-bg">
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary">Onze Winkel</h1>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
            Vind hier onze exclusieve digitale producten om jouw cadeau-ervaring nog beter te maken.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {shopProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ShopPage
