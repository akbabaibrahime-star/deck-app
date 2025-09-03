import React, { useState, useRef, useEffect } from 'react';
import type { Product, MediaVariant } from '../types';
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from './Icons';

interface VariantCarousel3DProps {
  product: Product;
  initialVariantIndex: number;
  onClose: () => void;
  onSelectVariant: (index: number) => void;
}

const CAROUSEL_ITEM_WIDTH = 320;
const CAROUSEL_ITEM_HEIGHT = 512;
const PERSPECTIVE = 1000;

const CarouselItem: React.FC<{ variant: MediaVariant; isActive: boolean; isPlaying: boolean; }> = ({ variant, isActive, isPlaying }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isActive && isPlaying) {
            video.play().catch(e => console.error("Autoplay failed", e));
        } else {
            video.pause();
            if(video.currentTime !== 0) {
                video.currentTime = 0;
            }
        }
    }, [isActive, isPlaying]);

    if (variant.mediaType === 'video') {
        return <video ref={videoRef} src={variant.mediaUrl} muted loop playsInline className="w-full h-full object-cover pointer-events-none rounded-xl" draggable="false" />;
    }

    return <img src={variant.mediaUrl} alt={variant.name} className="w-full h-full object-cover pointer-events-none rounded-xl" draggable="false" />;
};

export const VariantCarousel3D: React.FC<VariantCarousel3DProps> = ({ product, initialVariantIndex, onClose, onSelectVariant }) => {
  const [currentIndex, setCurrentIndex] = useState(initialVariantIndex);
  const [isPlaying, setIsPlaying] = useState(true); // Autoplay videos
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const activeVariant = product.variants[currentIndex];


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = (direction: number) => {
    setCurrentIndex(prev => Math.max(0, Math.min(product.variants.length - 1, prev + direction)));
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

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[70] flex flex-col items-center justify-center"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute top-4 right-4 z-20">
        <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Close variant viewer">
          <CloseIcon className="w-6 h-6"/>
        </button>
      </div>

      <div 
        className="w-full flex-grow flex flex-col items-center justify-center animate-fadeInScaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full flex-grow flex items-center justify-center">
            <button
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                disabled={currentIndex === 0}
                className="absolute z-20 left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Previous variant"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>

            <div
            className="relative w-full"
            style={{ height: `${CAROUSEL_ITEM_HEIGHT + 20}px`, perspective: `${PERSPECTIVE}px` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            >
            <div className="floor"></div>
            <div
                className="absolute w-full h-full"
                style={{
                transformStyle: 'preserve-3d',
                transform: `translateX(calc(50% - ${CAROUSEL_ITEM_WIDTH / 2}px))`,
                }}
            >
                {product.variants.map((variant, index) => {
                const offset = index - currentIndex;
                const isCurrent = offset === 0;
                const zIndex = product.variants.length - Math.abs(offset);

                const rotateY = offset * -45;
                const translateX = offset * (CAROUSEL_ITEM_WIDTH * 0.45);
                const translateZ = -Math.abs(offset) * 250;
                const scale = isCurrent ? 1 : 0.8;

                const transform = `
                    translateX(${translateX}px)
                    translateZ(${translateZ}px)
                    rotateY(${rotateY}deg)
                    scale(${scale})
                `;

                return (
                    <div
                    key={variant.name}
                    onClick={() => {
                        if (isCurrent) {
                        onSelectVariant(index);
                        onClose();
                        } else {
                        setCurrentIndex(index);
                        }
                    }}
                    className="carousel-item absolute top-0 left-0 flex items-center justify-center"
                    style={{
                        transform: transform,
                        width: `${CAROUSEL_ITEM_WIDTH}px`,
                        height: `${CAROUSEL_ITEM_HEIGHT}px`,
                        zIndex: zIndex,
                        cursor: 'pointer',
                        opacity: 1 / (Math.abs(offset) * 1.2 + 1),
                        transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
                        willChange: 'transform, opacity',
                    } as React.CSSProperties}
                    aria-hidden={!isCurrent}
                    role="button"
                    tabIndex={isCurrent ? 0 : -1}
                    aria-label={`Select ${variant.name} variant`}
                    >
                        <div className={`w-full h-full bg-black relative group transition-shadow duration-500 rounded-xl ${isCurrent ? 'active-item' : ''}`}>
                            <CarouselItem variant={variant} isActive={isCurrent} isPlaying={isPlaying} />
                            
                            {/* Digital LED Frame for active item */}
                            {isCurrent && <div className="led-frame"></div>}
                        </div>
                    </div>
                );
                })}
            </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); navigate(1); }}
                disabled={currentIndex === product.variants.length - 1}
                className="absolute z-20 right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Next variant"
            >
                <ArrowRightIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div
            className="relative w-full pb-6 z-20 flex flex-col items-center gap-4"
        >
            <div key={activeVariant.name} className="text-center animate-fadeIn" style={{ height: '70px' }}>
                <h3 className="font-serif neon-text-main" data-text={product.name}>
                    {product.name}
                </h3>
                <p className="neon-text-sub" data-text={activeVariant.name}>
                    {activeVariant.name}
                </p>
            </div>
            <div className="flex gap-2">
            {product.variants.map((_, index) => (
                <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-white scale-125' : 'bg-gray-600'}`}
                aria-label={`Go to variant ${index + 1}`}
                ></button>
            ))}
            </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInScaleUp {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeInScaleUp { animation: fadeInScaleUp 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }

        .floor {
          position: absolute;
          bottom: -20px;
          left: 50%;
          width: 80vw;
          max-width: 600px;
          height: 200px;
          background: radial-gradient(ellipse at center, rgba(135, 206, 250, 0.1) 0%, rgba(135, 206, 250, 0) 60%);
          transform: translateX(-50%) rotateX(90deg) translateY(100px);
          pointer-events: none;
        }

        .led-frame {
          position: absolute;
          inset: -3px;
          border: 2px solid #ffffff;
          border-radius: 1rem;
          pointer-events: none;
          opacity: 0;
          box-shadow: 0 0 8px #fff, 0 0 15px #87cefa;
          animation: fadeIn 0.5s 0.3s forwards;
        }
        
        .active-item {
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(173, 216, 230, 0.1);
        }

        .neon-text-main, .neon-text-sub {
            color: #fff;
            font-weight: 700;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .neon-text-main {
            font-size: 1.75rem; /* ~28px */
            text-shadow:
                0 0 5px rgba(202, 240, 248, 0.9),
                0 0 15px rgba(0, 180, 255, 0.7);
        }

        .neon-text-sub {
            font-size: 1.125rem; /* ~18px */
            color: #e0e0e0;
            margin-top: 0.25rem;
            text-shadow:
                0 0 5px rgba(255, 105, 180, 0.8);
        }
      `}</style>
    </div>
  );
};
