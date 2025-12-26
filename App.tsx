import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Settings, LogOut, Menu, X, Languages, ClipboardList, Wallet, UserCircle } from 'lucide-react';
import POS from './components/POS';
import Dashboard from './components/Dashboard';
import Invoice from './components/Invoice';
import Inventory from './components/Inventory';
import DueList from './components/DueList';
import Auth from './components/Auth';
import Expenses from './components/Expenses';
import Profile from './components/Profile';
import { StorageService } from './services/storage';
import { Sale, Language, Product } from './types';
import { TRANSLATIONS } from './constants';

type View = 'dashboard' | 'pos' | 'inventory' | 'dueList' | 'expenses' | 'profile';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(StorageService.isLoggedIn());
  const [currentView, setCurrentView] = useState<View>('pos');
  const [lang, setLang] = useState<Language>('en');
  const [sales, setSales] = useState<Sale[]>([]);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initial Data Load
  useEffect(() => {
    if (isAuthenticated) {
        setSales(StorageService.getSales());
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
      setIsAuthenticated(true);
  };

  const handleLogout = () => {
      StorageService.logout();
      setIsAuthenticated(false);
  };

  const handleCheckout = (sale: Sale) => {
    StorageService.addSale(sale);
    setSales(StorageService.getSales());
    setLastSale(sale);
  };

  if (!isAuthenticated) {
      return <Auth onLogin={handleLogin} lang={lang} setLang={setLang} />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        currentView === view 
          ? 'bg-emerald-50 text-emerald-600 font-medium' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return TRANSLATIONS[lang].dashboard;
      case 'pos': return TRANSLATIONS[lang].pos;
      case 'inventory': return TRANSLATIONS[lang].inventory;
      case 'dueList': return TRANSLATIONS[lang].dueList;
      case 'expenses': return TRANSLATIONS[lang].expenses;
      case 'profile': return TRANSLATIONS[lang].profile;
      default: return 'Amar Dokan';
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed md:relative z-40 w-64 h-full bg-white border-r transform transition-transform duration-200 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-emerald-700">Amar Dokan</h1>
            <p className="text-xs text-gray-500">Retail POS System</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          <NavItem view="dashboard" icon={LayoutDashboard} label={TRANSLATIONS[lang].dashboard} />
          <NavItem view="pos" icon={ShoppingCart} label={TRANSLATIONS[lang].pos} />
          <NavItem view="inventory" icon={Package} label={TRANSLATIONS[lang].inventory} />
          <NavItem view="dueList" icon={ClipboardList} label={TRANSLATIONS[lang].dueList} />
          <NavItem view="expenses" icon={Wallet} label={TRANSLATIONS[lang].expenses} />
          <NavItem view="profile" icon={UserCircle} label={TRANSLATIONS[lang].profile} />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t bg-gray-50 space-y-4">
           <div className="flex items-center justify-between px-2">
              <button 
                onClick={() => setLang(prev => prev === 'en' ? 'bn' : 'en')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600"
              >
                <Languages size={16} />
                <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
              </button>
           </div>
           <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium"
           >
               <LogOut size={16} /> {TRANSLATIONS[lang].logout}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b p-4 flex justify-between items-center">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} className="text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800">
            {getPageTitle()}
          </span>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* View Switcher */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {currentView === 'pos' && <POS lang={lang} onCheckout={handleCheckout} />}
          {currentView === 'dashboard' && <Dashboard sales={sales} lang={lang} />}
          {currentView === 'inventory' && <Inventory lang={lang} />}
          {currentView === 'dueList' && <DueList sales={sales} lang={lang} onViewInvoice={setLastSale} />}
          {currentView === 'expenses' && <Expenses lang={lang} />}
          {currentView === 'profile' && <Profile lang={lang} />}
        </div>
      </main>

      {/* Invoice Modal */}
      {lastSale && (
        <Invoice 
          sale={lastSale} 
          lang={lang} 
          onClose={() => setLastSale(null)} 
        />
      )}
    </div>
  );
};

export default App;