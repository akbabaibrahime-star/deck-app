import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Deck, Product, VideoScene } from '../types';
import { audioTracks } from '../data/mockAudio';
import type { AudioTrack } from '../data/mockAudio';
import { CloseIcon, SparklesIcon, FilmIcon, PlayIcon, PauseIcon, UploadIcon } from './Icons';


interface AIVideoStudioProps {
  deck: Deck;
  allProducts: Product[];
  onClose: () => void;
}

const loadingMessages = [
    "AI yönetmen koltuğuna oturuyor...",
    "Koleksiyonunuzun ruhu analiz ediliyor...",
    "Mükemmel çekimler seçiliyor...",
    "Pazarlama metinleri yazılıyor...",
    "Müzik ve görseller senkronize ediliyor...",
    "Son sihirli dokunuşlar yapılıyor...",
];

const videoStyles = ['Energetic and Lively', 'Elegant and Cinematic', 'Minimalist and Chic'];

export const AIVideoStudio: React.FC<AIVideoStudioProps> = ({ deck, allProducts, onClose }) => {
    const [step, setStep] = useState(0); // 0: Customize, 1: Generating, 2: Result
    const [selectedStyle, setSelectedStyle] = useState(videoStyles[0]);
    const [selectedMusic, setSelectedMusic] = useState<AudioTrack | null>(null);
    const [videoScript, setVideoScript] = useState<VideoScene[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const sceneTimeoutRef = useRef<number | null>(null);
    const deckProducts = useMemo(() => allProducts.filter(p => deck.productIds.includes(p.id)), [allProducts, deck]);
    const audioFileInputRef = useRef<HTMLInputElement>(null);

    const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);
    useEffect(() => {
        let interval: number;
        if (step === 1) {
          interval = window.setInterval(() => {
            setCurrentLoadingMessage(prev => {
              const currentIndex = loadingMessages.indexOf(prev);
              return loadingMessages[(currentIndex + 1) % loadingMessages.length];
            });
          }, 2500);
        }
        return () => window.clearInterval(interval);
      }, [step]);
    
      useEffect(() => {
        if (step === 2 && videoScript && isPlaying) {
          if (currentSceneIndex >= videoScript.length) {
            setIsPlaying(false);
            if (audioRef.current) audioRef.current.pause();
            return;
          }

          const scene = videoScript[currentSceneIndex];
    
          sceneTimeoutRef.current = window.setTimeout(() => {
            setCurrentSceneIndex(prev => prev + 1);
          }, scene.duration);
    
          return () => {
            if (sceneTimeoutRef.current) clearTimeout(sceneTimeoutRef.current);
          };
        }
      }, [step, isPlaying, currentSceneIndex, videoScript]);
    
      useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
          audio.volume = 0.5;
          if (isPlaying) {
            audio.play().catch(e => console.error("Audio play failed:", e));
          } else {
            audio.pause();
          }
        }
      }, [isPlaying]);

    const handleMusicFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const customTrack: AudioTrack = {
                    id: `custom-${Date.now()}`,
                    title: file.name,
                    genre: selectedStyle, // Use the selected style to guide the AI prompt
                    url: reader.result as string,
                };
                setSelectedMusic(customTrack);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!selectedMusic) {
            setError("Lütfen bir müzik seçin.");
            return;
        }
        setStep(1);
        setError(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const availableImages = deckProducts.flatMap(p => p.variants.map(v => v.mediaUrl));

            const prompt = `
            TASK: You are an expert video editor AI. Create a dynamic and professional script for a promotional video for a fashion collection called "${deck.name}".

            VIDEO STYLE: ${selectedStyle}
            MUSIC STYLE: The music is ${selectedMusic.title}, which has an ${selectedMusic.genre} vibe. The scenes and pacing should match this energy.
            
            AVAILABLE IMAGE ASSETS (URLs):
            ${availableImages.join('\n')}

            RULES:
            1. The output MUST be a valid JSON array of scenes.
            2. Create a longer, more engaging video script with 8 to 12 scenes. The total duration should be approximately 25-30 seconds.
            3. For each scene, you MUST use an 'imageUrl' from the "AVAILABLE IMAGE ASSETS" list provided above. Use a wide variety of the available images.
            4. For each scene, assign a dynamic 'animationStyle'. Choose ONE from this list: ['ken-burns-right', 'zoom-in', 'pan-left', 'pan-right']. This will create cinematic camera movement.
            5. 'duration' for each scene should be between 2500 and 4000 milliseconds.
            6. 'textOverlay' must be a short, exciting marketing phrase in Turkish that fits the product and video style (e.g., "Yeni Sezonun Gözdesi", "Şıklığı Keşfet", "Sınırlı Sayıda").
            7. The first scene should introduce the collection. The last scene should be a strong call to action (e.g., "Koleksiyonu Keşfet", "Şimdi Alışveriş Yap").
            `;
            
            const videoSceneSchema = {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    imageUrl: { type: Type.STRING },
                    duration: { type: Type.NUMBER },
                    textOverlay: { type: Type.STRING },
                    animationStyle: { type: Type.STRING },
                  },
                  required: ["imageUrl", "duration", "textOverlay", "animationStyle"]
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: videoSceneSchema,
                }
            });

            const script = JSON.parse(response.text);
            if (!Array.isArray(script) || script.length === 0) throw new Error("AI returned invalid script format.");
            
            const validScript = script.filter(scene => availableImages.includes(scene.imageUrl));
            if(validScript.length === 0) throw new Error("AI returned a script with invalid image URLs.");

            setVideoScript(validScript);
            setCurrentSceneIndex(0);
            setIsPlaying(false);
            setStep(2);
        } catch (err) {
            console.error("AI Video Generation failed:", err);
            setError("Video senaryosu oluşturulamadı. Lütfen tekrar deneyin.");
            setStep(0);
        }
    };
    
    const handleReplay = () => {
        setCurrentSceneIndex(0);
        if(audioRef.current) {
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(true);
    }
    
    const handlePlayPause = () => {
        if (videoScript && currentSceneIndex >= videoScript.length) {
            handleReplay();
        } else {
            setIsPlaying(prev => !prev);
        }
    };

    const currentScene = videoScript ? videoScript[currentSceneIndex] : null;
    const isFinished = videoScript && currentSceneIndex >= videoScript.length;
    const currentProductImage = currentScene?.imageUrl || (isFinished ? videoScript?.[videoScript.length - 1]?.imageUrl : null);


    const animationClass = useMemo(() => {
        if (!currentScene?.animationStyle) return 'animate-ken-burns-right';
        const map = {
            'ken-burns-right': 'animate-ken-burns-right',
            'zoom-in': 'animate-zoom-in',
            'pan-left': 'animate-pan-left',
            'pan-right': 'animate-pan-right',
        };
        return map[currentScene.animationStyle as keyof typeof map] || 'animate-ken-burns-right';
    }, [currentScene]);


    const renderContent = () => {
        if(step === 1) { // Generating
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <SparklesIcon className="w-16 h-16 text-purple-400 animate-pulse" />
                    <h2 className="text-2xl font-bold font-serif mt-4 mb-2">Video Oluşturuluyor...</h2>
                    <p className="text-gray-300 transition-opacity duration-500">{currentLoadingMessage}</p>
                </div>
            );
        }

        if(step === 2 && videoScript) { // Result
            return (
                <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden" onClick={handlePlayPause}>
                    {selectedMusic && <audio ref={audioRef} src={selectedMusic.url} loop key={selectedMusic.url} />}
                    
                    {/* Background Image */}
                    {currentProductImage && (
                        <div className="absolute inset-0 transition-opacity duration-1000" key={currentSceneIndex}>
                           <img src={currentProductImage} alt="Video scene" className={`w-full h-full object-cover ${isPlaying ? animationClass : ''}`}/>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40"></div>
                    
                    {/* Play/Pause Overlay */}
                    <div className={`absolute z-10 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="bg-black/50 backdrop-blur-sm p-6 rounded-full">
                           {isFinished ? <PlayIcon className="w-16 h-16 text-white" /> : <PlayIcon className="w-16 h-16 text-white" /> }
                        </div>
                    </div>

                    {/* Text Overlay */}
                    {isPlaying && currentScene && (
                        <div className="relative z-10 text-center text-white p-4 pointer-events-none">
                            <h2 className="text-4xl md:text-5xl font-bold font-serif drop-shadow-2xl animate-text-fade-in" style={{ animationDuration: `${currentScene.duration}ms` }} key={currentSceneIndex}>
                                {currentScene.textOverlay}
                            </h2>
                        </div>
                    )}

                     {/* Controls */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-center items-center gap-4" onClick={e => e.stopPropagation()}>
                        <button onClick={handlePlayPause} className="bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
                            {isPlaying ? <PauseIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5"/>}
                            {isPlaying ? 'Durdur' : (isFinished ? 'Tekrar Oynat' : 'Oynat')}
                        </button>
                        <button onClick={() => alert('Download simulated!')} className="bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg">İndir</button>
                        <button onClick={() => { setStep(0); setVideoScript(null); setIsPlaying(false); }} className="bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg">Baştan Başla</button>
                    </div>
                </div>
            )
        }

        // Step 0: Customize
        return (
            <div className="p-4 space-y-6">
                <h2 className="text-2xl font-bold font-serif">Tanıtım Videosu Oluştur: {deck.name}</h2>
                {error && <p className="text-red-400 text-sm p-2 bg-red-900/50 rounded-lg">{error}</p>}
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">1. Video Stilini Seçin</h3>
                    <div className="flex flex-wrap gap-2">
                        {videoStyles.map(style => (
                            <button key={style} onClick={() => setSelectedStyle(style)} className={`px-3 py-1.5 text-sm rounded-full border ${selectedStyle === style ? 'bg-white text-black border-white' : 'border-gray-600'}`}>
                                {style}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">2. Fon Müziği Seçin</h3>
                    <div className="space-y-2">
                        {audioTracks.filter(t => t.genre === selectedStyle).map(track => (
                            <button key={track.id} onClick={() => setSelectedMusic(track)} className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${selectedMusic?.id === track.id ? 'bg-gray-700 border-blue-500' : 'bg-gray-800 border-transparent hover:bg-gray-700'}`}>
                                <p className="font-semibold">{track.title}</p>
                                <p className="text-xs text-gray-400">{track.genre}</p>
                            </button>
                        ))}
                        <input
                            type="file"
                            accept="audio/*"
                            ref={audioFileInputRef}
                            onChange={handleMusicFileChange}
                            className="hidden"
                        />
                        <button 
                            onClick={() => audioFileInputRef.current?.click()}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${selectedMusic?.id.startsWith('custom-') ? 'bg-gray-700 border-blue-500' : 'bg-gray-800 border-transparent hover:bg-gray-700'}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <UploadIcon className="w-5 h-5" />
                                    <p className="font-semibold truncate">{selectedMusic?.id.startsWith('custom-') ? selectedMusic.title : "Kendi Müziğini Yükle"}</p>
                                </div>
                                {selectedMusic?.id.startsWith('custom-') && <span className="text-xs text-blue-400 flex-shrink-0">Seçili</span>}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex flex-col animate-fadeIn">
            <div className="w-full h-full max-w-md mx-auto flex flex-col bg-black text-white">
                 <header className="p-4 flex justify-between items-center bg-[#121212] flex-shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2"><FilmIcon /> AI Video Studio</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <main className="flex-grow flex flex-col overflow-hidden">
                    <div className="flex-grow overflow-y-auto">
                        {renderContent()}
                    </div>
                     {step === 0 && (
                        <footer className="p-4 bg-[#121212] flex-shrink-0">
                            <button onClick={handleGenerate} disabled={!selectedMusic} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                <SparklesIcon /> Video Oluştur
                            </button>
                        </footer>
                     )}
                </main>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
                
                @keyframes ken-burns-right {
                    0% { transform: scale(1.0) translate(0, 0); }
                    100% { transform: scale(1.1) translate(2%, -1%); }
                }
                .animate-ken-burns-right { animation: ken-burns-right 8s ease-in-out forwards; }
                
                @keyframes zoom-in {
                    0% { transform: scale(1.0); }
                    100% { transform: scale(1.1); }
                }
                .animate-zoom-in { animation: zoom-in 8s ease-in-out forwards; }

                @keyframes pan-left {
                    0% { transform: scale(1.1) translate(2%, 0); }
                    100% { transform: scale(1.1) translate(-2%, 0); }
                }
                .animate-pan-left { animation: pan-left 8s ease-in-out forwards; }
                
                @keyframes pan-right {
                    0% { transform: scale(1.1) translate(-2%, 0); }
                    100% { transform: scale(1.1) translate(2%, 0); }
                }
                .animate-pan-right { animation: pan-right 8s ease-in-out forwards; }

                @keyframes text-fade-in {
                    0% { opacity: 0; transform: translateY(20px); }
                    20% { opacity: 1; transform: translateY(0); }
                    80% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-20px); }
                }
                .animate-text-fade-in { animation: text-fade-in forwards; }
            `}</style>
        </div>
    );
}