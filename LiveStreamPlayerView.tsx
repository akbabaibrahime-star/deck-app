import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { LiveStream, Product, User, LiveComment } from '../types';
import { mockComments } from '../data/mockData';
import { useTranslation } from '../App';
import { HeartIcon, PaperAirplaneIcon, ShoppingBagIcon, SparklesIcon, CloseIcon, GridIcon, LockClosedIcon, LockOpenIcon, TagIcon } from './Icons';
import { PurchaseOptionsSheet } from './ProductCard'; // Reusing this component

interface LiveStreamPlayerViewProps {
  stream: LiveStream;
  currentUser: User;
  allUsers: User[];
  allProducts: Product[];
  onLeave: () => void;
  onAddToCart: (productId: string, variantName: string, size?: string, packId?: string, specialPrice?: number) => void;
  onOpenFitFinder: (product: Product) => void;
  onSendMessage: (streamId: string, text: string) => void;
  onNavigateToBasket: (streamId: string) => void;
  cartItemCount: number;
  onToggleHostControl: (streamId: string) => void;
  onHostPinProduct: (streamId: string, index: number | null) => void;
  onSetLiveDiscount: (streamId: string, productId: string, discountPercentage: number, durationMinutes: number) => void;
}

const formatViewerCount = (count: number) => {
    if (count < 1000) return count;
    return `${(count / 1000).toFixed(1)}k`;
}

const FloatingHeart: React.FC<{ id: number }> = ({ id }) => {
    const style = {
      right: `${Math.random() * 20 + 4}%`,
      animationDuration: `${Math.random() * 2 + 3}s`,
      animationDelay: `${Math.random() * 2}s`,
    };
    return <HeartIcon key={id} className="w-6 h-6 text-red-500 absolute bottom-0 animate-float" style={style} fill="currentColor" />;
};


const ProductPickerModal: React.FC<{
  products: Product[];
  currentPinnedIndex: number | null;
  onClose: () => void;
  onPinProduct: (index: number) => void;
  isHost: boolean;
  isHostControlled: boolean;
}> = ({ products, currentPinnedIndex, onClose, onPinProduct, isHost, isHostControlled }) => {
    const { t } = useTranslation();
    const canPin = isHost || !isHostControlled;
    return (
        <div className="fixed inset-0 bg-black/50 z-30 animate-fadeIn" onClick={onClose}>
            <div 
                className="fixed bottom-0 left-0 right-0 bg-[#121212] rounded-t-2xl p-4 max-h-[60vh] flex flex-col animate-slideUp" 
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold font-serif mb-4 flex-shrink-0">Showcase Products</h3>
                <div className="flex-grow overflow-y-auto">
                    <div className="grid grid-cols-3 gap-4">
                        {products.map((p, index) => (
                            <button 
                                key={p.id} 
                                onClick={() => { if(canPin) { onPinProduct(index); onClose(); } }}
                                className="w-full text-left space-y-1 group disabled:cursor-default"
                                disabled={!canPin}
                            >
                                <div className={`relative aspect-square rounded-lg overflow-hidden ring-2 ${currentPinnedIndex === index ? 'ring-blue-500' : 'ring-transparent'}`}>
                                    <img src={p.variants[0].mediaUrl} alt={p.name} className="w-full h-full object-contain bg-black/20 group-hover:scale-105 transition-transform" />
                                    {currentPinnedIndex === index && (
                                        <div className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 rounded-md">PINNED</div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold truncate">{p.name}</p>
                                    <p className="text-xs text-gray-400">${p.price.toFixed(2)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
            `}</style>
        </div>
    )
}

const CountdownTimer: React.FC<{ expiresAt: string }> = ({ expiresAt }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = new Date().getTime();
            const expirationTime = new Date(expiresAt).getTime();
            const distance = expirationTime - now;

            if (distance < 0) {
                setTimeLeft("00:00");
                clearInterval(intervalId);
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [expiresAt]);

    return (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-black animate-pulse">
            {timeLeft}
        </div>
    );
};

const DiscountCreationSheet: React.FC<{
    product: Product;
    onClose: () => void;
    onStartDiscount: (percentage: number, durationMinutes: number) => void;
}> = ({ product, onClose, onStartDiscount }) => {
    const [percentage, setPercentage] = useState(10);
    const [duration, setDuration] = useState(5);
    const [customPercentage, setCustomPercentage] = useState('');
    const [customDuration, setCustomDuration] = useState('');

    const [activePercentageTab, setActivePercentageTab] = useState<number | 'custom'>(10);
    const [activeDurationTab, setActiveDurationTab] = useState<number | 'custom'>(5);

    const handleStart = () => {
        const finalPercentage = activePercentageTab === 'custom' ? parseInt(customPercentage, 10) : percentage;
        const finalDuration = activeDurationTab === 'custom' ? parseInt(customDuration, 10) : duration;

        if (finalPercentage > 0 && finalPercentage < 100 && finalDuration > 0) {
            onStartDiscount(finalPercentage, finalDuration);
            onClose();
        } else {
            alert("Please enter a valid discount percentage (1-99) and duration (1+ minutes).");
        }
    };

    const isStartDisabled = (activePercentageTab === 'custom' && (!customPercentage || parseInt(customPercentage, 10) <= 0)) ||
                            (activeDurationTab === 'custom' && (!customDuration || parseInt(customDuration, 10) <= 0));

    const finalPercentage = activePercentageTab === 'custom' ? (parseInt(customPercentage, 10) || 0) : percentage;
    const finalDuration = activeDurationTab === 'custom' ? (parseInt(customDuration, 10) || 0) : duration;


    return (
        <div className="fixed inset-0 bg-black/50 z-30 animate-fadeIn" onClick={onClose}>
            <div 
                className="fixed bottom-0 left-0 right-0 bg-[#121212] rounded-t-2xl p-4 space-y-4 animate-slideUp"
                onClick={e => e.stopPropagation()}
            >
                 <h3 className="text-xl font-bold font-serif">Create Discount for {product.name}</h3>
                 
                 <div>
                    <p className="text-sm font-semibold text-gray-400 mb-2">Discount Percentage</p>
                    <div className="grid grid-cols-4 gap-2">
                        {[10, 20, 30].map(p => (
                             <button key={p} onClick={() => { setPercentage(p); setActivePercentageTab(p); }} className={`py-2 text-sm font-semibold rounded-lg transition-colors ${activePercentageTab === p ? 'bg-white text-black' : 'bg-gray-800'}`}>{p}%</button>
                        ))}
                        <button onClick={() => setActivePercentageTab('custom')} className={`py-2 text-sm font-semibold rounded-lg transition-colors ${activePercentageTab === 'custom' ? 'bg-white text-black' : 'bg-gray-800'}`}>Custom</button>
                    </div>
                    {activePercentageTab === 'custom' && (
                        <input
                            type="number"
                            value={customPercentage}
                            onChange={(e) => setCustomPercentage(e.target.value)}
                            min="1"
                            max="99"
                            placeholder="e.g., 25"
                            className="w-full mt-2 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-center"
                        />
                    )}
                 </div>

                 <div>
                    <p className="text-sm font-semibold text-gray-400 mb-2">Duration (minutes)</p>
                    <div className="grid grid-cols-4 gap-2">
                        {[2, 5, 10].map(d => (
                            <button key={d} onClick={() => { setDuration(d); setActiveDurationTab(d); }} className={`py-2 text-sm font-semibold rounded-lg transition-colors ${activeDurationTab === d ? 'bg-white text-black' : 'bg-gray-800'}`}>{d} min</button>
                        ))}
                         <button onClick={() => setActiveDurationTab('custom')} className={`py-2 text-sm font-semibold rounded-lg transition-colors ${activeDurationTab === 'custom' ? 'bg-white text-black' : 'bg-gray-800'}`}>Custom</button>
                    </div>
                     {activeDurationTab === 'custom' && (
                        <input
                            type="number"
                            value={customDuration}
                            onChange={(e) => setCustomDuration(e.target.value)}
                            min="1"
                            placeholder="e.g., 8"
                            className="w-full mt-2 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-center"
                        />
                    )}
                 </div>

                 <button onClick={handleStart} disabled={isStartDisabled} className="w-full bg-red-600 font-bold py-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
                    Start {finalPercentage > 0 ? `${finalPercentage}%` : ''} Discount for {finalDuration > 0 ? `${finalDuration} Minutes` : ''}
                 </button>
            </div>
        </div>
    );
};


export const LiveStreamPlayerView: React.FC<LiveStreamPlayerViewProps> = ({ stream, currentUser, allUsers, allProducts, onLeave, onAddToCart, onOpenFitFinder, onSendMessage, onNavigateToBasket, cartItemCount, onToggleHostControl, onHostPinProduct, onSetLiveDiscount }) => {
    const { t } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const host = useMemo(() => allUsers.find(u => u.id === stream.hostId), [allUsers, stream.hostId]);
    const showcaseProducts = useMemo(() => stream.productShowcaseIds.map(id => allProducts.find(p => p.id === id)).filter((p): p is Product => !!p), [stream.productShowcaseIds, allProducts]);
    const isHost = currentUser.id === stream.hostId;
    const isHostControlled = !!stream.isHostControlled;

    const [viewerCount, setViewerCount] = useState(stream.viewerCount);
    const [likesCount, setLikesCount] = useState(stream.likesCount);
    const [comments, setComments] = useState<LiveComment[]>(stream.comments);
    
    const [localPinnedProductIndex, setLocalPinnedProductIndex] = useState<number | null>(showcaseProducts.length > 0 ? 0 : null);
    
    const [commentInput, setCommentInput] = useState('');
    const [isPurchaseSheetOpen, setIsPurchaseSheetOpen] = useState(false);
    const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
    const [isDiscountSheetOpen, setIsDiscountSheetOpen] = useState(false);
    const [floatingHearts, setFloatingHearts] = useState<number[]>([]);
    const commentsEndRef = useRef<HTMLDivElement>(null);
    const [activeVariantIndex, setActiveVariantIndex] = useState(0);
    const streamRef = useRef<MediaStream | null>(null);

    const displayProductIndex = isHostControlled && !isHost ? stream.hostPinnedProductIndex : localPinnedProductIndex;
    
    useEffect(() => {
        if(isHost) {
            onHostPinProduct(stream.id, localPinnedProductIndex);
        }
    }, [isHost, localPinnedProductIndex, onHostPinProduct, stream.id]);

    // --- MOCK LIVE SIMULATION ---
    useEffect(() => {
        // Simulate viewer count changes
        const viewerInterval = setInterval(() => {
            setViewerCount(vc => Math.max(1, vc + (Math.floor(Math.random() * 11) - 5)));
        }, 3000);

        // Simulate incoming comments
        const commentInterval = setInterval(() => {
            const randomComment = mockComments[Math.floor(Math.random() * mockComments.length)];
            const newComment: LiveComment = {
                ...randomComment,
                id: `c-${Date.now()}`,
                timestamp: new Date().toISOString(),
            };
            setComments(c => [...c, newComment].slice(-50)); // Keep last 50 comments
        }, 5000);

        return () => {
            clearInterval(viewerInterval);
            clearInterval(commentInterval);
        };
    }, []);

     useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        if (isHost && stream.status === 'live') {
            const initializeMediaStream = async () => {
                try {
                    // First, try to get both video and audio
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    streamRef.current = mediaStream;
                    videoElement.srcObject = mediaStream;
                    videoElement.muted = true; // Mute self-view to prevent feedback
                    await videoElement.play();
                } catch (err) {
                    console.warn("getUserMedia with audio+video failed, trying video-only:", err);
                    if (err instanceof DOMException && (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError' || err.name === 'NotReadableError' || err.name === 'TrackStartError')) {
                        try {
                            // If that fails (e.g., no microphone), try video only
                            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                            streamRef.current = mediaStream;
                            videoElement.srcObject = mediaStream;
                            videoElement.muted = true;
                            await videoElement.play();
                        } catch (videoErr) {
                            console.error("Failed to get media stream (video-only attempt):", videoErr);
                            if(stream.playbackUrl) videoElement.src = stream.playbackUrl;
                        }
                    } else {
                        // Handle other errors like permission denied
                        console.error("Failed to get media stream:", err);
                        if(stream.playbackUrl) videoElement.src = stream.playbackUrl;
                    }
                }
            };
            initializeMediaStream();
        } else {
             if(stream.playbackUrl) videoElement.src = stream.playbackUrl;
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [isHost, stream.status, stream.playbackUrl]);


    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    useEffect(() => {
        setActiveVariantIndex(0); // Reset to first variant when pinned product changes
    }, [displayProductIndex]);
    
    const handleLike = () => {
        setLikesCount(l => l + 1);
        const newHeartId = Date.now();
        setFloatingHearts(hearts => [...hearts, newHeartId]);
        setTimeout(() => {
            setFloatingHearts(hearts => hearts.filter(id => id !== newHeartId));
        }, 5000);
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentInput.trim()) {
            onSendMessage(stream.id, commentInput);
            const newComment: LiveComment = {
                id: `c-${Date.now()}`,
                userId: currentUser.id,
                username: currentUser.username,
                avatarUrl: currentUser.avatarUrl,
                text: commentInput,
                timestamp: new Date().toISOString(),
                type: 'comment'
            };
            setComments(c => [...c, newComment]);
            setCommentInput('');
        }
    }

    const pinnedProduct = displayProductIndex !== null ? showcaseProducts[displayProductIndex] : null;

    const isDiscountActive = pinnedProduct && stream.activeDiscount && stream.activeDiscount.productId === pinnedProduct.id && new Date(stream.activeDiscount.expiresAt) > new Date();
    const discountedPrice = isDiscountActive ? pinnedProduct!.price * (1 - stream.activeDiscount!.discountPercentage / 100) : 0;

    return (
        <div className="h-screen w-full bg-black text-white flex flex-col relative overflow-hidden">
            <video ref={videoRef} autoPlay loop playsInline className="absolute inset-0 w-full h-full object-cover z-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/50 z-10"></div>
            
            <div className="relative z-20 flex flex-col h-full p-4">
                {/* Header */}
                <header className="flex justify-between items-start">
                    <div className="flex items-center gap-3 p-2 bg-black/40 backdrop-blur-sm rounded-full">
                        <img src={host?.avatarUrl} alt={host?.username} className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="font-bold">{host?.username}</p>
                            <p className="text-xs text-gray-300">New Collection</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-xs font-semibold">
                            {formatViewerCount(viewerCount)} viewers
                        </div>
                        <button onClick={onLeave} className="p-2 bg-black/40 backdrop-blur-sm rounded-full">
                            <CloseIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </header>

                <div className="flex-grow flex flex-col justify-end overflow-hidden">
                    {/* Floating Hearts */}
                    <div className="absolute bottom-20 right-0 h-1/2 w-24 pointer-events-none">
                        {floatingHearts.map(id => <FloatingHeart key={id} id={id} />)}
                    </div>
                    {/* Comment Feed */}
                    <div className="w-full max-w-sm h-48 overflow-y-scroll no-scrollbar mask-image-b">
                        <div className="space-y-2 pb-4">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex items-start gap-2 text-sm animate-comment-in">
                                    <img src={comment.avatarUrl} alt={comment.username} className="w-6 h-6 rounded-full mt-0.5" />
                                    <div>
                                        <span className="font-bold opacity-80">{comment.username}</span>
                                        <span className="ml-2">{comment.text}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <div ref={commentsEndRef} />
                    </div>
                </div>

                {/* Live Product Spotlight */}
                {pinnedProduct && !isPurchaseSheetOpen && (
                     <div className="relative w-full flex items-center justify-between gap-3 bg-black/50 backdrop-blur-md p-2 rounded-2xl mb-4 animate-slide-in-bottom shadow-lg">
                        {isDiscountActive && <CountdownTimer expiresAt={stream.activeDiscount!.expiresAt} />}
                        <button 
                            onClick={() => setIsProductPickerOpen(true)}
                            className="flex items-center gap-3 overflow-hidden flex-1"
                            disabled={!isHost && isHostControlled}
                        >
                            <img src={pinnedProduct.variants[activeVariantIndex].mediaUrl} alt={pinnedProduct.name} className="w-12 h-12 object-contain bg-black/20 rounded-lg flex-shrink-0" />
                            <div className="text-left">
                                <p className="font-bold text-sm truncate">{pinnedProduct.name}</p>
                                {isDiscountActive ? (
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-sm font-semibold text-red-400">${discountedPrice.toFixed(2)}</p>
                                        <p className="text-xs text-gray-400 line-through">${pinnedProduct.price.toFixed(2)}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm font-semibold">${pinnedProduct.price.toFixed(2)}</p>
                                )}
                            </div>
                        </button>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {isHost && (
                                <>
                                 <button onClick={() => setIsDiscountSheetOpen(true)} className={`p-3 rounded-full transition-colors bg-white/10 hover:bg-white/20`}>
                                    <TagIcon className="w-6 h-6 text-yellow-400"/>
                                </button>
                                <button onClick={() => onToggleHostControl(stream.id)} className={`p-3 rounded-full transition-colors ${isHostControlled ? 'bg-blue-600/50' : 'bg-white/10 hover:bg-white/20'}`}>
                                    {isHostControlled ? <LockClosedIcon className="w-6 h-6 text-blue-300"/> : <LockOpenIcon className="w-6 h-6"/>}
                                </button>
                                </>
                            )}
                            <button onClick={() => setIsProductPickerOpen(true)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 disabled:opacity-50" disabled={!isHost && isHostControlled}>
                                <GridIcon className="w-6 h-6"/>
                            </button>
                            <button onClick={() => setIsPurchaseSheetOpen(true)} className="p-3 bg-blue-600 rounded-full hover:bg-blue-500">
                                <ShoppingBagIcon className="w-6 h-6"/>
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer Controls */}
                <footer className="flex items-center gap-3">
                    <form onSubmit={handleCommentSubmit} className="flex-1">
                       <input type="text" value={commentInput} onChange={e => setCommentInput(e.target.value)} placeholder="Yorum ekle..." className="w-full bg-black/40 backdrop-blur-sm rounded-full py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/50" />
                    </form>
                    <button onClick={() => onNavigateToBasket(stream.id)} className="relative p-3 bg-black/40 backdrop-blur-sm rounded-full">
                        <ShoppingBagIcon className="w-6 h-6"/>
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartItemCount}</span>
                        )}
                    </button>
                    <button onClick={handleLike} className="p-3 bg-black/40 backdrop-blur-sm rounded-full"><HeartIcon className="w-6 h-6"/></button>
                </footer>
            </div>

            {isPurchaseSheetOpen && pinnedProduct && (
                 <PurchaseOptionsSheet 
                    product={pinnedProduct} 
                    activeVariantIndex={activeVariantIndex}
                    onClose={() => setIsPurchaseSheetOpen(false)}
                    onAddToCart={onAddToCart}
                    onOpenFitFinder={onOpenFitFinder}
                    onVariantChange={setActiveVariantIndex}
                    activeDiscount={stream.activeDiscount}
                />
            )}

            {isProductPickerOpen && (
                <ProductPickerModal
                    products={showcaseProducts}
                    currentPinnedIndex={displayProductIndex}
                    onClose={() => setIsProductPickerOpen(false)}
                    onPinProduct={setLocalPinnedProductIndex}
                    isHost={isHost}
                    isHostControlled={isHostControlled}
                />
            )}
            
            {isDiscountSheetOpen && isHost && pinnedProduct && (
                <DiscountCreationSheet 
                    product={pinnedProduct}
                    onClose={() => setIsDiscountSheetOpen(false)}
                    onStartDiscount={(percentage, duration) => onSetLiveDiscount(stream.id, pinnedProduct.id, percentage, duration)}
                />
            )}
            
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .mask-image-b { mask-image: linear-gradient(to bottom, black 50%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%); }
                @keyframes float { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-300px); opacity: 0; } }
                .animate-float { animation-name: float; animation-timing-function: ease-out; animation-iteration-count: 1; animation-fill-mode: forwards; }
                @keyframes comment-in { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                .animate-comment-in { animation: comment-in 0.3s ease-out forwards; }
                @keyframes slide-in-bottom { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slide-in-bottom { animation: slide-in-bottom 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
            `}</style>
        </div>
    );
};