
import React, { useState, FormEvent, useContext } from 'react';
import { NavigateTo, ShowToast } from '../types';
import { AuthContext } from '../contexts/AuthContext';
import Button from './Button';
import { SpinnerIcon } from './IconComponents';
import { pinterestSignup, pinterestPageVisit } from '../services/pinterestTracking';
import { gaSignup, gaPageView } from '../services/googleAnalytics';

interface SignUpPageProps {
  navigateTo: NavigateTo;
  showToast: ShowToast;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ navigateTo, showToast }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext);

  // Pinterest PageVisit tracking for signup page
  React.useEffect(() => {
    pinterestPageVisit('signup_page', `signup_page_${Date.now()}`);
    // Google Analytics pageview tracking for signup page
    gaPageView('/signup', 'Account Aanmaken - Gifteez.nl');
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError("Wachtwoord moet minimaal 6 karakters lang zijn.");
        return;
    }
    setError('');
    setLoading(true);

    try {
        const user = await auth?.signup(name, email, password);
        if(user) {
            // Pinterest Signup tracking
            pinterestSignup(`signup_${user.id}_${Date.now()}`);
            
            // Google Analytics Signup tracking
            gaSignup('form');
            
            showToast(`Account aangemaakt! Welkom, ${user.name}.`);
            navigateTo('account');
        } else {
            setError('Dit e-mailadres is al in gebruik.');
        }
  } catch (err: any) {
    const code = err?.code || err?.message || '';
    if (typeof code === 'string' && code.includes('auth/email-already-in-use')) {
      setError('Dit e-mailadres is al in gebruik.');
    } else if (typeof code === 'string' && code.includes('auth/weak-password')) {
      setError('Wachtwoord moet minimaal 6 karakters lang zijn.');
    } else {
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
    }
    } finally {
        setLoading(false);
    }
  };
  
  const inputClass = `w-full p-3 border rounded-md focus:outline-none focus:ring-2 transition-colors bg-white border-gray-300 focus:ring-primary`;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="font-display text-3xl font-bold text-primary text-center">Account aanmaken</h1>
        <p className="text-center text-gray-600 mt-2">Sla je favorieten op en maak je cadeauzoektocht nog makkelijker.</p>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
           <div>
            <label htmlFor="name" className="block font-bold text-gray-700 mb-1">Naam</label>
            <input 
              type="text" 
              id="name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className={inputClass}
              required 
            />
          </div>
          <div>
            <label htmlFor="email" className="block font-bold text-gray-700 mb-1">E-mailadres</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className={inputClass}
              required 
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-bold text-gray-700 mb-1">Wachtwoord</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className={inputClass}
              required 
            />
          </div>
          <div>
            <Button type="submit" variant="accent" disabled={loading} className="w-full flex items-center justify-center">
              {loading ? (
                <>
                  <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Registreren...
                </>
              ) : 'Maak account aan'}
            </Button>
          </div>
        </form>
        <div className="mt-6 text-center">
            <p className="text-gray-600">
                Heb je al een account?{' '}
                <button onClick={() => navigateTo('login')} className="font-bold text-primary hover:underline">
                    Log hier in
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
