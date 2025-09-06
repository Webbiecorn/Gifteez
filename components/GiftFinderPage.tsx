import React, { useState, useCallback, useEffect, useContext, ChangeEvent } from 'react';
import { Gift, InitialGiftFinderData, ShowToast, GiftProfile } from '../types';
// Lazy import AI service zodat de startbundle kleiner wordt
let _findGifts: typeof import('../services/geminiService').findGifts | null = null;
async function loadFindGifts() {
  if (_findGifts) return _findGifts;
  const mod = await import('../services/geminiService');
  _findGifts = mod.findGifts;
  return _findGifts;
}
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
  
  const [gifts, setGifts] = useState<Gift[]>([]); // currently visible
  const [allGifts, setAllGifts] = useState<Gift[]>([]); // full filtered list
  const [visibleCount, setVisibleCount] = useState<number>(0);
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
  setAllGifts([]);
  setVisibleCount(0);
    setSearchPerformed(true);

    try {
      const findGifts = await loadFindGifts();
      const results = await findGifts(recipient, budget, occasion, interests, { count: 12 });
      // Temporarily: only keep results that have at least one Amazon.nl retailer
  const amazonOnly = results
        .map(g => ({
          ...g,
          retailers: (g.retailers || []).filter(r => /(^|\.)amazon\.nl$/i.test(new URL(r.affiliateLink).hostname))
        }))
        .filter(g => g.retailers && g.retailers.length > 0);
  setAllGifts(amazonOnly);
  const initial = amazonOnly.slice(0, 3);
  setGifts(initial);
  setVisibleCount(initial.length);
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-primary">AI GiftFinder</h1>
          <p className="mt-2 text-lg text-gray-600">Vul de details in en laat onze AI het perfecte cadeau voor je vinden!</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-8">
          
          {/* FIX: Correctly check for auth and currentUser to ensure type safety. */}
          {auth && auth.currentUser && auth.currentUser.profiles.length > 0 && (
            <div className="p-4 bg-secondary rounded-lg">
                <label htmlFor="profile-select" className="flex items-center gap-2 font-display text-xl font-bold text-primary mb-2">
                    <UserIcon className="w-6 h-6" />
                    Snelstart met een profiel
                </label>
                <select
                    id="profile-select"
                    onChange={handleProfileSelect}
                    defaultValue=""
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    aria-label="Kies een opgeslagen profiel"
                >
                    <option value="" disabled>Kies een profiel...</option>
                    {auth.currentUser.profiles.map((p: GiftProfile) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
          )}

          <div>
            <label htmlFor="recipient" className="block font-display text-xl font-bold text-primary mb-2">Voor wie zoek je een cadeau?</label>
            <select
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              {recipients.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          
          <div>
            <label htmlFor="budget" className="block font-display text-xl font-bold text-primary mb-2">
              Budget: <span className="text-accent font-bold">€{budget}</span>
            </label>
            <input
              id="budget"
              type="range"
              min="5"
              max="500"
              step="5"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div>
            <h3 className="font-display text-xl font-bold text-primary mb-4">Gelegenheid</h3>
            <div className="flex flex-wrap gap-2">
              {occasions.map(o => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOccasion(o)}
                  className={`py-2 px-4 rounded-full text-sm font-bold transition-colors ${
                    occasion === o 
                    ? 'bg-primary text-white' 
                    : 'bg-secondary text-primary hover:bg-opacity-70'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="interests" className="block font-display text-xl font-bold text-primary mb-2">Hobby's of interesses? (optioneel)</label>
            <input
              id="interests"
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="bv. Koken, Tech, Boeken, Reizen"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-sm text-gray-600 self-center">Suggesties:</span>
              {suggestedInterests.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestClick(interest)}
                  className="py-1 px-3 rounded-full text-sm font-bold bg-secondary text-primary hover:bg-opacity-70 transition-colors"
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-4">
            <Button type="submit" variant="accent" disabled={isLoading} className="w-full md:w-auto flex items-center justify-center">
              {isLoading ? (
                <>
                  <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Cadeaus zoeken...
                </>
              ) : (
                'Vind Perfecte Cadeaus'
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
                {gifts.map((gift, index) => (
                  <GiftResultCard
                    key={gift.productName}
                    gift={gift}
                    index={index}
                    showToast={showToast}
                    hideImage
                  />
                ))}
              </div>

        {visibleCount < allGifts.length && (
                <div className="mt-8 text-center">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
          const next = Math.min(visibleCount + 3, allGifts.length);
                      setGifts(allGifts.slice(0, next));
                      setVisibleCount(next);
                    }}
                    className="px-6"
                  >
                    Meer laden
                  </Button>
                </div>
              )}
              
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
  );
};

export default GiftFinderPage;