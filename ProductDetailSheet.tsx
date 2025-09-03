import React from 'react';
import type { Product } from '../types';
import { CloseIcon, RulerIcon } from './Icons';
import { useTranslation } from '../App';

interface ProductDetailSheetProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailSheet: React.FC<ProductDetailSheetProps> = ({ product, onClose }) => {
  const { t } = useTranslation();
  const hasSizeGuide = product.sizes && product.sizes.length > 0 && product.sizeGuide && product.sizeGuide.headers.length > 0;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[60] animate-fadeIn" 
        onClick={onClose}
    >
      <div 
        className="fixed bottom-0 left-0 right-0 bg-[#121212] text-white rounded-t-2xl p-6 pb-10 max-h-[85vh] overflow-y-auto transform animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-serif">{t('productDetails')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-2xl mb-2 font-serif">{product.name}</h3>
            <p className="text-gray-300">{product.description}</p>
          </div>
          
          {(product.category || (product.tags && product.tags.length > 0)) && (
            <div className="border-t border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-400 uppercase text-sm mb-3">{t('categoryAndTags')}</h3>
                {product.category && (
                    <div className="mb-2">
                        <p className="text-xs text-gray-500">{t('category')}</p>
                        <p className="font-semibold">{product.category.replace(/\//g, ' > ')}</p>
                    </div>
                )}
                {product.tags && product.tags.length > 0 && (
                    <div>
                        <p className="text-xs text-gray-500">{t('tags')}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {product.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-gray-800 text-xs rounded-full capitalize">{tag}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          )}

          <div className="border-t border-gray-700 pt-4">
            <h3 className="font-semibold text-gray-400 uppercase text-sm mb-3">{t('fabricAndSize')}</h3>
            <div className="space-y-4">
                <h4 className="font-bold text-lg">{product.fabric.name}</h4>
                <p className="text-gray-300 text-sm">{product.fabric.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.fabric.closeUpImageUrl && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase">{t('texture')}</p>
                            <img src={product.fabric.closeUpImageUrl} alt={`${product.fabric.name} closeup`} className="w-full h-auto object-contain rounded-lg aspect-square bg-gray-900"/>
                        </div>
                    )}
                    {hasSizeGuide && (
                      <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1 uppercase">
                            <RulerIcon className="w-4 h-4" />
                            <span>{t('sizeGuideCm')}</span>
                          </div>
                          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 text-sm flex-1 flex flex-col justify-center">
                              <div className="grid gap-2 font-bold text-gray-400 pb-2 border-b border-gray-700" style={{gridTemplateColumns: `1fr repeat(${product.sizeGuide.headers.length}, 1fr)`}}>
                                  <div className="text-left">{t('size')}</div>
                                  {product.sizeGuide.headers.map(header => (
                                      <div key={header} className="text-center">{header}</div>
                                  ))}
                              </div>
                              <div className="space-y-1 pt-2">
                                  {product.sizes?.map(size => {
                                      const measurements = product.sizeGuide!.measurements[size];
                                      if (!measurements) return null;
                                      return (
                                          <div key={size} className="grid gap-2 items-center text-xs even:bg-white/5 rounded-md py-1.5" style={{gridTemplateColumns: `1fr repeat(${product.sizeGuide.headers.length}, 1fr)`}}>
                                              <div className="font-bold text-left pl-1">{size}</div>
                                              {measurements.map((value, index) => (
                                                  <div key={index} className="text-center text-gray-300">{value || '-'}</div>
                                              ))}
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};