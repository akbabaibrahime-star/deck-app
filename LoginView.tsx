import React, { useState, useEffect } from 'react';
import { useTranslation } from '../App';
import { ShoppingBagIcon, TagIcon, CloseIcon } from './Icons';
import { countries } from '../data/countries';
import type { Country } from '../data/countries';

interface LoginViewProps {
  onLogin: (identifier: string, password: string) => void;
  onRegister: (username: string, password: string, role: 'customer' | 'brand_owner', contact: { email?: string, phone?: string }) => void;
  error: string | null;
  onForgotPassword: () => void;
}

const CountryCodePicker: React.FC<{ onSelect: (country: Country) => void, onClose: () => void }> = ({ onSelect, onClose }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const filteredCountries = countries.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.dial_code.includes(searchTerm)
    );

    return (
        <div className="fixed inset-0 bg-black/70 z-[80] flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-[#121212] rounded-lg w-full max-w-sm flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold">{t('selectCountry')}</h3>
                    <button onClick={onClose}><CloseIcon/></button>
                </header>
                <div className="p-2 border-b border-gray-800">
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder={t('searchCountry')}
                        className="w-full bg-gray-800 border-gray-700 rounded-md px-3 py-2 text-sm"
                    />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredCountries.map(country => (
                        <button key={country.code} onClick={() => onSelect(country)} className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-800">
                            <span className="text-2xl">{country.flag}</span>
                            <span className="flex-1">{country.name}</span>
                            <span className="text-gray-400">{country.dial_code}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
};


export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onRegister, error, onForgotPassword }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [registerMethod, setRegisterMethod] = useState<'email' | 'phone'>('email');
  
  // Form state
  const [identifier, setIdentifier] = useState(''); // Used for login (email or phone)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'customer' | 'brand_owner'>('customer');

  // Phone state
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries.find(c => c.code === 'US')!);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    try {
        const userLocale = navigator.language; // e.g., 'en-US'
        const countryCode = userLocale.split('-')[1]?.toUpperCase();
        if (countryCode) {
            const detectedCountry = countries.find(c => c.code === countryCode);
            if (detectedCountry) {
                setSelectedCountry(detectedCountry);
            }
        }
    } catch(e) {
        console.warn("Could not detect user region.", e);
    }
  }, []);

  const isLogin = mode === 'login';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(identifier, password);
    } else {
        if (registerMethod === 'email') {
            onRegister(username, password, role, { email });
        } else {
            const fullPhoneNumber = `${selectedCountry.dial_code}${phone}`;
            onRegister(username, password, role, { phone: fullPhoneNumber });
        }
    }
  };

  const toggleMode = () => {
    setMode(isLogin ? 'register' : 'login');
  };

  return (
    <>
      <div className="bg-black text-white h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold font-serif">Deck</h1>
          <p className="text-gray-400 mt-2">The Style Studio</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
          <h2 className="text-2xl font-semibold text-center">{isLogin ? t('login') : t('createAccount')}</h2>
          
          {isLogin ? (
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-400 mb-1">{t('emailOrPhone')}</label>
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={t('emailOrPhone')}
                required
                autoComplete="username"
              />
            </div>
          ) : (
            <>
              <div className="flex bg-gray-800 p-1 rounded-full text-sm">
                <button type="button" onClick={() => setRegisterMethod('email')} className={`flex-1 py-1.5 rounded-full transition-colors ${registerMethod === 'email' ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>{t('email')}</button>
                <button type="button" onClick={() => setRegisterMethod('phone')} className={`flex-1 py-1.5 rounded-full transition-colors ${registerMethod === 'phone' ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>{t('phoneNumber')}</button>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">{t('username')}</label>
                <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3" placeholder={t('yourUsername')} required autoComplete="username" />
              </div>

              {registerMethod === 'email' ? (
                 <div className="animate-fadeIn">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">{t('email')}</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3" placeholder="you@example.com" required={registerMethod === 'email'} autoComplete="email" />
                </div>
              ) : (
                <div className="animate-fadeIn">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">{t('phoneNumber')}</label>
                    <div className="flex">
                        <button type="button" onClick={() => setIsPickerOpen(true)} className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-l-lg px-3 py-3 hover:bg-gray-700">
                            <span>{selectedCountry.flag}</span>
                            <span className="text-sm">{selectedCountry.dial_code}</span>
                        </button>
                        <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} className="w-full bg-gray-800 border-y border-r border-gray-700 rounded-r-lg px-3 py-3" placeholder="5551234567" required={registerMethod === 'phone'} autoComplete="tel" />
                    </div>
                </div>
              )}
            </>
          )}

          <div>
            <div className="flex justify-between items-baseline">
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">{t('password')}</label>
                {isLogin && (
                    <button type="button" onClick={onForgotPassword} className="text-xs text-blue-400 hover:text-blue-300">{t('forgotPassword')}</button>
                )}
            </div>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3" placeholder="••••••••" required autoComplete={isLogin ? "current-password" : "new-password"} />
          </div>

          {!isLogin && (
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-medium text-gray-400 text-center">{t('iWantTo')}</label>
              <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setRole('customer')} className={`p-4 text-center rounded-lg border-2 transition-colors duration-200 ${role === 'customer' ? 'border-white bg-white/10' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}>
                      <ShoppingBagIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-semibold">{t('shop')}</p>
                      <p className="text-xs text-gray-400 mt-1 h-10">{t('shopDescription')}</p>
                  </button>
                  <button type="button" onClick={() => setRole('brand_owner')} className={`p-4 text-center rounded-lg border-2 transition-colors duration-200 ${role === 'brand_owner' ? 'border-white bg-white/10' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}>
                      <TagIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-semibold">{t('sell')}</p>
                      <p className="text-xs text-gray-400 mt-1 h-10">{t('sellDescription')}</p>
                  </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}
          <button type="submit" className="w-full bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors">
            {isLogin ? t('login') : t('signUp')}
          </button>
        </form>
         <div className="mt-6 text-center">
          <button onClick={toggleMode} className="text-sm text-blue-400 hover:text-blue-300">
            {isLogin ? t('noAccount') : t('hasAccount')}
          </button>
        </div>
      </div>
      {isPickerOpen && <CountryCodePicker onClose={() => setIsPickerOpen(false)} onSelect={(c) => { setSelectedCountry(c); setIsPickerOpen(false); }} />}
      <style>{`
         @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </>
  );
};
