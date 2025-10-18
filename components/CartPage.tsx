import React, { useContext } from 'react';
import { NavigateTo, ShowToast, CartItem } from '../types';
import { CartContext } from '../contexts/CartContext';
import Button from './Button';
import { TrashIcon, ShoppingCartIcon } from './IconComponents';
import ImageWithFallback from './ImageWithFallback';

interface CartPageProps {
  navigateTo: NavigateTo;
  showToast: ShowToast;
}

const CartPage: React.FC<CartPageProps> = ({ navigateTo, showToast }) => {
  const cartContext = useContext(CartContext);

  if (!cartContext) {
    return <div>Winkelwagen wordt geladen...</div>;
  }

  const { cart, removeFromCart, clearCart } = cartContext;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    // In a real app, this would go to a payment gateway
    // Here, we just navigate to a success page
    navigateTo('checkoutSuccess');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-primary">Mijn Winkelwagen</h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <ShoppingCartIcon className="w-24 h-24 text-gray-300 mx-auto" />
            <h3 className="mt-4 font-display text-2xl font-bold text-primary">Je winkelwagen is leeg</h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              Begin met shoppen en ontdek de beste cadeau-deals en inspiratie!
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" onClick={() => navigateTo('deals')}>
                🔥 Bekijk Deals
              </Button>
              <Button variant="accent" onClick={() => navigateTo('giftFinder')}>
                🎁 Start GiftFinder
              </Button>
              <Button variant="secondary" onClick={() => navigateTo('home')}>
                🏠 Ga naar Home
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="space-y-6">
              {cart.map((item: CartItem) => (
                <div key={item.id} className="flex items-center justify-between gap-4 border-b pb-4">
                  <div className="flex items-center gap-4">
                    <ImageWithFallback src={item.imageUrl} alt={item.name} className="w-20 h-24 object-cover rounded-md" />
                    <div>
                      <h3 className="font-bold text-primary text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600">Aantal: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <p className="font-bold text-primary text-lg">€{(item.price * item.quantity).toFixed(2)}</p>
                     <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-red-50 rounded-full"
                        aria-label={`Verwijder ${item.name}`}
                     >
                        <TrashIcon className="w-5 h-5" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <button onClick={clearCart} className="font-bold text-gray-600 hover:text-blue-600 transition-colors">
                    Winkelwagen legen
                </button>
                <div className="text-right">
                    <p className="text-xl font-bold text-primary">Totaal: <span className="text-blue-600">€{total.toFixed(2)}</span></p>
                    <p className="text-sm text-gray-500">Inclusief BTW</p>
                </div>
            </div>

            <div className="mt-8 text-center">
                <Button variant="accent" onClick={handleCheckout} className="w-full md:w-auto">
                    Afrekenen
                </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;