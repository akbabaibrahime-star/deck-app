import React, { useState, useRef } from 'react';
import type { Deck, Product, User } from '../types';
import { PlusIcon, TrashIcon, StarIcon, PencilIcon, CameraIcon, PhotographIcon } from './Icons';
import { CreateProduct } from './CreateProduct';
import { useTranslation } from '../App';
import { VideoRecorder } from './VideoRecorder';

interface EditDeckProps {
  deck: Deck;
  allProducts: Product[];
  onSave: (updatedDeck: Deck) => void;
  onCreateProduct: (productData: Omit<Product, 'id' | 'creator'>) => Product;
  onUpdateProduct: (product: Product) => void;
  onToggleFeatured: (productId: string) => void;
  currentUser: User | null;
}

export const EditDeck: React.FC<EditDeckProps> = ({ deck, allProducts, onSave, onCreateProduct, onUpdateProduct, onToggleFeatured, currentUser }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(deck.name);
  const [media, setMedia] = useState<string[]>(deck.mediaUrls);
  const [productIds, setProductIds] = useState<string[]>(deck.productIds);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingMediaIndex, setEditingMediaIndex] = useState<number | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video' | null>(null);


  const creatorProducts = allProducts.filter(p => p.creator.id === currentUser?.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      const processFile = (file: File, callback: (dataUrl: string) => void) => {
        // Check if it's an image to apply resizing
        if (file.type.startsWith('image/')) {
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const img = new Image();
              img.onload = () => {
                const maxSize = 1024;
                let { width, height } = img;
                if (width > height) {
                  if (width > maxSize) {
                    height = Math.round(height * (maxSize / width));
                    width = maxSize;
                  }
                } else {
                  if (height > maxSize) {
                    width = Math.round(width * (maxSize / height));
                    height = maxSize;
                  }
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
          })
            .then(callback)
            .catch((err) => {
              console.error('Image resize failed', err);
              // Fallback for safety
              const reader = new FileReader();
              reader.onloadend = () => callback(reader.result as string);
              reader.readAsDataURL(file);
            });
        } else {
          // For videos or other files, just read the data URL
          const reader = new FileReader();
          reader.onloadend = () => callback(reader.result as string);
          reader.readAsDataURL(file);
        }
      };

      if (editingMediaIndex !== null) {
        // Replace mode
        if (filesArray[0]) {
          processFile(filesArray[0], (dataUrl) => {
            setMedia((prev) => {
              const newMedia = [...prev];
              newMedia[editingMediaIndex] = dataUrl;
              return newMedia;
            });
            setEditingMediaIndex(null); // Reset after update
          });
        }
      } else {
        // Add mode
        filesArray.forEach((file) => {
          processFile(file, (dataUrl) => {
            setMedia((prev) => [...prev, dataUrl]);
          });
        });
      }
    }
    if (e.target) e.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setMedia(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUploadClick = () => {
    setEditingMediaIndex(null);
    if (fileInputRef.current) {
      fileInputRef.current.multiple = true;
      fileInputRef.current.click();
    }
  };

  const handleEditImageClick = (index: number) => {
    setEditingMediaIndex(index);
    if (fileInputRef.current) {
      fileInputRef.current.multiple = false;
      fileInputRef.current.click();
    }
  };

  const handleAddProduct = (productId: string) => {
    setProductIds(prev => [...prev, productId]);
  };

  const handleRemoveProduct = (productIdToRemove: string) => {
    setProductIds(prev => prev.filter(id => id !== productIdToRemove));
  };
  
  const handleSaveNewProduct = (newProductData: Omit<Product, 'id' | 'creator'>) => {
    const newProduct = onCreateProduct(newProductData);
    setProductIds(prev => [...prev, newProduct.id]);
    setIsCreatingProduct(false);
  };

  const handleUpdateExistingProduct = (updatedProduct: Product) => {
    onUpdateProduct(updatedProduct);
    setEditingProduct(null); // Close the modal
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && media.length > 0) {
      onSave({
        ...deck,
        name,
        mediaUrls: media,
        productIds: productIds,
        productCount: productIds.length,
      });
    }
  };

  return (
    <>
      <div className="bg-black text-white h-screen overflow-y-auto pt-16 pb-24">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">{t('editDeck')}</h1>
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
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t('collectionImages')}</label>
              <input
                type="file"
                accept="image/*,video/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {media.map((imageSrc, index) => (
                      <div key={index} className="relative group aspect-square bg-gray-900 rounded-lg">
                          <img src={imageSrc} alt={`upload preview ${index}`} className="w-full h-full object-contain rounded-lg" />
                           <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={() => handleEditImageClick(index)}
                                    className="bg-black/50 p-1.5 rounded-full text-white hover:bg-black/75 transition-colors"
                                    aria-label="Edit image"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="bg-black/50 p-1.5 rounded-full text-white hover:bg-black/75 transition-colors"
                                    aria-label="Remove image"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
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
                  <button
                    type="button"
                    onClick={() => { setIsCameraOpen(true); setCameraMode('photo'); }}
                    className="aspect-square border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <PhotographIcon className="w-8 h-8" />
                    <span className="text-xs mt-1">Photo</span>
                  </button>
                   <button
                    type="button"
                    onClick={() => { setIsCameraOpen(true); setCameraMode('video'); }}
                    className="aspect-square border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <CameraIcon className="w-8 h-8" />
                    <span className="text-xs mt-1">Record</span>
                  </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <h2 className="text-lg font-semibold mb-2">{t('productsInThisDeck')}</h2>
              <div className="space-y-2">
                  {creatorProducts.map(product => {
                    const isInDeck = productIds.includes(product.id);
                    return (
                      <div key={product.id} className="flex items-center gap-3 p-2 bg-gray-900 rounded-lg">
                         <img src={product.variants[0]?.mediaUrl} alt={product.name} className="w-12 h-12 object-contain rounded-md" />
                         <div className="flex-1">
                              <p className="font-semibold text-sm">{product.name}</p>
                              <p className="text-xs text-gray-400">${product.price.toFixed(2)}</p>
                         </div>
                         <div className="ml-auto flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onToggleFeatured(product.id)}
                                className="p-1.5 text-white"
                                aria-label="Toggle Featured"
                            >
                                <StarIcon className={`w-5 h-5 transition-colors ${product.isFeatured ? 'fill-yellow-400 stroke-yellow-400' : 'text-gray-500 hover:text-white'}`} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingProduct(product)}
                                className="p-1.5 text-gray-400 hover:text-white"
                                aria-label="Edit Product"
                            >
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            {isInDeck ? (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveProduct(product.id)}
                                    className="p-1.5 text-red-400 hover:text-red-300"
                                    aria-label="Remove product from deck"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleAddProduct(product.id)}
                                    className="p-1.5 text-blue-400 hover:text-blue-300"
                                    aria-label="Add product to deck"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                      </div>
                  )})}
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
                {t('saveChanges')}
              </button>
            </div>
          </form>
        </div>
      </div>
      { (isCreatingProduct || editingProduct) && 
        <CreateProduct 
            onSave={handleSaveNewProduct} 
            onUpdate={handleUpdateExistingProduct}
            onClose={() => { setIsCreatingProduct(false); setEditingProduct(null); }} 
            currentUser={currentUser}
            productToEdit={editingProduct ?? undefined}
        />
      }
      {isCameraOpen && cameraMode && (
        <VideoRecorder
            initialMode={cameraMode}
            onClose={() => { setIsCameraOpen(false); setCameraMode(null); }}
            onSave={(mediaDataUrl, mediaBlob, mediaType) => {
                setMedia(prev => [...prev, mediaDataUrl]);
                setIsCameraOpen(false);
                setCameraMode(null);
            }}
        />
      )}
    </>
  );
};
