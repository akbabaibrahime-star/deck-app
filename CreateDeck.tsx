import React, { useState, useRef } from 'react';
import type { Product, User } from '../types';
import { PlusIcon, TrashIcon } from './Icons';
import { CreateProduct } from './CreateProduct';
import { useTranslation } from '../App';

interface CreateDeckProps {
  onCreate: (deck: { name: string; mediaUrls: string[]; products: Omit<Product, 'id' | 'creator'>[] }) => void;
  currentUser: User | null;
}

export const CreateDeck: React.FC<CreateDeckProps> = ({ onCreate, currentUser }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [media, setMedia] = useState<string[]>([]);
  const [products, setProducts] = useState<Omit<Product, 'id' | 'creator'>[]>([]);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach(file => {
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const maxSize = 1024;
                    let { width, height } = img;
                    if (width > height) {
                        if (width > maxSize) { height = Math.round(height * (maxSize / width)); width = maxSize; }
                    } else {
                        if (height > maxSize) { width = Math.round(width * (maxSize / height)); height = maxSize; }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject('No canvas context');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                };
                img.onerror = reject;
                img.src = event.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        }).then(resizedDataUrl => {
            setMedia(prev => [...prev, resizedDataUrl]);
        }).catch(err => {
            console.error("Image resize failed", err);
            // Fallback for safety, though it defeats the purpose
            const reader = new FileReader();
            reader.onloadend = () => setMedia(prev => [...prev, reader.result as string]);
            reader.readAsDataURL(file);
        });
      });
    }
  };
  
  const removeImage = (indexToRemove: number) => {
    setMedia(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const removeProduct = (indexToRemove: number) => {
    setProducts(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleSaveProduct = (newProduct: Omit<Product, 'id' | 'creator'>) => {
    setProducts(prev => [...prev, newProduct]);
    setIsCreatingProduct(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && media.length > 0) {
      onCreate({ name, mediaUrls: media, products });
    }
  };

  return (
    <>
      <div className="bg-black text-white h-screen overflow-y-auto pt-16 pb-24">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">{t('createNewDeck')}</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">{t('deckName')}</label>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={t('deckNamePlaceholder')}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t('collectionImages')}</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {media.map((imageSrc, index) => (
                      <div key={index} className="relative group aspect-square bg-gray-900 rounded-lg">
                          <img src={imageSrc} alt={`upload preview ${index}`} className="w-full h-full object-contain rounded-lg" />
                          <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove image"
                          >
                              <TrashIcon className="w-4 h-4" />
                          </button>
                      </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="aspect-square border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <PlusIcon className="w-8 h-8" />
                    <span className="text-xs mt-1">{t('add')}</span>
                  </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
                <h2 className="text-lg font-semibold mb-2">{t('productsInThisDeck')}</h2>
                <div className="space-y-2">
                    {products.map((product, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-900 rounded-lg">
                           <img src={product.variants[0]?.mediaUrl} alt={product.name} className="w-12 h-12 object-contain rounded-md" />
                           <div className="flex-1">
                                <p className="font-semibold text-sm">{product.name}</p>
                                <p className="text-xs text-gray-400">${product.price.toFixed(2)}</p>
                           </div>
                           <button type="button" onClick={() => removeProduct(index)} aria-label="Remove product">
                               <TrashIcon className="w-5 h-5 text-red-500" />
                           </button>
                        </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsCreatingProduct(true)}
                      className="w-full flex items-center justify-center gap-2 text-sm py-3 px-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300"
                    >
                        <PlusIcon className="w-5 h-5" /> {t('addProduct')}
                    </button>
                </div>
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-sm border-t border-white/10 max-w-md mx-auto">
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={!name.trim() || media.length === 0}>
                {t('createDeck')}
              </button>
            </div>
          </form>
        </div>
      </div>
      {isCreatingProduct && <CreateProduct onSave={handleSaveProduct} onClose={() => setIsCreatingProduct(false)} currentUser={currentUser} />}
    </>
  );
};