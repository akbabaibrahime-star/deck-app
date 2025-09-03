import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Product, User, UserSummary, LiveStream } from '../types';
import { HeartIcon, ChatBubbleIcon, BookmarkIcon, ShareIcon, InfoIcon, TagIcon, VolumeUpIcon, VolumeOffIcon, MagicWandIcon, PlusIcon, CloseIcon, ShoppingBagIcon, CubeIcon, GridIcon } from './Icons';
import { ProductDetailSheet } from './ProductDetailSheet';
import { useTranslation } from '../App';
import { VariantCarousel3D } from './VariantCarousel3D';

interface ShopTheLookBubbleProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ShopTheLookBubble: React.FC<ShopTheLookBubbleProps> = ({ product, onClick }) => {
    return (
        <button 
            onClick={() => onClick(product)} 
            className="flex items-center gap-2 bg-black/50 backdrop-blur-md p-1.5 rounded-full shadow-lg transition-transform hover:scale-105"
        >
            <img src={product.variants[0].mediaUrl} alt={product.name} className="w-8 h-8 rounded-full object-cover bg-gray-800" />
            <div className="pr-2 text-left">
                <p className="text-xs font-semibold leading-tight">{product.name}</p>
                <p className="text-xs text-white/70">${product.price.toFixed(2)}</p>
            </div>
        </button>
    );
};

interface PurchaseOptionsSheetProps {
  product: Product;
  activeVariantIndex: number;
  onClose: () => void;
  onAddToCart: (productId: string, variantName: string, size?: string, packId?: string, specialPrice?: number) => void;
  onOpenFitFinder: (product: Product) => void;
  onVariantChange: (index: number) => void;
  activeDiscount?: LiveStream['activeDiscount'];
}

// FIX: Export PurchaseOptionsSheet so it can be used in other components like LiveStreamPlayerView.
export const PurchaseOptionsSheet: React.FC<PurchaseOptionsSheetProps> = ({ product, activeVariantIndex, onClose, onAddToCart, onOpenFitFinder, onVariantChange, activeDiscount }) => {
    const { t } = useTranslation();
    const isWholesale = product.isWholesale && product.packs && product.packs.length > 0;
    
    const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes ? product.sizes[0] : undefined);
    const [selectedPackIndex, setSelectedPackIndex] = useState(0);
    const selectedPack = isWholesale ? product.packs![selectedPackIndex] : null;
    const activeVariant = product.variants[activeVariantIndex];
    
    const [isClosing, setIsClosing] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);
    const dragInfo = useRef({ startY: 0, currentY: 0, isDragging: false });

    const isDiscounted = activeDiscount && activeDiscount.productId === product.id && new Date(activeDiscount.expiresAt) > new Date();
    const discountedPrice = isDiscounted ? product.price * (1 - activeDiscount.discountPercentage / 100) : product.price;

    const handleClose = useCallback(() => {
        if (isClosing) return;
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Animation duration
    }, [isClosing, onClose]);

    const handleAddToCartClick = () => {
      if (isWholesale && selectedPack) {
        onAddToCart(product.id, activeVariant.name, undefined, selectedPack.id, undefined);
      } else {
        onAddToCart(product.id, activeVariant.name, selectedSize, undefined, isDiscounted ? discountedPrice : undefined);
      }
      handleClose();
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        dragInfo.current.isDragging = true;
        dragInfo.current.startY = e.touches[0].clientY;
        if (sheetRef.current) {
            sheetRef.current.style.transition = 'none';
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!dragInfo.current.isDragging) return;
        const deltaY = e.touches[0].clientY - dragInfo.current.startY;
        if (deltaY > 0) { // Only allow dragging down
            dragInfo.current.currentY = deltaY;
            if (sheetRef.current) {
                sheetRef.current.style.transform = `translateY(${deltaY}px)`;
            }
        }
    };
    
    const handleTouchEnd = () => {
        dragInfo.current.isDragging = false;
        if (sheetRef.current) {
            sheetRef.current.style.transition = 'transform 0.3s ease-out';
            if (dragInfo.current.currentY > 100) { // Swipe threshold
                handleClose();
            } else {
                sheetRef.current.style.transform = `translateY(0px)`;
            }
        }
        dragInfo.current.currentY = 0;
    };

    return (
         <div className="fixed inset-0 bg-black/50 z-[60] animate-fadeIn" onClick={handleClose}>
            <div 
                ref={sheetRef}
                className={`fixed bottom-0 left-0 right-0 bg-[#121212] rounded-t-2xl p-6 pb-8 space-y-6 ${isClosing ? 'animate-slideDown' : 'animate-slideUp'}`} 
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                        <img src={activeVariant.mediaUrl} alt={product.name} className="w-20 h-28 object-contain bg-gray-900 rounded-lg"/>
                        <div className="pt-1">
                            <h3 className="font-bold font-serif text-xl">{product.name}</h3>
                            <p className="text-lg font-bold">
                                {isWholesale && selectedPack ? `$${selectedPack.price.toFixed(2)}` : (
                                    isDiscounted ? (
                                        <span className="flex items-baseline gap-2">
                                            <span className="text-red-500">${discountedPrice.toFixed(2)}</span>
                                            <span className="text-gray-500 line-through text-base">${product.price.toFixed(2)}</span>
                                        </span>
                                    ) : `$${product.price.toFixed(2)}`
                                )}
                                {isWholesale && <span className="text-sm text-gray-300"> / {t('pack')}</span>}
                            </p>
                        </div>
                    </div>
                     <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/10 -mt-2 -mr-2">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                 <div>
                    <p className="text-sm font-semibold text-gray-400 mb-2">{t('color')}: <span className="text-white">{activeVariant.name}</span></p>
                    <div className="flex items-center gap-2">
                        {product.variants.map((variant, index) => (
                        <button
                            key={variant.name}
                            onClick={() => onVariantChange(index)}
                            className={`w-10 h-10 rounded-full border-2 transition-all duration-300 flex-shrink-0 ${index === activeVariantIndex ? 'border-white scale-110' : 'border-transparent opacity-70'}`}
                            style={{ backgroundColor: variant.color }}
                            aria-label={`Select ${variant.name} variant`}
                        />
                        ))}
                    </div>
                </div>

                {isWholesale ? (
                     <div>
                        <p className="text-sm font-semibold text-gray-400 mb-2">{t('availablePacks')}</p>
                        <div className="space-y-2">
                            {product.packs?.map((pack, index) => {
                                const packContents = Object.entries(pack.contents).map(([size, qty]) => `${qty}${size}`).join(', ');
                                return (
                                    <button key={pack.id} onClick={() => setSelectedPackIndex(index)} className={`block w-full text-left p-3 rounded-lg border-2 transition-colors ${selectedPackIndex === index ? 'bg-white/10 border-white' : 'bg-gray-800 border-gray-800 hover:bg-gray-700'}`}>
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold">{pack.name}</p>
                                            <p className="font-bold text-lg">${pack.price.toFixed(2)}</p>
                                        </div>
                                        <p className="text-xs text-gray-300">{packContents} - {t('totalXItems', {count: pack.totalQuantity})}</p>
                                        <p className="text-xs text-gray-400">({t('pricePerItem')}: ${(pack.price / pack.totalQuantity).toFixed(2)})</p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ) : product.sizes && product.sizes.length > 0 && (
                     <div>
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-semibold text-gray-400">{t('size')}</p>
                            <button onClick={() => onOpenFitFinder(product)} className="text-sm font-semibold text-blue-400 flex items-center gap-1.5 hover:text-blue-300" aria-label={t('findMySize')}>
                                <MagicWandIcon className="w-4 h-4" />
                                <span>{t('findMySize')}</span>
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map(size => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`px-4 py-2 text-sm rounded-lg border-2 font-semibold transition-colors ${selectedSize === size ? 'bg-white text-black border-white' : 'bg-gray-800 border-gray-800 text-white/80'}`}
                            >
                                {size}
                            </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <button 
                    onClick={handleAddToCartClick} 
                    className="w-full bg-white/90 text-black font-bold py-3 px-8 rounded-full text-base shadow-lg hover:bg-white transition-transform hover:scale-105 active:scale-100 flex items-center justify-center gap-2 mt-4"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('addToCart')}</span>
                </button>
            </div>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
                
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }

                @keyframes slideDown { from { transform: translateY(0); } to { transform: translateY(100%); } }
                .animate-slideDown { animation: slideDown 0.3s ease-in forwards; }
             `}</style>
        </div>
    )
}

interface ProductCardProps {
  product: Product;
  allProducts: Product[];
  isLiked: boolean;
  isSaved: boolean;
  onLikeToggle: (productId: string) => void;
  onSaveToggle: (productId: string) => void;
  onAddToCart: (productId: string, variantName: string, size?: string, packId?: string, specialPrice?: number) => void;
  onFilterByCreator: (creator: UserSummary) => void;
  onNavigateToFullProfile: (creator: UserSummary) => void;
  onNavigateToChat: (creator: UserSummary, product: Product) => void;
  onShare: (product: Product) => void;
  onOpenFitFinder: (product: Product) => void;
  onShopTheLookItemClick: (product: Product) => void;
  currentUser: User | null;
  onFollowToggle: (targetUserId: string) => void;
  initialVariantIndex?: number;
  isActive: boolean;
  observer?: IntersectionObserver | null;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  allProducts,
  isLiked,
  isSaved,
  onLikeToggle,
  onSaveToggle,
  onAddToCart,
  onFilterByCreator,
  onNavigateToFullProfile,
  onNavigateToChat,
  onShare,
  onOpenFitFinder,
  onShopTheLookItemClick,
  currentUser,
  onFollowToggle,
  initialVariantIndex,
  isActive,
  observer,
}) => {
  const { t } = useTranslation();
  const [activeVariantIndex, setActiveVariantIndex] = useState(initialVariantIndex ?? 0);
  const [showDetails, setShowDetails] = useState(false);
  const [showPurchaseOptions, setShowPurchaseOptions] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
  const volumeIndicatorTimeout = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef(new Map<number, HTMLVideoElement>());
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const tapTimeoutRef = useRef<number | null>(null);
  const [show3DCarousel, setShow3DCarousel] = useState(false);

  const isFollowing = currentUser?.followingIds.includes(product.creator.id);
  const isSelf = currentUser?.id === product.creator.id;

  const isDiscounted = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = isDiscounted ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;

  const isWholesale = product.isWholesale && product.packs && product.packs.length > 0;
  const wholesaleMinPricePerItem = isWholesale
    ? Math.min(...product.packs!.map(p => p.price / p.totalQuantity))
    : 0;

  const isNew = product.createdAt && (new Date().getTime() - new Date(product.createdAt).getTime()) < 3 * 24 * 60 * 60 * 1000;


  useEffect(() => {
    if (initialVariantIndex !== undefined) {
      setActiveVariantIndex(initialVariantIndex);
    }
  }, [initialVariantIndex]);

  useEffect(() => {
    // Iterate over ALL videos managed by this card
    videoRefs.current.forEach((video, index) => {
        const isTheActiveVariant = index === activeVariantIndex;
        const isVideoVariant = product.variants[index]?.mediaType === 'video';

        if (isActive && isTheActiveVariant && isVideoVariant) {
            // This is the active video on the active card, so play it.
            video.play().catch(error => console.log("Video autoplay blocked.", error));
        } else {
            // This is either:
            // 1. A video on an inactive card.
            // 2. A video for an inactive variant on the active card.
            // In both cases, it should be paused and reset.
            video.pause();
            if (video.currentTime !== 0) {
                video.currentTime = 0;
            }
        }
    });
  }, [isActive, activeVariantIndex, product.variants]);
  
  useEffect(() => {
    const node = cardRef.current;
    if (node && observer) {
        observer.observe(node);
        return () => observer.unobserve(node);
    }
  }, [observer]);

  useEffect(() => {
    return () => {
      if (volumeIndicatorTimeout.current) {
        clearTimeout(volumeIndicatorTimeout.current);
      }
      if(tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  const activeVariant = product.variants[activeVariantIndex];
  const shopTheLookProducts = product.shopTheLookProductIds
    ?.map(id => allProducts.find(p => p.id === id))
    .filter((p): p is Product => !!p) ?? [];

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
    } else {
      setTouchStartX(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const targetElement = e.target as HTMLElement;
    // Ignore taps on interactive elements within the card
    if (targetElement.closest('button, a, [onclick]')) {
        setTouchStartX(null);
        return;
    }

    if (touchStartX === null || e.changedTouches.length !== 1) {
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchStartX - touchEndX;
    const swipeThreshold = 50; // Min distance for a swipe

    // Check for swipe first
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      if (swipeDistance > 0) { // Swipe Left
        if (activeVariantIndex < product.variants.length - 1) {
          setActiveVariantIndex(prev => prev + 1);
        }
      } else { // Swipe Right
        if (activeVariantIndex > 0) {
          setActiveVariantIndex(prev => prev - 1);
        }
      }
    } else { // It's a tap
      if (tapTimeoutRef.current) { // Double tap
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
        setIsFocusMode(true); // ENTER FOCUS MODE
      } else { // First tap
        tapTimeoutRef.current = window.setTimeout(() => {
          // Single tap action for video volume
          if (activeVariant.mediaType === 'video') {
            setIsMuted(prev => !prev);
            setShowVolumeIndicator(true);
            if (volumeIndicatorTimeout.current) {
              clearTimeout(volumeIndicatorTimeout.current);
            }
            volumeIndicatorTimeout.current = window.setTimeout(() => {
              setShowVolumeIndicator(false);
            }, 1500);
          }
          tapTimeoutRef.current = null; // Reset for next tap sequence
        }, 300); // 300ms window for a double tap
      }
    }
    setTouchStartX(null);
  };

    const FocusModeOverlay = () => {
        const overlayTapTimeoutRef = useRef<number | null>(null);
        const pinchRef = useRef({ 
            initialDistance: 0, 
            initialScale: 1, 
            initialTransform: { x: 0, y: 0 },
            initialMidpoint: { x: 0, y: 0 }
        });
        const panRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, isPanning: false });
        const gestureDidMove = useRef(false);

        useEffect(() => {
            return () => {
                if (overlayTapTimeoutRef.current) {
                    clearTimeout(overlayTapTimeoutRef.current);
                }
            };
        }, []);

        const getDistance = (touches: React.TouchList) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
        const getMidpoint = (touches: React.TouchList) => ({ x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 });

        const handleOverlayTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
            e.stopPropagation();
            gestureDidMove.current = false;

            if (e.touches.length === 2) {
                panRef.current.isPanning = false;
                pinchRef.current.initialDistance = getDistance(e.touches);
                pinchRef.current.initialScale = transform.scale;
                pinchRef.current.initialTransform = { x: transform.x, y: transform.y };
                pinchRef.current.initialMidpoint = getMidpoint(e.touches);
            } else if (e.touches.length === 1 && transform.scale > 1) {
                panRef.current.startX = e.touches[0].clientX;
                panRef.current.startY = e.touches[0].clientY;
                panRef.current.initialX = transform.x;
                panRef.current.initialY = transform.y;
                panRef.current.isPanning = true;
            }
        };

        const handleOverlayTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            gestureDidMove.current = true;

            if (e.touches.length === 2) { // Pinch-to-zoom
                const { initialDistance, initialScale, initialTransform, initialMidpoint } = pinchRef.current;
                const currentDistance = getDistance(e.touches);
                const currentMidpoint = getMidpoint(e.touches);
                
                const scaleRatio = currentDistance / initialDistance;
                // Clamp scale between 1x and 5x
                const newScale = Math.max(1, Math.min(initialScale * scaleRatio, 5));
    
                // Calculate new translation to zoom towards the midpoint.
                // This formula ensures the point under the fingers' initial position
                // moves to the fingers' current position, adjusted for scale.
                const newX = currentMidpoint.x - ((initialMidpoint.x - initialTransform.x) * newScale / initialScale);
                const newY = currentMidpoint.y - ((initialMidpoint.y - initialTransform.y) * newScale / initialScale);

                // Clamp the translation to keep the image within bounds.
                // This uses the container dimensions, which is a good approximation.
                const containerWidth = window.innerWidth;
                const containerHeight = window.innerHeight;
                const maxOffsetX = Math.max(0, (containerWidth * newScale - containerWidth) / 2);
                const maxOffsetY = Math.max(0, (containerHeight * newScale - containerHeight) / 2);
                
                const clampedX = Math.max(-maxOffsetX, Math.min(maxOffsetX, newX));
                const clampedY = Math.max(-maxOffsetY, Math.min(maxOffsetY, newY));
    
                setTransform({ scale: newScale, x: clampedX, y: clampedY });
            } else if (e.touches.length === 1 && panRef.current.isPanning) { // Panning
                const dx = e.touches[0].clientX - panRef.current.startX;
                const dy = e.touches[0].clientY - panRef.current.startY;

                setTransform(prev => {
                    const containerWidth = window.innerWidth;
                    const containerHeight = window.innerHeight;
                    const maxOffsetX = Math.max(0, (containerWidth * prev.scale - containerWidth) / 2);
                    const maxOffsetY = Math.max(0, (containerHeight * prev.scale - containerHeight) / 2);
                    
                    const newX = panRef.current.initialX + dx;
                    const newY = panRef.current.initialY + dy;

                    return {
                        ...prev,
                        x: Math.max(-maxOffsetX, Math.min(maxOffsetX, newX)),
                        y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newY)),
                    };
                });
            }
        };

        const handleOverlayTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
            e.stopPropagation();
            panRef.current.isPanning = false;

            if (gestureDidMove.current || e.touches.length > 0) {
                 if (e.touches.length === 1 && transform.scale > 1) { // If one finger remains after pinch, switch to panning
                    panRef.current.startX = e.touches[0].clientX;
                    panRef.current.startY = e.touches[0].clientY;
                    panRef.current.initialX = transform.x;
                    panRef.current.initialY = transform.y;
                    panRef.current.isPanning = true;
                }
                return;
            }

            if (overlayTapTimeoutRef.current) { // Double tap
                clearTimeout(overlayTapTimeoutRef.current);
                overlayTapTimeoutRef.current = null;
                setIsFocusMode(false);
                setTransform({ scale: 1, x: 0, y: 0 });
            } else { // First tap
                overlayTapTimeoutRef.current = window.setTimeout(() => {
                    overlayTapTimeoutRef.current = null;
                }, 300);
            }
        };
        
        return (
             <div
                className="fixed inset-0 bg-black z-[100] flex items-center justify-center touch-none"
                onTouchStart={handleOverlayTouchStart}
                onTouchMove={handleOverlayTouchMove}
                onTouchEnd={handleOverlayTouchEnd}
            >
                <div
                    style={{
                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                        width: '100%',
                        height: '100%',
                    }}
                >
                    {activeVariant.mediaType === 'image' ? (
                        <img src={activeVariant.mediaUrl} alt={product.name} className="w-full h-full object-contain" draggable="false" />
                    ) : (
                        <video src={activeVariant.mediaUrl} autoPlay loop muted={isMuted} playsInline className="w-full h-full object-contain" />
                    )}
                </div>
            </div>
        );
    };

  return (
    <div 
        ref={cardRef}
        data-product-id={product.id}
        className="h-screen w-full snap-start relative text-white overflow-hidden font-sans"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 z-0 bg-black">
        {product.variants.map((variant, index) => {
          const isCurrentlyActive = index === activeVariantIndex;
          const commonClasses = `w-full h-full object-contain absolute inset-0 transition-opacity duration-500 ease-in-out ${isCurrentlyActive ? 'opacity-100' : 'opacity-0'}`;

          if (variant.mediaType === 'image') {
            return (
              <img
                key={`${product.id}-${variant.name}`}
                src={variant.mediaUrl}
                alt={product.name}
                className={commonClasses}
              />
            );
          } else { // video
            return (
              <video
                key={`${product.id}-${variant.name}`}
                ref={(el) => {
                  const map = videoRefs.current;
                  if (el) {
                    map.set(index, el);
                  } else {
                    map.delete(index);
                  }
                }}
                src={variant.mediaUrl}
                loop
                muted={isMuted}
                playsInline
                className={commonClasses}
              />
            );
          }
        })}
        
        {activeVariant.mediaType === 'video' && showVolumeIndicator && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/20 animate-fadeInOut pointer-events-none z-[5]">
                <div className="bg-black/50 backdrop-blur-sm p-4 rounded-full">
                    {isMuted ? <VolumeOffIcon className="w-10 h-10 text-white" /> : <VolumeUpIcon className="w-10 h-10 text-white" />}
                </div>
            </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-black/50 to-transparent pointer-events-none"></div>
      </div>
      
      <div className="relative z-10 flex flex-col justify-between h-full px-4 pt-6 pb-20">
        <header className="flex justify-between items-start gap-2">
            <div className="flex items-center bg-black/40 backdrop-blur-sm p-2 rounded-full max-w-[70%]">
                <div className="flex items-center gap-3 flex-shrink overflow-hidden">
                    <img 
                        src={product.creator.avatarUrl} 
                        alt={product.creator.username} 
                        className="w-9 h-9 rounded-full flex-shrink-0 cursor-pointer" 
                        onClick={() => onNavigateToFullProfile(product.creator)}
                    />
                    <div className="flex items-center gap-1.5 flex-shrink overflow-hidden">
                        <span 
                            className="font-semibold text-sm truncate cursor-pointer"
                            onClick={() => onNavigateToFullProfile(product.creator)}
                        >
                            {product.creator.username}
                        </span>
                        <button
                            onClick={() => onFilterByCreator(product.creator)}
                            className="p-1 text-white/70 hover:text-white rounded-full flex-shrink-0"
                            aria-label={`Filter by ${product.creator.username}`}
                        >
                            <GridIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {!isSelf && currentUser && (
                <button
                    onClick={() => onFollowToggle(product.creator.id)}
                    className={`ml-2 flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                    isFollowing
                        ? 'bg-transparent border border-white/50 text-white/80 hover:bg-white/10'
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                >
                    {isFollowing ? t('followingStatus') : t('follow')}
                </button>
                )}
            </div>
          
            <div className="flex flex-col items-end gap-3">
                {product.variants.length > 1 && (
                    <button
                        onClick={() => setShow3DCarousel(true)}
                        className="p-2 bg-black/30 backdrop-blur-sm rounded-full transition-transform hover:scale-110 active:scale-95"
                        aria-label="3D olarak görüntüle"
                    >
                        <CubeIcon className="w-6 h-6 text-white" />
                    </button>
                )}
                {product.variants.length > 1 && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center gap-2 p-2 bg-black/30 backdrop-blur-sm rounded-full">
                            {product.variants.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveVariantIndex(index)}
                                    aria-label={`Go to variant ${index + 1}`}
                                    className={`w-2 rounded-full transition-all duration-300 ease-in-out ${
                                    index === activeVariantIndex ? 'h-5 bg-white' : 'h-2 bg-white/60 hover:bg-white/80'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </header>
        
        <div className="absolute top-1/2 -translate-y-1/2 left-4 space-y-3">
            {shopTheLookProducts.map(item => (
                <ShopTheLookBubble key={item.id} product={item} onClick={onShopTheLookItemClick}/>
            ))}
        </div>

        <footer className="flex items-end justify-between">
          <div className="flex-1 flex flex-col items-start space-y-2 mr-4">
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-bold font-serif leading-tight tracking-tight">{product.name}</h2>
              {isNew && (
                <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse self-center">
                  {t('new')}
                </span>
              )}
            </div>
            <p className="text-sm leading-snug text-white/90 line-clamp-2">{product.description}</p>
            
            <div className="flex items-end gap-3 mt-2">
                <button 
                    onClick={() => setShowPurchaseOptions(true)} 
                    className="bg-white/90 text-black p-4 rounded-full shadow-lg hover:bg-white transition-transform hover:scale-105 active:scale-100 flex items-center justify-center"
                >
                    <ShoppingBagIcon className="w-6 h-6" />
                </button>
                <div className="bg-black/40 backdrop-blur-md border border-white/20 px-5 py-3 rounded-full shadow-lg">
                    {isWholesale ? (
                        <div>
                            <p className="text-2xl font-bold font-serif text-white">${wholesaleMinPricePerItem.toFixed(2)}</p>
                            <p className="text-xs text-gray-300 capitalize -mt-1">{t('pricePerItem')}</p>
                        </div>
                    ) : (
                        isDiscounted ? (
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold font-serif text-white">${product.price.toFixed(2)}</p>
                                    <p className="text-base text-gray-400 line-through">${product.originalPrice?.toFixed(2)}</p>
                                </div>
                                <div className="mt-1">
                                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                                        {t('savePercent', { percent: discountPercent })}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-2xl font-bold font-serif text-white">${product.price.toFixed(2)}</p>
                        )
                    )}
                </div>
            </div>
          </div>

          <aside className="flex flex-col gap-5 items-center">
            <button onClick={() => onLikeToggle(product.id)} className="flex flex-col items-center gap-1 p-2 transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95">
              <HeartIcon className={`w-8 h-8 transition-colors ${isLiked ? 'fill-red-500 stroke-red-500' : 'fill-transparent'}`} />
              <span className="text-xs font-semibold">{t('like')}</span>
            </button>
            <button
              onClick={() => onNavigateToChat(product.creator, product)}
              className="flex flex-col items-center gap-1 p-2 transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95"
            >
              <ChatBubbleIcon className="w-8 h-8" />
              <span className="text-xs font-semibold">{t('chat')}</span>
            </button>
            <button onClick={() => onSaveToggle(product.id)} className="flex flex-col items-center gap-1 p-2 transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95">
              <BookmarkIcon className={`w-8 h-8 transition-colors ${isSaved ? 'fill-white' : 'fill-transparent'}`} />
              <span className="text-xs font-semibold">{t('save')}</span>
            </button>
            <button onClick={() => setShowDetails(true)} className="flex flex-col items-center gap-1 p-2 transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95">
              <InfoIcon className="w-8 h-8 text-blue-400" />
              <span className="text-xs font-semibold">{t('info')}</span>
            </button>
            <button onClick={() => onShare(product)} className="flex flex-col items-center gap-1 p-2 transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95">
              <ShareIcon className="w-8 h-8" />
              <span className="text-xs font-semibold">{t('share')}</span>
            </button>
          </aside>
        </footer>
      </div>
      
      {showDetails && <ProductDetailSheet product={product} onClose={() => setShowDetails(false)} />}
      {showPurchaseOptions && 
        <PurchaseOptionsSheet 
            product={product}
            activeVariantIndex={activeVariantIndex} 
            onClose={() => setShowPurchaseOptions(false)} 
            onAddToCart={onAddToCart}
            onOpenFitFinder={onOpenFitFinder}
            onVariantChange={setActiveVariantIndex}
        />}
      {isFocusMode && <FocusModeOverlay />}
      {show3DCarousel && <VariantCarousel3D product={product} initialVariantIndex={activeVariantIndex} onClose={() => setShow3DCarousel(false)} onSelectVariant={setActiveVariantIndex} />}
      <style>{`
        .touch-none {
            touch-action: none;
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          10%, 80% { opacity: 1; }
        }
        .animate-fadeInOut { animation: fadeInOut 1.5s ease-in-out forwards; }
        .line-clamp-2 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};