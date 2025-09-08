import React, { useContext, useEffect } from 'react';
import { NavigateTo } from '../types';
import { CartContext } from '../contexts/CartContext';
import Button from './Button';
import { CheckCircleIcon, DownloadIcon } from './IconComponents';

interface CheckoutSuccessPageProps {
  navigateTo: NavigateTo;
}

const CheckoutSuccessPage: React.FC<CheckoutSuccessPageProps> = ({ navigateTo }) => {
  const cartContext = useContext(CartContext);
  const purchasedItems = cartContext?.cart || [];

  useEffect(() => {
    // Clear the cart after "purchase" is successful
    cartContext?.clearCart();
  }, []); // Run only once on mount

  return (
    <div className="bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-2xl animate-fade-in">
                <CheckCircleIcon className="w-20 h-20 mx-auto text-green-500"/>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mt-4">Aankoop geslaagd!</h1>
                <p className="mt-4 text-lg text-gray-700">Bedankt voor je bestelling. Je ontvangt zo een bevestiging in je e-mail. Je kunt je producten hieronder direct downloaden.</p>
                
                <div className="mt-8 space-y-4 text-left">
                    <h3 className="font-display text-xl font-bold text-primary mb-2">Jouw Downloads:</h3>
                    {purchasedItems.map(item => (
                        <a 
                            key={item.id}
                            href={item.downloadUrl} 
                            download
                            className="flex items-center justify-between p-4 bg-light-bg rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <span className="font-bold text-primary">{item.name}</span>
                            <DownloadIcon className="w-6 h-6 text-blue-600" />
                        </a>
                    ))}
                </div>

                <div className="mt-12">
                    <Button variant="primary" onClick={() => navigateTo('home')}>
                        Terug naar home
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CheckoutSuccessPage;