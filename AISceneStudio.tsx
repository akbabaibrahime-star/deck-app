

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CloseIcon, PlusIcon, SparklesIcon, PhotographIcon, TrashIcon, PlayIcon } from './Icons';
import html2canvas from 'html2canvas';

// --- TYPE DEFINITIONS ---
interface Layer {
  id: string;
  type: 'product' | 'sticker' | 'text' | 'emoji';
  content: string; // image src or text content
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  // Text specific
  color?: string;
  fontFamily?: 'sans' | 'serif' | 'cursive';
  animation?: 'none' | 'pulse' | 'fadeIn' | 'slideIn' | 'bounce';
}

interface Background {
  type: 'color' | 'gradient' | 'image';
  value: string; // hex code, css gradient, image url
}

interface AICreativeStudioProps {
  onSave: (generatedImageUrl: string) => void;
  onClose: () => void;
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.crossOrigin = 'anonymous';
        img.src = src;
    });
};

// --- EMOJI RENDERING UTILITY ---
const emojiDataUriCache = new Map<string, string>();
const getEmojiDataUri = (emoji: string): string => {
    if (emojiDataUriCache.has(emoji)) {
        return emojiDataUriCache.get(emoji)!;
    }

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) return '';

    context.font = `${size * 0.8}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(emoji, size / 2, size / 2 + (size * 0.05)); 
    
    const dataUri = canvas.toDataURL('image/png');
    emojiDataUriCache.set(emoji, dataUri);
    return dataUri;
};

const animatedEmojis = [
    { name: 'Like', url: 'https://i.pinimg.com/originals/36/1a/1a/361a1a5433f114c642334b3274719c8.gif', description: "Animate the 'Like' button sticker with the classic Facebook-style animation: the thumb moves up, and blue particles burst around it." },
    { name: 'Heart', url: 'https://i.gifer.com/origin/20/203a1168393537359a1f72782552b21c_w200.gif', description: "Animate the heart sticker to beat like a pulse, glowing gently with each beat." },
    { name: 'Clapping', url: 'https://i.gifer.com/origin/a6/a62243d6c70d10b719463996f5e26943_w200.gif', description: "Animate the clapping hands sticker to clap realistically." },
    { name: 'Sparkles', url: 'https://i.gifer.com/origin/62/62def2900c28358a82d56d540243e8d2_w200.gif', description: "Animate the sparkles sticker to twinkle and glitter brightly." },
    { name: 'Fire', url: 'https://i.gifer.com/origin/51/515359b719484964757c9a99b82878b2_w200.gif', description: "Animate the fire sticker with flickering flames." },
    { name: '100', url: 'https://i.gifer.com/origin/49/492965456f5b9d75531e2101831139a7_w200.gif', description: "Animate the '100' sticker to pop and have a slight shine effect." }
];

const emojiCategories = [
    { name: 'Animasyonlu', emojis: [] },
    {
        name: 'Yüz İfadeleri ve Duygular',
        emojis: ['😀', '😂', '😍', '😭', '😎', '🤔', '😴', '🥳', '🤯', '😡', '😱', '🥺', '👍', '👎', '🙌', '🙏', '👏', '💖', '💔', '💯'],
    },
    {
        name: 'Nesneler',
        emojis: ['💻', '📱', '📸', '💎', '🎁', '💡', '💰', '🔑', '🛍️', '👠', '💄', '🎩', '👑', '💍', '🎨', '🎵', '🚗', '✈️', '🚀', '⚽'],
    },
    {
        name: 'Semboller',
        emojis: ['❤️', '🔥', '✨', '⭐', '🎉', '✅', '❌', '➡️', '❓', '❗️', '💭', '💬', '⚙️', '🔍', '⏳', '💡', '🔗', '📍', '☀️', '🌙'],
    },
    {
        name: 'Yiyecek & İçecek',
        emojis: ['🍕', '🍔', '🍟', '☕', '🍷', '🍰', '🍦', '🍩', '🥑', '🍓', '🍉', '🍾', '🥂', '🍿', '🌮', '🍣', '🍫', '🍭', '🍪', '🍹'],
    }
];

// --- MAIN COMPONENT ---
export const AISceneStudio: React.FC<AICreativeStudioProps> = ({ onSave, onClose }) => {
    const [layers, setLayers] = useState<Layer[]>([]);
    const [background, setBackground] = useState<Background>({ type: 'color', value: '#1a1a1a' });
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
    const [modal, setModal] = useState<'background' | 'text' | 'sticker' | 'emoji' | null>(null);
    const [generationState, setGenerationState] = useState<'idle' | 'loading' | 'video_generating' | 'video_done'>('idle');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const productFileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [activeEmojiCategory, setActiveEmojiCategory] = useState(emojiCategories[0].name);

    const hasAnimation = useMemo(() => {
        return layers.some(l => 
            (l.content.endsWith('.gif')) ||
            ((l.type === 'text' || l.type === 'emoji') && l.animation && l.animation !== 'none')
        );
    }, [layers]);

    const getFontClass = (fontFamily: Layer['fontFamily']) => {
        switch (fontFamily) {
            case 'serif': return 'font-serif';
            case 'cursive': return 'font-cursive-custom';
            default: return 'font-sans';
        }
    };
    
    const getAnimationClass = (animation: Layer['animation']) => {
        switch (animation) {
            case 'pulse': return 'animate-pulse-text';
            case 'fadeIn': return 'animate-fadeIn-text';
            case 'slideIn': return 'animate-slideIn-text';
            case 'bounce': return 'animate-bounce-text';
            default: return '';
        }
    };

    const handleAddLayer = (type: Layer['type'], content: string, options: { width?: number; height?: number } = {}) => {
        const newLayer: Layer = {
            id: `layer-${Date.now()}`,
            type,
            content,
            x: 0,
            y: 0,
            width: options.width ?? (type === 'text' ? 200 : 150),
            height: options.height ?? (type === 'text' ? 50 : 150),
            rotation: 0,
            color: type === 'text' ? '#FFFFFF' : undefined,
            animation: (type === 'text' || type === 'emoji') ? 'none' : undefined,
            fontFamily: type === 'text' ? 'sans' : undefined,
        };
        setLayers(prev => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
    };

    const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleAddLayer('product', reader.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleGenerateAIAsset = async (type: 'background' | 'sticker' | 'pattern', prompt: string) => {
        setGenerationState('loading');
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            let generationPrompt = prompt;
            if (type === 'background') {
                setLoadingMessage("Hayalinizdeki arka plan oluşturuluyor...");
                generationPrompt = `Photorealistic e-commerce product background photography. Scene: ${prompt}. Style: clean, professional, high-resolution, suitable for placing a product on. No main object in the scene.`;
            } else if (type === 'pattern') {
                setLoadingMessage("Soyut desen oluşturuluyor...");
                generationPrompt = `A seamless, abstract, visually pleasing pattern. Style: ${prompt}.`;
            } else if (type === 'sticker') {
                setLoadingMessage("AI çıkartması oluşturuluyor...");
                generationPrompt = `A high-resolution, professional sticker of "${prompt}". Centered object, sticker style, on a plain white background.`;
            }
// FIX: Updated the deprecated image generation model 'imagen-3.0-generate-002' to 'imagen-4.0-generate-001' to align with the latest API guidelines.
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: generationPrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' },
            });

            const imageB64 = imageResponse.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${imageB64}`;

            if (type === 'sticker') {
                handleAddLayer('sticker', imageUrl);
            } else {
                setBackground({ type: 'image', value: imageUrl });
            }
        } catch (err) {
            console.error("AI Generation failed:", err);
            setError("Görsel oluşturulamadı. Lütfen tekrar deneyin.");
        } finally {
            setGenerationState('idle');
            setModal(null);
        }
    };
    
    const handleSaveImage = async () => {
        const canvasContainer = canvasRef.current;
        if (!canvasContainer) return;
    
        setLoadingMessage("Final image being composed...");
        setGenerationState('loading');

        try {
            // Deselect layer to hide border before capture
            setSelectedLayerId(null);
            await new Promise(resolve => setTimeout(resolve, 50)); // allow UI to update

            const canvas = await html2canvas(canvasContainer, {
                allowTaint: true,
                useCORS: true,
                backgroundColor: null, 
            });
            onSave(canvas.toDataURL('image/jpeg'));
        } catch (err) {
            console.error("Failed to save canvas", err);
            setError("Görsel kaydedilemedi.");
            setGenerationState('idle');
        }
    };

     const handleGenerateVideo = async () => {
        const canvasContainer = canvasRef.current;
        if (!canvasContainer) return;
    
        setGenerationState('video_generating');
        setLoadingMessage('Tasarımınız yakalanıyor...');
        setError(null);

        try {
            // Deselect layer to hide border before capture
            setSelectedLayerId(null);
            await new Promise(resolve => setTimeout(resolve, 50)); // allow UI to update
            
            const canvas = await html2canvas(canvasContainer, { allowTaint: true, useCORS: true, backgroundColor: null });
            const imageBase64 = canvas.toDataURL('image/png').split(',')[1];
            
            let prompt = "Animate this static image into a short, looping video (around 5 seconds). Bring it to life with subtle, professional motion. Follow these specific animation instructions:\n";
            
            layers.forEach(layer => {
               if (layer.type === 'sticker' && layer.content.endsWith('.gif')) {
                 const gifDetails = animatedEmojis.find(gif => gif.url === layer.content);
                 if (gifDetails && gifDetails.description) {
                     prompt += `- ${gifDetails.description}\n`;
                 } else {
                     prompt += `- The sticker with the GIF should animate naturally according to its content.\n`;
                 }
               } else if ((layer.type === 'text' || layer.type === 'emoji') && layer.animation && layer.animation !== 'none') {
                 prompt += `- The text or emoji "${layer.content}" should animate with a "${layer.animation}" effect.\n`;
               }
            });

            setLoadingMessage('AI videonuzu oluşturuyor (bu işlem birkaç dakika sürebilir)...');

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            let operation = await ai.models.generateVideos({
              model: 'veo-2.0-generate-001',
              prompt,
              image: { imageBytes: imageBase64, mimeType: 'image/png' },
              config: { numberOfVideos: 1 }
            });

            while (!operation.done) {
              await new Promise(resolve => setTimeout(resolve, 10000));
              operation = await ai.operations.getVideosOperation({operation: operation});
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                 const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                 const videoBlob = await response.blob();
                 const objectURL = URL.createObjectURL(videoBlob);
                 setVideoUrl(objectURL);
                 setGenerationState('video_done');
            } else {
                throw new Error("Video generation completed but no download link was provided.");
            }
        } catch (err) {
            console.error("Video generation failed:", err);
            setError("Video oluşturulamadı. Lütfen tekrar deneyin.");
            setGenerationState('idle');
        }
    };

    const selectedLayer = layers.find(l => l.id === selectedLayerId);
    
    const updateSelectedLayer = (props: Partial<Layer>) => {
        if (!selectedLayerId) return;
        setLayers(layers.map(l => l.id === selectedLayerId ? { ...l, ...props } : l));
    };
    
    const deleteSelectedLayer = () => {
        if (!selectedLayerId) return;
        setLayers(layers.filter(l => l.id !== selectedLayerId));
        setSelectedLayerId(null);
    }

    const renderModals = () => {
        if (generationState !== 'idle') {
            return (
                 <div className="absolute inset-0 bg-black/80 z-20 p-4 flex flex-col items-center justify-center space-y-4">
                    {generationState === 'video_done' && videoUrl ? (
                         <>
                            <h3 className="text-xl font-bold text-center">Videonuz Hazır!</h3>
                            <video src={videoUrl} controls autoPlay loop className="w-full max-w-xs rounded-lg" />
                            <div className="flex gap-2">
                                <a href={videoUrl} download="deck-creative-video.mp4" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">İndir</a>
                                <button onClick={() => { setGenerationState('idle'); setVideoUrl(null); }} className="bg-gray-700 py-2 px-4 rounded">Kapat</button>
                            </div>
                         </>
                    ) : (
                         <>
                            <SparklesIcon className="w-12 h-12 text-purple-400 animate-pulse" />
                            <p className="mt-4 text-lg font-semibold text-center">{loadingMessage}</p>
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                         </>
                    )}
                </div>
            )
        }
        if (modal === 'background') {
            let prompt = "a clean, white marble countertop with soft, natural light";
            return (
                <div className="absolute inset-0 bg-black/80 z-20 p-4 flex flex-col justify-center space-y-4">
                    <h3 className="text-xl font-bold text-center">Arka Planı Ayarla</h3>
                    <div className="p-4 bg-gray-900 rounded-lg space-y-2">
                        <label className="text-sm">Gradyan</label>
                        <input type="color" defaultValue="#4a00e0" onChange={(e) => setBackground({ type: 'gradient', value: `linear-gradient(45deg, ${e.target.value}, #8e2de2)`})} className="w-full h-10"/>
                    </div>
                    <div className="p-4 bg-gray-900 rounded-lg space-y-2">
                         <label className="text-sm">AI Fotoğraf / Desen</label>
                         <textarea id="bg-prompt" rows={2} defaultValue={prompt} className="w-full bg-gray-800 rounded p-2 text-sm" onChange={e => prompt = e.target.value}/>
                         <div className="flex gap-2">
                            <button onClick={() => handleGenerateAIAsset('background', prompt)} className="flex-1 bg-purple-600 py-2 rounded">Fotoğraf Oluştur</button>
                            <button onClick={() => handleGenerateAIAsset('pattern', prompt)} className="flex-1 bg-purple-600 py-2 rounded">Desen Oluştur</button>
                         </div>
                    </div>
                     <button onClick={() => setModal(null)} className="bg-gray-700 py-2 rounded">Kapat</button>
                </div>
            )
        }
         if (modal === 'sticker') {
            let prompt = "gold paint splash";
            return (
                <div className="absolute inset-0 bg-black/80 z-20 p-4 flex flex-col justify-center space-y-4">
                    <h3 className="text-xl font-bold text-center">AI Çıkartması Ekle</h3>
                    <div className="p-4 bg-gray-900 rounded-lg space-y-2">
                         <label className="text-sm">Ne oluşturmak istersiniz?</label>
                         <textarea id="sticker-prompt" rows={2} defaultValue={prompt} className="w-full bg-gray-800 rounded p-2 text-sm" onChange={e => prompt = e.target.value} />
                         <button onClick={() => handleGenerateAIAsset('sticker', prompt)} className="w-full bg-purple-600 py-2 rounded">Çıkartma Oluştur</button>
                    </div>
                    <button onClick={() => setModal(null)} className="bg-gray-700 py-2 rounded">Kapat</button>
                </div>
            )
        }
        if (modal === 'text') {
             let text = "Yeni Sezon";
             return (
                <div className="absolute inset-0 bg-black/80 z-20 p-4 flex flex-col justify-center space-y-4">
                     <h3 className="text-xl font-bold text-center">Metin Ekle</h3>
                     <div className="p-4 bg-gray-900 rounded-lg space-y-2">
                        <textarea id="text-input" rows={2} defaultValue={text} className="w-full bg-gray-800 rounded p-2 text-sm" onChange={e => text = e.target.value}/>
                        <button onClick={() => { handleAddLayer('text', text); setModal(null); }} className="w-full bg-blue-600 py-2 rounded">Metin Ekle</button>
                     </div>
                     <button onClick={() => setModal(null)} className="bg-gray-700 py-2 rounded">Kapat</button>
                </div>
             )
        }
        if (modal === 'emoji') {
            const currentCategory = emojiCategories.find(cat => cat.name === activeEmojiCategory);
            return (
               <div className="absolute inset-0 bg-black/80 z-20 p-4 flex flex-col justify-center">
                   <div className="bg-gray-900 rounded-lg flex flex-col h-[70vh] max-h-[500px]">
                       <h3 className="text-xl font-bold text-center p-4 flex-shrink-0">Emoji Seç</h3>
                       <div className="flex-shrink-0 border-b border-gray-700 px-2">
                           <div className="flex space-x-2 overflow-x-auto pb-2">
                               {emojiCategories.map(cat => (
                                   <button
                                       key={cat.name}
                                       onClick={() => setActiveEmojiCategory(cat.name)}
                                       className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${activeEmojiCategory === cat.name ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                                   >
                                       {cat.name}
                                   </button>
                               ))}
                           </div>
                       </div>
                       <div className="flex-grow overflow-y-auto p-4">
                           {activeEmojiCategory === 'Animasyonlu' ? (
                                <div className="grid grid-cols-4 gap-4">
                                    {animatedEmojis.map(gif => (
                                        <button
                                            key={gif.name}
                                            onClick={() => {
                                                handleAddLayer('sticker', gif.url, { width: 100, height: 100 });
                                                setModal(null);
                                            }}
                                            className="aspect-square flex items-center justify-center bg-gray-800 rounded-lg hover:bg-gray-700 p-1"
                                            title={gif.name}
                                        >
                                            <img src={gif.url} alt={gif.name} className="w-full h-full object-contain" />
                                        </button>
                                    ))}
                                </div>
                           ) : (
                                <div className="grid grid-cols-5 gap-4">
                                    {currentCategory?.emojis.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => {
                                                handleAddLayer('emoji', emoji, { width: 80, height: 80 });
                                                setModal(null);
                                            }}
                                            className="text-3xl aspect-square flex items-center justify-center bg-gray-800 rounded-lg hover:bg-gray-700 transition-transform hover:scale-110"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                           )}
                       </div>
                       <div className="p-4 flex-shrink-0 border-t border-gray-700">
                           <button onClick={() => setModal(null)} className="w-full bg-gray-700 py-2 rounded">Kapat</button>
                       </div>
                   </div>
               </div>
            )
        }
        return null;
    }

    const handleLayerDrag = (e: React.MouseEvent | React.TouchEvent, layer: Layer) => {
        e.preventDefault();
        e.stopPropagation();
        if (generationState !== 'idle') return;
        setSelectedLayerId(layer.id);
    
        const isTouchEvent = 'touches' in e;
        const startClientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
        const startClientY = isTouchEvent ? e.touches[0].clientY : e.clientY;
    
        const startX = layer.x;
        const startY = layer.y;
    
        const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
            const moveClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
            const moveClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
            const dx = moveClientX - startClientX;
            const dy = moveClientY - startClientY;
            updateSelectedLayer({ x: startX + dx, y: startY + dy });
        };
    
        const handleEnd = () => {
            document.removeEventListener('mousemove', handleMove as any);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove as any);
            document.removeEventListener('touchend', handleEnd);
        };
    
        document.addEventListener(isTouchEvent ? 'touchmove' : 'mousemove', handleMove as any);
        document.addEventListener(isTouchEvent ? 'touchend' : 'mouseup', handleEnd);
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex flex-col animate-fadeIn">
            <div className="w-full h-full max-w-md mx-auto flex flex-col bg-black text-white">
                <header className="p-4 flex justify-between items-center bg-[#121212] flex-shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2"><SparklesIcon /> AI Kreatif Stüdyo</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6" /></button>
                </header>

                <main className="flex-grow flex flex-col overflow-hidden relative">
                    {renderModals()}
                    {/* Canvas */}
                    <div 
                        ref={canvasRef} 
                        className="flex-1 w-full aspect-[4/5] bg-gray-900 relative overflow-hidden select-none" 
                        style={{ background: background.value }}
                        onClick={() => setSelectedLayerId(null)}
                    >
                        {background.type === 'image' && <img src={background.value} className="absolute inset-0 w-full h-full object-cover" alt="background"/>}
                        {layers.map(layer => {
                            const isSelected = layer.id === selectedLayerId;
                             return (
                                <div
                                    key={layer.id}
                                    onMouseDown={(e) => handleLayerDrag(e, layer)}
                                    onTouchStart={(e) => handleLayerDrag(e, layer)}
                                    className={`absolute top-1/2 left-1/2 cursor-move ${isSelected ? 'border-2 border-dashed border-blue-400' : ''}`}
                                    style={{
                                        transform: `translate(-50%, -50%) translate(${layer.x}px, ${layer.y}px) rotate(${layer.rotation}deg)`,
                                        width: layer.width,
                                        height: layer.height,
                                        color: layer.color
                                    }}
                                >
                                    {(() => {
                                        if (layer.type === 'text') {
                                            return (
                                                <div 
                                                    className={`w-full h-full flex items-center justify-center text-center font-bold whitespace-pre-wrap pointer-events-none ${getFontClass(layer.fontFamily)} ${getAnimationClass(layer.animation)}`}
                                                    style={{ fontSize: `${layer.height * 0.75}px`, lineHeight: 1 }}
                                                >
                                                    {layer.content}
                                                </div>
                                            );
                                        } else if (layer.type === 'emoji') {
                                            const emojiUri = getEmojiDataUri(layer.content);
                                            return (
                                                <img 
                                                    src={emojiUri}
                                                    alt={layer.content}
                                                    className={`w-full h-full object-contain pointer-events-none ${getAnimationClass(layer.animation)}`}
                                                    draggable="false"
                                                />
                                            );
                                        } else { // Product or Sticker
                                            return (
                                                <img 
                                                    src={layer.content} 
                                                    className={`w-full h-full object-contain pointer-events-none ${getAnimationClass(layer.animation)}`}
                                                    alt={layer.type} 
                                                    draggable="false"
                                                />
                                            );
                                        }
                                    })()}
                                </div>
                             )
                        })}
                    </div>

                    {/* Inspector / Toolbar */}
                    <div className="flex-shrink-0 bg-[#121212] p-2 space-y-2">
                        <div className="grid grid-cols-5 gap-2 text-center text-xs">
                            <button onClick={() => setModal('background')} className="p-2 bg-gray-800 rounded-lg">Arka Plan</button>
                            <button onClick={() => productFileInputRef.current?.click()} className="p-2 bg-gray-800 rounded-lg">Ürün</button>
                            <button onClick={() => setModal('text')} className="p-2 bg-gray-800 rounded-lg">Metin</button>
                            <button onClick={() => setModal('sticker')} className="p-2 bg-gray-800 rounded-lg">Çıkartma</button>
                            <button onClick={() => setModal('emoji')} className="p-2 bg-gray-800 rounded-lg">Emoji</button>
                            <input type="file" accept="image/png,image/jpeg" ref={productFileInputRef} onChange={handleProductFileChange} className="hidden" />
                        </div>

                        {selectedLayer && (
                            <div className="p-2 bg-gray-800 rounded-lg space-y-2 text-sm animate-fadeIn">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold capitalize">{selectedLayer.type} Katmanı</p>
                                    <button onClick={deleteSelectedLayer}><TrashIcon className="w-5 h-5 text-red-400"/></button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label>Boyut:</label>
                                    <input type="range" min="20" max="500" value={selectedLayer.width} onChange={e => updateSelectedLayer({ width: +e.target.value, height: (selectedLayer.type === 'text' ? selectedLayer.height : +e.target.value) })} className="w-full"/>
                                </div>
                                {selectedLayer.type === 'text' && (
                                   <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1 border-t border-gray-700/50">
                                    <div className="flex items-center gap-2">
                                        <label>Yükseklik:</label>
                                        <input type="range" min="20" max="300" value={selectedLayer.height} onChange={e => updateSelectedLayer({ height: +e.target.value })} className="w-full"/>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label>Renk:</label>
                                        <input type="color" value={selectedLayer.color} onChange={e => updateSelectedLayer({ color: e.target.value })} className="w-6 h-6 p-0 border-none rounded bg-transparent"/>
                                    </div>
                                     <div className="col-span-2 flex items-center gap-2">
                                        <label>Yazı Tipi:</label>
                                        <select value={selectedLayer.fontFamily} onChange={e => updateSelectedLayer({ fontFamily: e.target.value as any })} className="bg-gray-700 rounded p-1 text-xs w-full">
                                            <option value="sans">Inter</option>
                                            <option value="serif">Playfair</option>
                                            <option value="cursive">Cursive</option>
                                        </select>
                                    </div>
                                   </div>
                                )}
                                {(selectedLayer.type === 'text' || selectedLayer.type === 'emoji' || selectedLayer.content.endsWith('.gif')) && (
                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
                                        <label>Animasyon:</label>
                                        <select value={selectedLayer.animation} onChange={e => updateSelectedLayer({ animation: e.target.value as any })} className="bg-gray-700 rounded p-1 text-xs w-full">
                                            <option value="none">Yok</option>
                                            <option value="pulse">Nabız</option>
                                            <option value="fadeIn">Yavaşça Belirme</option>
                                            <option value="slideIn">Yandan Kayma</option>
                                            <option value="bounce">Sekme</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                <footer className="p-4 bg-black/80 backdrop-blur-sm border-t border-white/10">
                    <button 
                        onClick={hasAnimation ? handleGenerateVideo : handleSaveImage} 
                        className="w-full bg-blue-600 font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                        disabled={generationState !== 'idle'}
                    >
                         {hasAnimation ? <PlayIcon className="w-5 h-5"/> : <PhotographIcon className="w-5 h-5" />}
                         {hasAnimation ? 'Video Oluştur' : 'Görseli Kaydet'}
                    </button>
                </footer>
            </div>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
                
                .font-cursive-custom { font-family: cursive; }

                @keyframes pulse-text-anim { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
                .animate-pulse-text { animation: pulse-text-anim 2s ease-in-out infinite; }

                @keyframes fadeIn-text-anim { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
                .animate-fadeIn-text { animation: fadeIn-text-anim 2.5s ease-in-out infinite; }

                @keyframes slideIn-text-anim { 0% { transform: translateX(-25px); opacity: 0; } 20% { transform: translateX(0); opacity: 1; } 80% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(25px); opacity: 0; } }
                .animate-slideIn-text { animation: slideIn-text-anim 3s ease-in-out infinite; }
                
                @keyframes bounce-text-anim { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-15px); } 60% { transform: translateY(-7px); } }
                .animate-bounce-text { animation: bounce-text-anim 2s ease-in-out infinite; }
             `}</style>
        </div>
    );
};