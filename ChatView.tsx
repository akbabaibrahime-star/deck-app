import React, { useEffect, useRef, useState } from 'react';
import type { Chat, Product, User, ChatMessage, PreOrderPayload } from '../types';
import { useTranslation } from '../App';
import { GoogleGenAI } from "@google/genai";
import { LanguageIcon, PaperAirplaneIcon, MicrophoneIcon, StopCircleIcon, PlayIcon, PauseIcon, TrashIcon } from './Icons';

interface ChatViewProps {
  currentUser: User;
  otherUser: User;
  allUsers: User[];
  chat: Chat;
  onSendMessage: (chatId: string, messageContent: { type: 'text', text: string } | { type: 'audio', audioUrl: string, duration: number }) => void;
  productContext?: Product;
  onNavigateToCreator?: (creator: User) => void;
  onNavigateToProduct?: (productId: string, variantName: string) => void;
  onEditPreOrder?: (message: ChatMessage) => void;
}

const formatTimestampForChatView = (isoString: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        return isoString; // Fallback for old/invalid format
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const Waveform: React.FC<{ progress: number; isCurrentUser: boolean }> = ({ progress, isCurrentUser }) => {
    const bars = Array.from({ length: 30 });
    const baseColor = isCurrentUser ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)';
    const activeColor = '#FFFFFF';
    const heights = [0.2, 0.3, 0.4, 0.55, 0.7, 0.8, 0.9, 0.75, 0.6, 0.5, 0.4, 0.3, 0.35, 0.45, 0.6, 0.75, 0.85, 0.95, 1.0, 0.8, 0.65, 0.5, 0.4, 0.3, 0.35, 0.45, 0.6, 0.7, 0.55, 0.4];

    return (
        <div className="flex items-center h-8 gap-px flex-grow">
            {bars.map((_, i) => (
                <div
                    key={i}
                    className="w-0.5 rounded-full transition-colors duration-100"
                    style={{
                        height: `${heights[i] * 100}%`,
                        backgroundColor: (i / bars.length) * 100 < progress ? activeColor : baseColor
                    }}
                />
            ))}
        </div>
    );
};

const AudioMessageBubble: React.FC<{ message: ChatMessage; isCurrentUser: boolean }> = ({ message, isCurrentUser }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const payload = message.payload as { audioUrl: string; duration: number };
    if (!payload || !payload.audioUrl) return null;

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (audio.duration > 0) {
                setCurrentTime(audio.currentTime);
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);
    
    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(err => console.error("Audio play failed:", err));
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
             <div className={`w-full max-w-xs my-1`}>
                <div className={`p-3 rounded-2xl break-words flex items-center gap-3 ${isCurrentUser ? 'bg-blue-600 rounded-br-none' : 'bg-[#262626] rounded-bl-none'}`}>
                    <audio ref={audioRef} src={payload.audioUrl} preload="metadata"></audio>
                    <button onClick={togglePlay}>
                        {isPlaying ? <PauseIcon className="w-6 h-6 flex-shrink-0" /> : <PlayIcon className="w-6 h-6 flex-shrink-0" />}
                    </button>
                    <Waveform progress={progress} isCurrentUser={isCurrentUser} />
                    <span className="text-xs font-mono w-10 text-right">{formatTime(isPlaying ? currentTime : payload.duration)}</span>
                </div>
                 <p className={`text-xs mt-1 opacity-60 ${isCurrentUser ? 'text-right' : 'text-left'} px-2`}>{formatTimestampForChatView(message.timestamp)}</p>
             </div>
        </div>
    )
}

const PreOrderCard: React.FC<{ message: ChatMessage, isCurrentUser: boolean, onNavigateToProduct?: (productId: string, variantName: string) => void, onEdit?: (message: ChatMessage) => void }> = ({ message, isCurrentUser, onNavigateToProduct, onEdit }) => {
    const { t } = useTranslation();
    const payload = message.payload as PreOrderPayload;
    if (!payload) return null;

    return (
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
            <div className={`w-full max-w-xs my-2`}>
                <div className={`rounded-2xl break-words ${isCurrentUser ? 'bg-blue-800' : 'bg-[#262626]'}`}>
                    <div className="p-3 border-b border-white/10">
                        <h3 className="font-bold text-base">{t('preOrderForm')}</h3>
                        <p className="text-xs text-gray-300">Sipariş ID: {message.id}</p>
                    </div>
                    <div className="p-3 space-y-3">
                        {payload.items.map(item => (
                            <button 
                                key={item.productId + item.variantName + (item.size || '')} 
                                onClick={() => onNavigateToProduct && onNavigateToProduct(item.productId, item.variantName)}
                                disabled={!onNavigateToProduct}
                                className="w-full flex items-center gap-3 text-left disabled:cursor-default"
                            >
                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-contain bg-black/20 rounded-md flex-shrink-0" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold text-sm leading-tight truncate">{item.name}</p>
                                    <p className="text-xs text-gray-400">{item.variantName}{item.size && `, ${item.size}`}</p>
                                    <p className="text-xs text-gray-400">{item.quantity} x ${item.price.toFixed(2)}</p>
                                </div>
                                <p className="font-bold text-sm">${(item.quantity * item.price).toFixed(2)}</p>
                            </button>
                        ))}
                    </div>
                    <div className="p-3 border-t border-white/10 space-y-2">
                         <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-300">{t('subtotal')}:</span>
                            <span className="font-semibold text-base">${payload.subtotal.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-300">{t('salesperson')}:</span>
                            <span className="text-sm">{payload.salespersonName}</span>
                        </div>
                        {onEdit && (
                            <button 
                                onClick={() => onEdit(message)}
                                className="w-full bg-blue-600/20 text-blue-300 font-bold py-2 px-4 rounded-lg text-sm hover:bg-blue-600/40 transition-colors mt-2"
                            >
                                {isCurrentUser ? t('editOrder') : t('editAndResend')}
                            </button>
                        )}
                    </div>
                    <div className={`px-3 pb-2 text-xs opacity-60 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                        {formatTimestampForChatView(message.timestamp)}
                    </div>
                </div>
            </div>
        </div>
    );
}

const MessageBubble: React.FC<{ message: ChatMessage; sender: User; isCurrentUser: boolean; currentUser: User; otherUser: User; }> = ({ message, sender, isCurrentUser, currentUser, otherUser }) => {
    const { t } = useTranslation();
    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [showOriginal, setShowOriginal] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationError, setTranslationError] = useState(false);

    const langMap = { tr: 'Turkish', ru: 'Russian', en: 'English', de: 'German' };
    const senderLang = sender.language || 'en';
    const currentUserLang = currentUser.language || 'en';
    const needsTranslation = !isCurrentUser && senderLang !== currentUserLang;

    useEffect(() => {
        if (!needsTranslation || message.type !== 'text') return;

        const translate = async () => {
            setIsTranslating(true);
            setTranslationError(false);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
                const prompt = `Translate the following text from ${langMap[senderLang]} to ${langMap[currentUserLang]}. Respond with ONLY the translated text, without any introductory phrases, explanations, or quotation marks. The output should be the raw translation.\n\nText: "${message.text}"`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { thinkingConfig: { thinkingBudget: 0 } }
                });

                const translation = response.text.trim();
                setTranslatedText(translation);
            } catch (error) {
                console.error("Translation failed:", error);
                setTranslationError(true);
            } finally {
                setIsTranslating(false);
            }
        };

        translate();
    }, [message.text, message.type, needsTranslation, senderLang, currentUserLang]);

    const displayText = (needsTranslation && !showOriginal && translatedText) ? translatedText : message.text;
    const isTranslated = needsTranslation && translatedText;
    
    return (
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
            {!isCurrentUser && sender.id !== otherUser.id && (
                <p className="text-xs text-gray-400 mb-1 ml-12">{sender.username}</p>
            )}
            <div className={`flex items-end gap-2.5 max-w-[85%]`}>
                {!isCurrentUser && (
                  <img src={sender.avatarUrl} className="w-8 h-8 rounded-full" alt={sender.username}/>
                )}
                
                <div className={`p-3 rounded-2xl break-words ${isCurrentUser ? 'bg-blue-600 rounded-br-none' : 'bg-[#262626] rounded-bl-none'}`}>
                  <p className="text-base leading-relaxed whitespace-pre-wrap font-chat">{isTranslating ? '...' : displayText}</p>
                  
                  {isTranslated && !isTranslating && (
                       <div className="text-xs mt-2 pt-1 border-t border-white/10 opacity-80 flex items-center gap-1.5">
                           <LanguageIcon className="w-3.5 h-3.5" />
                           <span>Translated</span>
                           <button onClick={() => setShowOriginal(!showOriginal)} className="underline ml-auto">
                              {showOriginal ? 'Show translation' : 'Show original'}
                           </button>
                       </div>
                  )}
                  {translationError && <p className="text-xs text-red-400 mt-1">Translation failed.</p>}
                  
                  <p className={`text-xs mt-1 opacity-60 ${isCurrentUser ? 'text-right' : 'text-left'}`}>{formatTimestampForChatView(message.timestamp)}</p>
                </div>
            </div>
        </div>
    );
};

const AudioPreviewPlayer: React.FC<{ audioUrl: string; duration: number }> = ({ audioUrl, duration }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const timeUpdate = () => setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
        const onEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', timeUpdate);
        audio.addEventListener('ended', onEnded);
        return () => {
            audio.removeEventListener('timeupdate', timeUpdate);
            audio.removeEventListener('ended', onEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex items-center gap-2 w-full bg-[#262626] rounded-full px-4 py-2">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />
            <button type="button" onClick={togglePlay}>
                {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            </button>
            <div className="w-full h-1 bg-white/20 rounded-full flex-grow">
                <div className="h-1 bg-white rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-xs font-mono w-10 text-right">{formatTime(duration)}</span>
        </div>
    );
};


export const ChatView: React.FC<ChatViewProps> = ({ currentUser, otherUser, allUsers, chat, onSendMessage, productContext, onNavigateToCreator, onNavigateToProduct, onEditPreOrder }) => {
  const { t } = useTranslation();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioPreview, setAudioPreview] = useState<{ url: string; blob: Blob; duration: number } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const isSeller = currentUser.role === 'brand_owner' || currentUser.role === 'sales_rep';
  const isVoiceMessagingEnabled = isSeller || (otherUser.role !== 'customer' && otherUser.voiceMessagesEnabled);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser) return;
    onSendMessage(chat.id, { type: 'text', text: newMessage });
    setNewMessage('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener("dataavailable", event => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audioElement = new Audio(audioUrl);
        audioElement.addEventListener('loadedmetadata', () => {
            setAudioPreview({ url: audioUrl, blob: audioBlob, duration: audioElement.duration });
        });

        stream.getTracks().forEach(track => track.stop());
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = window.setInterval(() => {
          setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required for voice messages.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
    }
    setIsRecording(false);
  };

  const handleDeleteAudioPreview = () => {
    if (audioPreview) {
        URL.revokeObjectURL(audioPreview.url);
    }
    setAudioPreview(null);
  };

  const handleSendAudio = () => {
    if (!audioPreview) return;
    onSendMessage(chat.id, { type: 'audio', audioUrl: audioPreview.url, duration: audioPreview.duration });
    setAudioPreview(null);
  };

  const handleRecordButtonToggle = () => {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
  };

  return (
    <div className="bg-black text-white h-screen flex flex-col">
      <header className="p-4 flex items-center gap-3 bg-[#121212] border-b border-gray-800 sticky top-0 z-20">
        <button
            onClick={() => onNavigateToCreator && onNavigateToCreator(otherUser)}
            disabled={!onNavigateToCreator}
            className="flex items-center gap-3 disabled:cursor-default"
            aria-label={`View profile of ${otherUser.username}`}
        >
            <img src={otherUser.avatarUrl} alt={otherUser.username} className="w-10 h-10 rounded-full" />
            <div>
            <h1 className="font-semibold text-left">{otherUser.username}</h1>
            <p className="text-xs text-green-400 text-left">{t('online')}</p>
            </div>
        </button>
      </header>

      {productContext && (
        <button
            onClick={() => onNavigateToProduct && onNavigateToProduct(productContext.id, productContext.variants[0].name)}
            disabled={!onNavigateToProduct}
            className="p-2 bg-[#121212] border-b border-gray-800 sticky top-[73px] z-10 w-full disabled:cursor-default"
            aria-label={`View product: ${productContext.name}`}
        >
          <div className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-lg pointer-events-none">
            <img src={productContext.variants[0].mediaUrl} alt={productContext.name} className="w-12 h-12 object-contain bg-gray-900 rounded-md" />
            <div>
              <p className="font-semibold text-sm">{productContext.name}</p>
              <p className="text-xs text-gray-400">${productContext.price.toFixed(2)}</p>
            </div>
          </div>
        </button>
      )}

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map(msg => {
            const sender = allUsers.find(u => u.id === msg.senderId);
            const isCurrentUser = msg.senderId === currentUser.id;

            if (msg.type === 'audio') {
                return <AudioMessageBubble key={msg.id} message={msg} isCurrentUser={isCurrentUser} />;
            }

            if (msg.type === 'pre-order' && msg.payload) {
                return <PreOrderCard key={msg.id} message={msg} isCurrentUser={isCurrentUser} onNavigateToProduct={onNavigateToProduct} onEdit={onEditPreOrder} />;
            }

            if (!sender) return null;

            return (
                <MessageBubble
                    key={msg.id}
                    message={msg}
                    sender={sender}
                    isCurrentUser={isCurrentUser}
                    currentUser={currentUser}
                    otherUser={otherUser}
                />
            );
        })}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-2 border-t border-gray-800 bg-black">
        {isRecording ? (
            <div className="flex items-center justify-between w-full h-[48px] px-2 animate-fadeIn">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-mono text-sm text-gray-400">{formatTime(recordingTime)}</span>
                </div>
                <button onClick={stopRecording} className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                    <StopCircleIcon className="w-6 h-6 text-white" />
                </button>
            </div>
        ) : audioPreview ? (
            <div className="flex items-center gap-2 h-[48px] px-2 animate-fadeIn">
                <button onClick={handleDeleteAudioPreview} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
                    <TrashIcon className="w-6 h-6" />
                </button>
                <AudioPreviewPlayer audioUrl={audioPreview.url} duration={audioPreview.duration} />
                <button onClick={handleSendAudio} className="bg-blue-600 rounded-full p-3 hover:bg-blue-700">
                    <PaperAirplaneIcon className="h-5 w-5"/>
                </button>
            </div>
        ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t('typeAMessage')}
                className="flex-1 bg-[#262626] border border-gray-700 rounded-2xl py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none max-h-24 custom-scrollbar"
                rows={1}
                onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
                }}
            />
             {newMessage.trim() === '' && isVoiceMessagingEnabled ? (
                 <button 
                    type="button" 
                    onClick={handleRecordButtonToggle}
                    className="bg-blue-600 rounded-full p-2 hover:bg-blue-700 self-end"
                >
                    <MicrophoneIcon className="h-6 w-6"/>
                </button>
             ) : (
                 <button type="submit" className="bg-blue-600 rounded-full p-2 hover:bg-blue-700 self-end">
                    <PaperAirplaneIcon className="h-6 w-6"/>
                </button>
             )}
            </form>
        )}
      </footer>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .custom-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};