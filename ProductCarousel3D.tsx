import React, { useState, useRef } from 'react';
import type { Product } from '../types';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';
import { useTranslation } from '../App';

interface ProductCarousel3DProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const CAROUSEL_ITEM_WIDTH = 280;
const CAROUSEL_ITEM_HEIGHT = 420;
const PERSPECTIVE = 1200;

export const ProductCarousel3D: React.FC<ProductCarousel3DProps> = ({ products, onProductClick }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(Math.floor(products.length / 2));
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const navigate = (direction: number) => {
    setCurrentIndex(prev => Math.max(0, Math.min(products.length - 1, prev + direction)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndX.current - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      navigate(deltaX < 0 ? 1 : -1);
    }
  };

  if (!products || products.length === 0) {
    return null;
  }
  
  const activeProduct = products[currentIndex];
  const isDiscounted = activeProduct.originalPrice && activeProduct.originalPrice > activeProduct.price;
  const discountPercent = isDiscounted ? Math.round(((activeProduct.originalPrice! - activeProduct.price) / activeProduct.originalPrice!) * 100) : 0;


  return (
    <div className="w-full flex flex-col items-center justify-center py-6">
      <div
        className="relative w-full"
        style={{ height: `${CAROUSEL_ITEM_HEIGHT + 20}px`, perspective: `${PERSPECTIVE}px` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="absolute w-full h-full transition-transform duration-500 ease-in-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateX(calc(50% - ${CAROUSEL_ITEM_WIDTH / 2}px))`,
          }}
        >
          {products.map((product, index) => {
            const offset = index - currentIndex;
            const isCurrent = offset === 0;
            const zIndex = products.length - Math.abs(offset);

            const rotateY = offset * -45;
            const translateX = offset * (CAROUSEL_ITEM_WIDTH * 0.45);
            const translateZ = -Math.abs(offset) * 150;
            const scale = isCurrent ? 1 : 0.8;

            const transform = `
              translateX(${translateX}px)
              translateZ(${translateZ}px)
              rotateY(${rotateY}deg)
              scale(${scale})
            `;

            return (
              <div
                key={product.id}
                onClick={() => {
                  if (isCurrent) {
                    onProductClick(product);
                  } else {
                    setCurrentIndex(index);
                  }
                }}
                className="absolute top-0 left-0 transition-all duration-500 ease-out flex items-center justify-center"
                style={{
                  transform: transform,
                  width: `${CAROUSEL_ITEM_WIDTH}px`,
                  height: `${CAROUSEL_ITEM_HEIGHT}px`,
                  zIndex: zIndex,
                  opacity: isCurrent ? 1 : 0.5,
                  cursor: 'pointer',
                  filter: `brightness(${isCurrent ? 1 : 0.7})`,
                }}
              >
                <div className="w-full h-full bg-gray-900 rounded-xl shadow-2xl relative overflow-hidden group">
                  <img
                    src={product.variants[0].mediaUrl}
                    alt={product.name}
                    className="w-full h-full object-contain pointer-events-none rounded-xl"
                    draggable="false"
                  />
                  <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${isCurrent ? 'opacity-0' : 'opacity-40 group-hover:opacity-20'}`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 w-full mt-6 px-4">
        <div className="text-center h-24">
            <div key={activeProduct.id} className="animate-fade-in-quick">
                <h3 className="text-xl font-bold font-serif truncate">{activeProduct.name}</h3>
                <div className="flex items-baseline justify-center gap-3 mt-1">
                    {isDiscounted && (
                        <p className="text-base text-gray-500 line-through">${activeProduct.originalPrice?.toFixed(2)}</p>
                    )}
                    <p className="text-2xl font-semibold text-white">${activeProduct.price.toFixed(2)}</p>
                    {isDiscounted && (
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">-{discountPercent}%</span>
                    )}
                </div>
            </div>
        </div>
        
        <div className="flex items-center justify-center gap-10 mt-2">
            <button
              onClick={() => navigate(-1)}
              disabled={currentIndex === 0}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous product"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div className="flex gap-2">
                {products.map((_, index) => (
                    <button 
                        key={index} 
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-white scale-125' : 'bg-gray-600'}`}
                        aria-label={`Go to product ${index + 1}`}
                    ></button>
                ))}
            </div>
            <button
              onClick={() => navigate(1)}
              disabled={currentIndex === products.length - 1}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next product"
            >
              <ArrowRightIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
      <style>{`
          @keyframes fade-in-quick {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-quick {
            animation: fade-in-quick 0.4s ease-out forwards;
          }
      `}</style>
    </div>
  );
};
