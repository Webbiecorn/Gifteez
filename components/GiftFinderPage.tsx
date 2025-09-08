import React, { useState, useCallback, useEffect, useContext, ChangeEvent } from 'react';
import { Gift, InitialGiftFinderData, ShowToast, GiftProfile } from '../types';
import { findGifts } from '../services/geminiService';
import Button from './Button';
import GiftResultCard from './GiftResultCard';
import { ThumbsUpIcon, ThumbsDownIcon, EmptyBoxIcon, SpinnerIcon, UserIcon } from './IconComponents';
import { AuthContext } from '../contexts/AuthContext';

const occasions = ["Verjaardag", "Kerstmis", "Valentijnsdag", "Jubileum", "Zomaar"];
const recipients = ["Partner", "Vriend(in)", "Familielid", "Collega", "Kind"];
const suggestedInterests = ["Koken", "Tech", "Boeken", "Reizen", "Sport", "Duurzaamheid", "Wellness"];

const GiftResultCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col animate-pulse">
    <div className="w-full h-48 bg-gray-200"></div>
    <div className="p-6 flex flex-col flex-grow">
      <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
      <div className="mt-4 space-y-2 flex-grow">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
      </div>
      <div className="mt-6 h-12 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

interface GiftFinderPageProps {
  initialData?: InitialGiftFinderData;
  showToast: ShowToast;
}

const GiftFinderPage: React.FC<GiftFinderPageProps> = ({ initialData, showToast }) => {
  const [recipient, setRecipient] = useState<string>(recipients[0]);
  const [budget, setBudget] = useState<number>(50);
  const [occasion, setOccasion] = useState<string>(occasions[0]);
  const [interests, setInterests] = useState<string>('');
  
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (initialData?.recipient) {
      setRecipient(initialData.recipient);
    }
    if (initialData?.occasion) {
      const validOccasion = occasions.find(o => o.toLowerCase() === initialData.occasion?.toLowerCase());
      if (validOccasion) {
        setOccasion(validOccasion);
      }
    }
  }, [initialData]);

  const handleProfileSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const profileId = e.target.value;
    if (profileId) {
        const selectedProfile = auth?.currentUser?.profiles.find(p => p.id === profileId);
        if (selectedProfile) {
            const validRecipient = recipients.find(r => r.toLowerCase() === selectedProfile.relationship.toLowerCase());
            setRecipient(validRecipient || recipients[0]);
            setInterests(selectedProfile.interests);
            showToast(`Profiel '${selectedProfile.name}' geladen!`);
        }
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    setGifts([]);
    setSearchPerformed(true);

    try {
      const results = await findGifts(recipient, budget, occasion, interests);
      setGifts(results);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [recipient, budget, occasion, interests]);
  
  const handleInterestClick = (interest: string) => {
    const currentInterests = interests.split(',').map(i => i.trim()).filter(Boolean);
    if (!currentInterests.includes(interest)) {
      setInterests(prev => prev ? `${prev}, ${interest}` : interest);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-secondary/20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary via-primary to-accent text-white overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-1/4 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 bg-white rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <span className="text-4xl">🎯</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
              AI GiftFinder
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Vul de details in en laat onze AI het perfecte cadeau voor je vinden in slechts 30 seconden!
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-100 space-y-8 -mt-16 relative z-20">

            {/* Profile Quick Start */}
            {auth && auth.currentUser && auth.currentUser.profiles.length > 0 && (
              <div className="p-6 bg-gradient-to-r from-secondary to-secondary/80 rounded-xl border border-secondary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <UserIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-primary">Snelstart met een profiel</h3>
                    <p className="text-sm text-gray-600">Laad een opgeslagen profiel voor snelle invoer</p>
                  </div>
                </div>
                <select
                  id="profile-select"
                  onChange={handleProfileSelect}
                  defaultValue=""
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-gray-800"
                  aria-label="Kies een opgeslagen profiel"
                >
                  <option value="" disabled>Kies een profiel...</option>
                  {auth.currentUser.profiles.map((p: GiftProfile) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Recipient Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <label htmlFor="recipient" className="block font-display text-xl font-bold text-primary">
                    Voor wie zoek je een cadeau?
                  </label>
                  <p className="text-sm text-gray-600">Selecteer de relatie met de ontvanger</p>
                </div>
              </div>
              <select
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-gray-800 text-lg"
              >
                {recipients.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Budget Slider */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="flex-1">
                  <label htmlFor="budget" className="block font-display text-xl font-bold text-primary mb-2">
                    Wat is je budget?
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">€5</span>
                    <span className="text-2xl font-bold text-blue-600">€{budget}</span>
                    <span className="text-sm text-gray-600">€500</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <input
                  id="budget"
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Laag budget</span>
                  <span>Premium</span>
                </div>
              </div>
            </div>

            {/* Occasion Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/50 rounded-lg">
                  <span className="text-2xl">🎉</span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-primary">Wat is de gelegenheid?</h3>
                  <p className="text-sm text-gray-600">Kies de speciale gelegenheid</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {occasions.map(o => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setOccasion(o)}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      occasion === o
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests Input */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <span className="text-2xl">🎨</span>
                </div>
                <div className="flex-1">
                  <label htmlFor="interests" className="block font-display text-xl font-bold text-primary mb-2">
                    Hobby's of interesses? (optioneel)
                  </label>
                  <p className="text-sm text-gray-600">Help ons betere suggesties te geven</p>
                </div>
              </div>
              <input
                id="interests"
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="bv. Koken, Tech, Boeken, Reizen, Sport"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-gray-800 text-lg"
              />
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 self-center mr-2">Snelle suggesties:</span>
                {suggestedInterests.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestClick(interest)}
                    className="py-2 px-4 rounded-full text-sm font-semibold bg-secondary/50 text-primary hover:bg-secondary hover:shadow-md transition-all duration-300 transform hover:scale-105"
                  >
                    + {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <Button
                type="submit"
                variant="accent"
                disabled={isLoading}
                className="w-full py-4 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <SpinnerIcon className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" />
                    AI zoekt de beste cadeaus...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🎁</span>
                    Vind Perfecte Cadeaus
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-16">
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => <GiftResultCardSkeleton key={i} />)}
              </div>
            )}
            {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-md">{error}</p>}

            {!isLoading && !error && searchPerformed && gifts.length === 0 && (
              <div className="text-center py-12">
                <EmptyBoxIcon className="w-24 h-24 text-gray-300 mx-auto" />
                <h3 className="mt-4 font-display text-2xl font-bold text-primary">Oeps, we konden niets vinden!</h3>
                <p className="mt-2 text-gray-600">Probeer je zoekopdracht wat breder te maken of andere interesses in te vullen.</p>
              </div>
            )}

            {gifts.length > 0 && (
              <div className="opacity-0 animate-fade-in">
                <h2 className="font-display text-3xl font-bold text-center text-primary mb-8">Hier zijn je AI-cadeautips!</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {gifts.map((gift, index) => <GiftResultCard key={gift.productName} gift={gift} index={index} showToast={showToast} />)}
                </div>

                <div className="mt-12 text-center p-6 bg-secondary rounded-lg">
                  <h3 className="font-display text-xl font-bold text-primary">Tevreden met deze suggesties?</h3>
                  <div className="flex justify-center space-x-4 mt-4">
                    <button className="p-3 rounded-full bg-white shadow-md hover:bg-green-100 transition-colors" aria-label="Tevreden">
                      <ThumbsUpIcon className="w-6 h-6 text-green-600" />
                    </button>
                    <button className="p-3 rounded-full bg-white shadow-md hover:bg-red-100 transition-colors" aria-label="Niet tevreden">
                      <ThumbsDownIcon className="w-6 h-6 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftFinderPage;