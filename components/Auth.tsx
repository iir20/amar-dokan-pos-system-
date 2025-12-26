import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { Lock, Store, User as UserIcon } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, lang, setLang }) => {
  const t = TRANSLATIONS[lang];
  const [isRegistering, setIsRegistering] = useState(!StorageService.getCurrentUser());
  const [formData, setFormData] = useState({ storeName: '', username: '', pin: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (!formData.storeName || !formData.username || !formData.pin) {
        setError('All fields are required');
        return;
      }
      StorageService.registerUser(formData);
      onLogin();
    } else {
      if (StorageService.loginUser(formData.username, formData.pin)) {
        onLogin();
      } else {
        setError('Invalid username or PIN');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <Store size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Amar Dokan POS</h1>
            <p className="text-gray-500">Store Management System</p>
        </div>

        <div className="flex justify-center gap-4 mb-6">
             <button onClick={() => setLang('en')} className={`px-3 py-1 text-xs rounded-full ${lang==='en' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>English</button>
             <button onClick={() => setLang('bn')} className={`px-3 py-1 text-xs rounded-full ${lang==='bn' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>বাংলা</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.storeName}</label>
              <div className="relative">
                <Store className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.storeName}
                  onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.username}</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.pin}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="password"
                maxLength={6}
                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.pin}
                onChange={e => setFormData({ ...formData, pin: e.target.value })}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
          >
            {isRegistering ? t.register : t.login}
          </button>
        </form>

        <div className="mt-6 text-center">
            {isRegistering ? (
                 <p className="text-sm text-gray-600">
                    Already have a store? <button onClick={() => setIsRegistering(false)} className="text-emerald-600 font-bold hover:underline">{t.login}</button>
                 </p>
            ) : (
                <p className="text-sm text-gray-600">
                    New user? <button onClick={() => setIsRegistering(true)} className="text-emerald-600 font-bold hover:underline">{t.register}</button>
                 </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Auth;