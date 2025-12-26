import React, { useMemo } from 'react';
import { Sale, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Eye, Phone } from 'lucide-react';

interface DueListProps {
  sales: Sale[];
  lang: Language;
  onViewInvoice: (sale: Sale) => void;
}

const DueList: React.FC<DueListProps> = ({ sales, lang, onViewInvoice }) => {
  const t = TRANSLATIONS[lang];

  // Filter sales that have a due amount > 0
  const dueSales = useMemo(() => {
    return sales
      .filter(sale => sale.dueAmount > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales]);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t.dueList}</h2>
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg font-bold border border-red-100">
           {t.totalDue}: ৳{dueSales.reduce((acc, s) => acc + s.dueAmount, 0).toLocaleString()}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 font-medium text-sm sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4">{t.date}</th>
              <th className="p-4">{t.customerName}</th>
              <th className="p-4 hidden md:table-cell">{t.purchasedItems}</th>
              <th className="p-4 text-right">{t.total}</th>
              <th className="p-4 text-right">{t.paidAmount}</th>
              <th className="p-4 text-right text-red-600">{t.dueAmount}</th>
              <th className="p-4 text-center">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dueSales.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  {t.noDueFound}
                </td>
              </tr>
            ) : (
              dueSales.map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600 text-sm whitespace-nowrap">
                    {new Date(sale.date).toLocaleDateString()}
                    <div className="text-xs text-gray-400">{new Date(sale.date).toLocaleTimeString()}</div>
                  </td>
                  <td className="p-4 text-gray-800 font-medium">
                    <div>{sale.customerName || 'Unknown'}</div>
                    {sale.customerPhone && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                         <Phone size={10} /> {sale.customerPhone}
                      </div>
                    )}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                        {sale.items.map(i => lang === 'bn' ? i.nameBn : i.name).join(', ')}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                        {sale.items.length} items
                    </div>
                  </td>
                  <td className="p-4 text-right text-gray-600 text-sm">৳{sale.totalAmount.toFixed(2)}</td>
                  <td className="p-4 text-right text-emerald-600 text-sm font-medium">৳{sale.paidAmount.toFixed(2)}</td>
                  <td className="p-4 text-right text-red-600 font-bold">৳{sale.dueAmount.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => onViewInvoice(sale)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center justify-center mx-auto gap-1 text-xs font-medium"
                    >
                      <Eye size={16} />
                      {t.view}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DueList;