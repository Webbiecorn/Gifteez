import type { ReactNode } from 'react'
import React, { createContext, useState, useEffect } from 'react'
import type { CartContextType, Product, CartItem } from '../types'

const CART_KEY = 'gifteezCart'

export const CartContext = createContext<CartContextType | null>(null)

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    // Load cart from localStorage on initial render
    try {
      const storedCart = localStorage.getItem(CART_KEY)
      if (storedCart) {
        setCart(JSON.parse(storedCart))
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e)
    }
  }, [])

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        // If item exists, increase quantity
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      // Otherwise, add new item with quantity 1
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)

  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    itemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
