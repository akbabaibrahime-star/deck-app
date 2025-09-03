import React from 'react';
import type { Deck, Product } from '../types';
import { useTranslation } from '../App';

interface DeckDetailViewProps {
  deck: Deck;
  allProducts: Product[];
}

export const DeckDetailView: React.FC<DeckDetailViewProps> = ({ deck, allProducts }) => {
  const { t } = useTranslation();
  const deckProducts = allProducts.filter(product => deck.productIds.includes(product.id));

  return (
    <div className="bg-black text-white h-screen overflow-y-auto pt-16 pb-8">
      <div className="px-4">
        <h1 className="text-3xl font-bold">{deck.name}</h1>
      </div>

      <div className="mt-6">
        <h2 className="px-4 text-xl font-semibold mb-2">{t('gallery')}</h2>
        <div className="grid grid-cols-3 gap-px bg-gray-800">
          {deck.mediaUrls.map((url, index) => (
            <div key={index} className="bg-black aspect-square">
              <img src={url} alt={`${deck.name} gallery image ${index + 1}`} className="w-full h-full object-contain" />
            </div>
          ))}
        </div>
      </div>

      {deckProducts.length > 0 && (
        <div className="mt-6">
          <h2 className="px-4 text-xl font-semibold mb-2">{t('productsInThisDeck')}</h2>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {deckProducts.map(product => (
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
          </div>
        </div>
      )}
    </div>
  );
};
