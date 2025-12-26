import React, { useState, useEffect } from 'react';
import { Language, User } from '../types';
import { TRANSLATIONS } from '../constants';
import { StorageService } from '../services/storage';
import { Store, MapPin, Phone, Lock, User as UserIcon, Save } from 'lucide-react';

interface ProfileProps {
  lang: Language;
}

const Profile: React.FC<ProfileProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData(currentUser);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      StorageService.updateUser(formData);
      setMessage(t.profileUpdated);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 h-full flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.profile}</h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <Store size={48} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.storeName}</label>
                        <div className="relative">
                            <Store className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input 
                                type="text"
                                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.storeName || ''}
                                onChange={e => setFormData({...formData, storeName: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.username}</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input 
                                type="text"
                                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 text-gray-500"
                                value={formData.username || ''}
                                disabled
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.storeAddress}</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder="e.g. 123, New Market, Dhaka"
                                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.address || ''}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.storePhone}</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder="e.g. +880 1700..."
                                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.phone || ''}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.pin}</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input 
                                type="text"
                                maxLength={6}
                                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.pin || ''}
                                onChange={e => setFormData({...formData, pin: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {message && (
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium text-center">
                        {message}
                    </div>
                )}

                <button 
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                >
                    <Save size={20} /> {t.updateProfile}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;