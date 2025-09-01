
import React, { useState, FormEvent } from 'react';
import { Page, NavigateTo } from '../types';
import Button from './Button';
import { InstagramIcon, PinterestIcon } from './IconComponents';

interface FooterProps {
  navigateTo: NavigateTo;
}

const Footer: React.FC<FooterProps> = ({ navigateTo }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email && /\S+@\S+\.\S+/.test(email)) {
      // In a real app, this would be sent to a backend service
      console.log('Subscribing email from footer:', email);
      navigateTo('download');
      setEmail(''); // Reset form
    } else {
      // Basic validation feedback
      alert('Voer een geldig e-mailadres in.');
    }
  };

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Navigation */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Navigatie</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigateTo('home')} className="hover:text-secondary transition-colors">Home</button></li>
              <li><button onClick={() => navigateTo('giftFinder')} className="hover:text-secondary transition-colors">GiftFinder</button></li>
              <li><button onClick={() => navigateTo('deals')} className="hover:text-secondary transition-colors">Deals</button></li>
              <li><button onClick={() => navigateTo('quiz')} className="hover:text-secondary transition-colors">Cadeau Quiz</button></li>
              <li><button onClick={() => navigateTo('shop')} className="hover:text-secondary transition-colors">Winkel</button></li>
              <li><button onClick={() => navigateTo('blog')} className="hover:text-secondary transition-colors">Blog</button></li>
              <li><button onClick={() => navigateTo('about')} className="hover:text-secondary transition-colors">Over Ons</button></li>
            </ul>
          </div>
          {/* Column 2: Newsletter */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Nieuwsbrief</h3>
            <p className="text-gray-300 mb-4">Krijg de beste cadeau-ideeën direct in je inbox.</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Jouw e-mailadres" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent bg-white" 
                required
              />
              <Button type="submit" variant="accent" className="w-full sm:w-auto">Signup</Button>
            </form>
          </div>
          {/* Column 3: Social */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Volg Ons</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-secondary transition-colors"><InstagramIcon className="w-6 h-6" /></a>
              <a href="#" className="hover:text-secondary transition-colors"><PinterestIcon className="w-6 h-6" /></a>
            </div>
          </div>
          {/* Column 4: Customer Service */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Klantenservice</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-secondary transition-colors">Disclaimer</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Privacybeleid</a></li>
              <li><button onClick={() => navigateTo('contact')} className="hover:text-secondary transition-colors">Contact</button></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-blue-800 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Gifteez.nl. Alle rechten voorbehouden.</p>
          <p className="mt-2">Als partner van Bol.com, Amazon en andere webshops verdienen wij aan gekwalificeerde aankopen. Prijzen en beschikbaarheid kunnen veranderen. Controleer altijd de actuele prijs op de productpagina.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
