import React, { useState, useMemo, useRef } from 'react';
import type { Deck, Product } from '../types';
import { CloseIcon, ShoppingBagIcon } from './Icons';
import { PurchaseOptionsSheet } from './ProductCard';

interface DeckGalleryViewProps {
  deck: Deck;
  allProducts: Product[];
  onClose: () => void;
  onAddToCart: (productId: string, variantName: string, size?: string, packId?: string, specialPrice?: number) => void;
  onOpenFitFinder: (product: Product) => void;
}

const GalleryProductSlide: React.FC<{
  product: Product;
  onOpenPurchaseSheet: (product: Product, initialVariantIndex: number) => void;
}> = ({ product, onOpenPurchaseSheet }) => {
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleVariantScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== activeVariantIndex) {
        setActiveVariantIndex(newIndex);
      }
    }
  };

  return (
    <div className="h-full w-full relative text-white flex flex-col bg-black">
      <div className="flex-grow relative">
        <div
          ref={scrollRef}
          onScroll={handleVariantScroll}
          className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        >
          {product.variants.map((variant) => (
            <div key={variant.name} className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center">
              {variant.mediaType === 'image' ? (
                <img src={variant.mediaUrl} alt={variant.name} className="w-full h-full object-contain" />
              ) : (
                <video src={variant.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-contain" />
              )}
            </div>
          ))}
        </div>

        {product.variants.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-1 bg-black/30 backdrop-blur-sm rounded-full pointer-events-none">
              {product.variants.map((_, index) => (
                <div key={index} className={`w-2 h-2 rounded-full transition-colors duration-300 ${index === activeVariantIndex ? 'bg-white' : 'bg-white/50'}`}/>
              ))}
            </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <div className="flex items-end justify-between">
          <div className="flex-1 mr-4 pointer-events-auto">
            <h2 className="text-3xl font-bold font-serif">{product.name}</h2>
            <p className="text-sm text-white/90 line-clamp-2 mt-1">{product.description}</p>
          </div>
          <div className="flex flex-col items-center gap-4 pointer-events-auto">
            <button 
                onClick={() => onOpenPurchaseSheet(product, activeVariantIndex)} 
                className="bg-white/90 text-black p-4 rounded-full shadow-lg hover:bg-white transition-transform hover:scale-105 active:scale-100"
            >
                <ShoppingBagIcon className="w-6 h-6" />
            </button>
            <p className="text-2xl font-bold font-serif text-white">${product.price.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};


export const DeckGalleryView: React.FC<DeckGalleryViewProps> = ({ deck, allProducts, onClose, onAddToCart, onOpenFitFinder }) => {
  const deckProducts = useMemo(
    () => allProducts.filter(product => deck.productIds.includes(product.id)),
    [allProducts, deck.productIds]
  );
  
  const [purchaseSheetState, setPurchaseSheetState] = useState<{ product: Product; variantIndex: number } | null>(null);

  const handleOpenPurchaseSheet = (product: Product, initialVariantIndex: number) => {
    setPurchaseSheetState({ product, variantIndex: initialVariantIndex });
  };
  
  const handleClosePurchaseSheet = () => {
    setPurchaseSheetState(null);
  };
  
  const handleVariantChangeInSheet = (newIndex: number) => {
    if (purchaseSheetState) {
      setPurchaseSheetState(prevState => prevState ? { ...prevState, variantIndex: newIndex } : null);
    }
  };

  if (deckProducts.length === 0) {
    return (
      <div className="bg-black text-white h-screen flex flex-col">
        <header className="absolute top-0 left-0 right-0 z-10 p-4">
          <button onClick={onClose} className="p-2 bg-black/50 rounded-full">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center text-center text-gray-500">
          <p>No products in this collection yet.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-black h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar">
        <header className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={onClose} className="p-2 bg-black/50 rounded-full">
            <CloseIcon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">{deck.name}</h1>
          <div className="w-10"></div> {/* Spacer to center title */}
        </header>

        {deckProducts.map(product => (
          <div key={product.id} className="h-screen w-full snap-start relative">
            <GalleryProductSlide 
              product={product} 
              onOpenPurchaseSheet={handleOpenPurchaseSheet}
            />
          </div>
        ))}
      </div>
      
      {purchaseSheetState && (
        <PurchaseOptionsSheet
          product={purchaseSheetState.product}
          activeVariantIndex={purchaseSheetState.variantIndex}
          onClose={handleClosePurchaseSheet}
          onAddToCart={onAddToCart}
          onOpenFitFinder={onOpenFitFinder}
          onVariantChange={handleVariantChangeInSheet}
        />
      )}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
         .line-clamp-2 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
        }
       `}</style>
    </>
  );
};
