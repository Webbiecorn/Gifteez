import React, { useState } from 'react';
import Button from './Button';
import { NewsletterService } from '../services/newsletterService';
import { EmailNotificationService } from '../services/emailNotificationService';

interface NewsletterSignupProps {
  variant?: 'inline' | 'modal' | 'footer';
  className?: string;
  onSuccess?: () => void;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  variant = 'inline',
  className = '',
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'immediate' | 'daily' | 'weekly'>('weekly');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const availableCategories = [
    'Verjaardagen',
    'Kerstmis',
    'Valentijnsdag',
    'Moederdag',
    'Vaderdag',
    'Babyshower',
    'Bruiloft',
    'Afstuderen',
    'Sinterklaas',
    'Lifestyle'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showMessage('error', 'Vul je e-mailadres in');
      return;
    }

    setIsLoading(true);

    try {
      const subscriber = await EmailNotificationService.subscribeToNewsletter(
        email,
        name || undefined,
        { frequency, categories }
      );

      await NewsletterService.addSubscriber(subscriber);

      showMessage('success', 'Je bent succesvol aangemeld voor onze nieuwsbrief! 🎉');
      
      // Reset form
      setEmail('');
      setName('');
      setFrequency('weekly');
      setCategories([]);
      setIsExpanded(false);

      onSuccess?.();
    } catch (error: any) {
      if (error.message === 'Email is already subscribed') {
        showMessage('error', 'Dit e-mailadres is al aangemeld');
      } else {
        showMessage('error', 'Er ging iets mis. Probeer het opnieuw.');
      }
      console.error('Newsletter signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const containerClasses = {
    inline: 'bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-lg border border-rose-200',
    modal: 'bg-white p-6 rounded-lg shadow-lg max-w-md w-full',
    footer: 'bg-white p-4 rounded-lg border border-gray-200'
  };

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {/* Message display */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          📧 Blijf op de hoogte!
        </h3>
        <p className="text-gray-600 text-sm">
          Ontvang de nieuwste cadeau-ideeën en blog posts direct in je inbox
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Je e-mailadres"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
          <Button
            type="submit"
            loading={isLoading}
            className="px-6 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-medium rounded-lg hover:from-rose-700 hover:to-pink-700 transition-all duration-200"
          >
            Aanmelden
          </Button>
        </div>

        {/* Advanced preferences toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-rose-600 hover:text-rose-700 font-medium"
        >
          {isExpanded ? '▼ Minder opties' : '▶ Meer opties'}
        </button>

        {isExpanded && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            {/* Name field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Naam (optioneel)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Je naam"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            {/* Frequency selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hoe vaak wil je e-mails ontvangen?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'immediate', label: 'Direct bij nieuwe posts' },
                  { value: 'daily', label: 'Dagelijks overzicht' },
                  { value: 'weekly', label: 'Wekelijks overzicht' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      value={option.value}
                      checked={frequency === option.value}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="mr-2 text-rose-600"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interessante categorieën (laat leeg voor alles)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableCategories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="mr-2 text-rose-600"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>

      {variant === 'footer' && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          Je kunt je op elk moment uitschrijven via de link in onze e-mails
        </p>
      )}
    </div>
  );
};

export default NewsletterSignup;
