import React, { useState } from 'react';
import type { Product } from '../types';
import { useTranslation } from '../App';

interface SavedViewProps {
  savedProducts: Product[];
  likedProducts: Product[];
}

type ActiveTab = 'saved' | 'liked';

export const SavedView: React.FC<SavedViewProps> = ({ savedProducts, likedProducts }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ActiveTab>('saved');

  const productsToShow = activeTab === 'saved' ? savedProducts : likedProducts;
  const emptyMessage = activeTab === 'saved' ? t('noSavedItemsYet') : t('noLikedItemsYet');

  return (
    <div className="bg-black text-white h-screen overflow-y-auto pb-20">
      <div className="p-4 text-center">
        <h1 className="text-3xl font-bold">{t('myCollection')}</h1>
      </div>

      <div className="sticky top-0 bg-black z-10">
        <div className="flex border-b border-gray-800 mx-4">
          <button 
            onClick={() => setActiveTab('saved')}
            className={`flex-1 font-semibold text-center transition-colors duration-200 py-3 ${activeTab === 'saved' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {t('saved')}
          </button>
        </div>
      </div>

      <div className="p-4">
        {productsToShow.length === 0 ? (
          <div className="col-span-2 text-center text-gray-500 mt-20">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {productsToShow.map(product => (
              <div key={product.id} className="relative aspect-square rounded-lg overflow-hidden group bg-gray-900">
                <img 
                  src={product.variants[0].mediaUrl} 
                  alt={product.name} 
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                  <div>
                    <p className="font-bold text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-300">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};