
import React, { useState, FormEvent, useContext } from 'react';
import { NavigateTo, ShowToast } from '../types';
import { AuthContext } from '../contexts/AuthContext';
import Button from './Button';
import { SpinnerIcon } from './IconComponents';

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const auth = useContext(AuthContext);

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
    } else if (typeof code === 'string' && code.includes('auth/invalid-email')) {
      setError('Ongeldig e-mailadres.');
    } else if (typeof code === 'string' && code.includes('auth/network-request-failed')) {
      setError('Netwerkfout. Controleer je verbinding en probeer opnieuw.');
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
  <p className="text-center text-gray-600 mt-2">Sla je favorieten op en maak je cadeauzoektocht nog makkelijker. Na aanmelding ontvang je een verificatiemail.</p>

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
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="px-3 text-gray-400 text-sm">of</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div>
            <Button
              type="button"
              variant="primary"
              disabled={googleLoading}
              className="w-full"
              onClick={async () => {
                setError('');
                setGoogleLoading(true);
                try {
                  const user = await auth?.loginWithGoogle();
                  if (user) {
                    showToast(`Welkom, ${user.name}!`);
                    navigateTo('account');
                  }
                } catch (err: any) {
                  const code = err?.code || err?.message || '';
                  if (typeof code === 'string' && code.includes('auth/popup-blocked')) {
                    setError('Popup geblokkeerd. Sta pop-ups toe of probeer opnieuw.');
                  } else if (typeof code === 'string' && code.includes('auth/popup-closed-by-user')) {
                    setError('Popup gesloten voordat de login was voltooid.');
                  } else {
                    setError('Google-login mislukt. Probeer opnieuw.');
                  }
                } finally {
                  setGoogleLoading(false);
                }
              }}
            >
              {googleLoading ? 'Bezig met Google…' : 'Ga verder met Google'}
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
