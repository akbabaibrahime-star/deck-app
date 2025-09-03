import React, { useState, useMemo } from 'react';
import type { SaleRecord, User, Product } from '../types';
import { CubeIcon, CurrencyDollarIcon, StarIcon } from './Icons';
import { useTranslation } from '../App';

// --- Sales Rep View ---
interface SalesRepSalesReportViewProps {
  salespersonId: string;
  allSales: SaleRecord[];
}

export const SalesRepSalesReportView: React.FC<SalesRepSalesReportViewProps> = ({ salespersonId, allSales }) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('month');

  const filteredSales = useMemo(() => {
    const now = new Date();
    const mySales = allSales.filter(sale => sale.salespersonId === salespersonId);

    return mySales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      if (period === 'day') {
        return saleDate.toDateString() === now.toDateString();
      }
      if (period === 'month') {
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      }
      if (period === 'year') {
        return saleDate.getFullYear() === now.getFullYear();
      }
      return false;
    });
  }, [salespersonId, allSales, period]);

  const stats = useMemo(() => {
    return filteredSales.reduce((acc, sale) => {
        acc.totalRevenue += sale.totalAmount;
        acc.totalCommission += sale.commissionAmount;
        acc.totalItemsSold += sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        return acc;
    }, { totalRevenue: 0, totalCommission: 0, totalItemsSold: 0 });
  }, [filteredSales]);

  const PeriodButton: React.FC<{ value: 'day' | 'month' | 'year', label: string }> = ({ value, label }) => (
    <button
        onClick={() => setPeriod(value)}
        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${period === value ? 'bg-white text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex gap-2 bg-gray-900 p-1 rounded-lg">
        <PeriodButton value="day" label={t('daily')} />
        <PeriodButton value="month" label={t('monthly')} />
        <PeriodButton value="year" label={t('yearly')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-gray-800 p-4 rounded-lg">
            <CurrencyDollarIcon className="w-8 h-8 mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">{t('totalSales')}</p>
        </div>
         <div className="bg-gray-800 p-4 rounded-lg">
            <CubeIcon className="w-8 h-8 mx-auto text-blue-400 mb-2" />
            <p className="text-2xl font-bold">{stats.totalItemsSold}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">{t('productsSold')}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
            <StarIcon className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
            <p className="text-2xl font-bold">${stats.totalCommission.toFixed(2)}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">{t('commissionEarned')}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">{t('salesDetails')}</h3>
        <div className="space-y-3">
          {filteredSales.length > 0 ? (
            filteredSales.map(sale => (
              <div key={sale.id} className="bg-gray-900 p-3 rounded-lg text-sm">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
                    <div>
                        <p className="font-bold">{new Date(sale.timestamp).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400">{new Date(sale.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-green-400">+${sale.totalAmount.toFixed(2)}</p>
                        <p className="text-xs text-yellow-400">{t('commission')}: ${sale.commissionAmount.toFixed(2)}</p>
                    </div>
                </div>
                <div className="space-y-1 text-xs">
                    {sale.items.map((item, index) => (
                        <p key={index} className="text-gray-300">
                           {item.quantity}x {item.productName} ({item.variantName}{item.size ? `, ${item.size}` : ''})
                        </p>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-10">{t('noSalesRecordForPeriod')}</p>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Brand Owner View ---
interface BrandOwnerSalesReportViewProps {
  ownerId: string;
  allSales: SaleRecord[];
  allUsers: User[];
  myProducts: Product[];
}

export const BrandOwnerSalesReportView: React.FC<BrandOwnerSalesReportViewProps> = ({ ownerId, allSales, allUsers, myProducts }) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('month');

  const filteredSales = useMemo(() => {
    const now = new Date();
    const mySales = allSales.filter(sale => sale.brandOwnerId === ownerId);

    return mySales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      if (period === 'day') {
        return saleDate.toDateString() === now.toDateString();
      }
      if (period === 'month') {
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      }
      if (period === 'year') {
        return saleDate.getFullYear() === now.getFullYear();
      }
      return false;
    });
  }, [ownerId, allSales, period]);

  const stats = useMemo(() => {
    return filteredSales.reduce((acc, sale) => {
        acc.totalRevenue += sale.totalAmount;
        acc.totalCommission += sale.commissionAmount;
        acc.totalItemsSold += sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        return acc;
    }, { totalRevenue: 0, totalCommission: 0, totalItemsSold: 0 });
  }, [filteredSales]);
  
  const topProducts = useMemo(() => {
    const productSales = new Map<string, { name: string; quantity: number }>();
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const existing = productSales.get(item.productId);
        const productName = item.productName || myProducts.find(p => p.id === item.productId)?.name || 'Bilinmeyen Ürün';
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          productSales.set(item.productId, { name: productName, quantity: item.quantity });
        }
      });
    });
    return Array.from(productSales.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }, [filteredSales, myProducts]);

  const topSalesReps = useMemo(() => {
    const repSales = new Map<string, { name: string; avatarUrl: string; totalSales: number; commission: number }>();
    filteredSales.forEach(sale => {
        const rep = allUsers.find(u => u.id === sale.salespersonId);
        if (rep) {
            const existing = repSales.get(rep.id);
            if (existing) {
                existing.totalSales += sale.totalAmount;
                existing.commission += sale.commissionAmount;
            } else {
                repSales.set(rep.id, {
                    name: rep.username,
                    avatarUrl: rep.avatarUrl,
                    totalSales: sale.totalAmount,
                    commission: sale.commissionAmount,
                });
            }
        }
    });
    return Array.from(repSales.values()).sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);
  }, [filteredSales, allUsers]);

  const PeriodButton: React.FC<{ value: 'day' | 'month' | 'year', label: string }> = ({ value, label }) => (
    <button
        onClick={() => setPeriod(value)}
        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${period === value ? 'bg-white text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex gap-2 bg-gray-900 p-1 rounded-lg">
        <PeriodButton value="day" label={t('daily')} />
        <PeriodButton value="month" label={t('monthly')} />
        <PeriodButton value="year" label={t('yearly')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-gray-800 p-4 rounded-lg">
            <CurrencyDollarIcon className="w-8 h-8 mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">{t('totalRevenue')}</p>
        </div>
         <div className="bg-gray-800 p-4 rounded-lg">
            <CubeIcon className="w-8 h-8 mx-auto text-blue-400 mb-2" />
            <p className="text-2xl font-bold">{stats.totalItemsSold}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">{t('productsSold')}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
            <StarIcon className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
            <p className="text-2xl font-bold">${stats.totalCommission.toFixed(2)}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">{t('commissionPaid')}</p>
        </div>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">{t('topSellingProducts')}</h3>
                <div className="space-y-2">
                    {topProducts.length > 0 ? topProducts.map((product, index) => (
                        <div key={index} className="bg-gray-900 p-2 rounded-lg flex justify-between items-center text-sm">
                           <span className="font-semibold">{index + 1}. {product.name}</span>
                           <span className="text-gray-300">{product.quantity} {t('units')}</span>
                        </div>
                    )) : <p className="text-sm text-gray-500 text-center py-4">{t('noDataForPeriod')}</p>}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">{t('topSalesReps')}</h3>
                <div className="space-y-2">
                    {topSalesReps.length > 0 ? topSalesReps.map((rep, index) => (
                        <div key={index} className="bg-gray-900 p-2 rounded-lg flex items-center text-sm">
                           <img src={rep.avatarUrl} alt={rep.name} className="w-8 h-8 rounded-full mr-3"/>
                           <div className="flex-1">
                               <p className="font-semibold">{rep.name}</p>
                               <p className="text-xs text-yellow-400">{t('commission')}: ${rep.commission.toFixed(2)}</p>
                           </div>
                           <span className="text-green-400 font-bold">${rep.totalSales.toFixed(2)}</span>
                        </div>
                    )) : <p className="text-sm text-gray-500 text-center py-4">{t('noDataForPeriod')}</p>}
                </div>
            </div>
       </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">{t('transactionHistory')}</h3>
        <div className="space-y-3">
          {filteredSales.length > 0 ? (
            filteredSales.map(sale => (
              <div key={sale.id} className="bg-gray-900 p-3 rounded-lg text-sm">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
                    <div>
                        <p className="font-bold">{allUsers.find(u => u.id === sale.salespersonId)?.username || 'Bilinmeyen Satıcı'}</p>
                        <p className="text-xs text-gray-400">{new Date(sale.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-green-400">+${sale.totalAmount.toFixed(2)}</p>
                        <p className="text-xs text-yellow-400">{t('commission')}: ${sale.commissionAmount.toFixed(2)}</p>
                    </div>
                </div>
                <div className="space-y-1 text-xs">
                    {sale.items.map((item, index) => (
                        <p key={index} className="text-gray-300">
                           {item.quantity}x {item.productName}
                        </p>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-10">{t('noSalesRecordForPeriod')}</p>
          )}
        </div>
      </div>
    </div>
  );
};