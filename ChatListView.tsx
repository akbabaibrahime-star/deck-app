import React, { useState, useRef } from 'react';
import type { Chat, User, Product } from '../types';
import { useTranslation } from '../App';
import { ArchiveBoxIcon, TrashIcon, ArrowUpOnBoxIcon } from './Icons';

interface ChatListViewProps {
  currentUser: User;
  allUsers: User[];
  allProducts: Product[];
  chats: Chat[];
  archivedChatIds: Set<string>;
  onNavigateToChat: (otherUser: User, product?: Product) => void;
  onArchiveToggle: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

const SWIPE_THRESHOLD = -150; // How far to swipe to reveal buttons

const formatTimestampForChatList = (isoString: string, t: (key: any) => string): string => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString; // Fallback

    const now = new Date();
    
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    if (date >= startOfToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date >= startOfYesterday) {
        return t('yesterday');
    } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString([], { weekday: 'long' });
    } else {
        return date.toLocaleDateString();
    }
};

export const ChatListView: React.FC<ChatListViewProps> = ({ currentUser, allUsers, allProducts, chats, archivedChatIds, onNavigateToChat, onArchiveToggle, onDeleteChat }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [swipedChatId, setSwipedChatId] = useState<string | null>(null);
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);
  const currentXRef = useRef(0);

  const activeChats = chats
    .filter(chat => chat.participantIds.includes(currentUser.id) && chat.messages.length > 0 && !archivedChatIds.has(chat.id))
    .sort((a, b) => new Date(b.messages[b.messages.length - 1].timestamp).getTime() - new Date(a.messages[a.messages.length - 1].timestamp).getTime());
  
  const archivedChats = chats
    .filter(chat => chat.participantIds.includes(currentUser.id) && chat.messages.length > 0 && archivedChatIds.has(chat.id))
    .sort((a, b) => new Date(b.messages[b.messages.length - 1].timestamp).getTime() - new Date(a.messages[a.messages.length - 1].timestamp).getTime());

  const chatsToShow = activeTab === 'active' ? activeChats : archivedChats;

  const getOtherParticipant = (chat: Chat) => {
    const otherId = chat.participantIds.find(id => id !== currentUser.id);
    return allUsers.find(user => user.id === otherId);
  };

  const getLastMessage = (chat: Chat) => {
    return chat.messages[chat.messages.length - 1];
  }

  const handleSwipe = (chatId: string) => {
    setSwipedChatId(prev => (prev === chatId ? null : chatId));
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, chatId: string) => {
    const item = e.currentTarget;
    item.style.transition = 'none'; // Disable transition during drag
    touchStartRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;
    const currentX = e.targetTouches[0].clientX;
    const deltaX = currentX - touchStartRef.current.x;
    currentXRef.current = Math.min(0, Math.max(SWIPE_THRESHOLD * 1.2, deltaX)); // Clamp swipe
    e.currentTarget.style.transform = `translateX(${currentXRef.current}px)`;
  };
  
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>, chatId: string) => {
    const item = e.currentTarget;
    item.style.transition = 'transform 0.3s ease-out';
    if (currentXRef.current < SWIPE_THRESHOLD / 2) {
      item.style.transform = `translateX(${SWIPE_THRESHOLD}px)`;
      setSwipedChatId(chatId);
    } else {
      item.style.transform = 'translateX(0px)';
      if(swipedChatId === chatId) setSwipedChatId(null);
    }
    touchStartRef.current = null;
  };

  const resetSwipe = (chatId: string) => {
     const element = document.getElementById(`chat-item-${chatId}`);
     if (element) {
        element.style.transition = 'transform 0.3s ease-out';
        element.style.transform = 'translateX(0px)';
     }
     setSwipedChatId(null);
  };

  return (
    <div className="bg-black text-white h-screen flex flex-col pb-16">
      <header className="p-4 bg-[#121212] border-b border-gray-800 text-center sticky top-0 z-20">
        <h1 className="text-xl font-bold">{t('messages')}</h1>
      </header>
       <div className="flex border-b border-gray-800 sticky top-[73px] bg-[#121212] z-20">
            <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 font-semibold text-center transition-colors duration-200 py-3 ${activeTab === 'active' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
                Mesajlar
            </button>
            <button
                onClick={() => setActiveTab('archived')}
                className={`flex-1 font-semibold text-center transition-colors duration-200 py-3 ${activeTab === 'archived' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
                Arşivlenmiş
            </button>
        </div>

      <main className="flex-1 overflow-y-auto pt-4">
        {chatsToShow.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>{t('noMessagesYet')}</p>
            </div>
        ) : (
            chatsToShow.map(chat => {
                const otherUser = getOtherParticipant(chat);
                const lastMessage = getLastMessage(chat);
                const product = chat.productId ? allProducts.find(p => p.id === chat.productId) : null;

                if (!otherUser || !lastMessage) return null;

                const lastMessageText = `${lastMessage.senderId === currentUser.id ? t('youPrefix') : ''}${lastMessage.text}`;
                const isSwiped = swipedChatId === chat.id;

                return (
                    <div key={chat.id} className="relative bg-black border-b border-gray-800 overflow-hidden">
                        <div className="absolute inset-y-0 right-0 flex z-0">
                             <button
                                onClick={() => { onArchiveToggle(chat.id); resetSwipe(chat.id); }}
                                className="bg-yellow-600 text-white px-5 flex flex-col items-center justify-center"
                                aria-label={activeTab === 'active' ? "Arşivle" : "Arşivden Çıkar"}
                            >
                                {activeTab === 'active' ? <ArchiveBoxIcon className="w-6 h-6"/> : <ArrowUpOnBoxIcon className="w-6 h-6"/>}
                                <span className="text-xs mt-1">{activeTab === 'active' ? 'Arşivle' : 'Geri Al'}</span>
                            </button>
                            <button
                                onClick={() => { onDeleteChat(chat.id); resetSwipe(chat.id); }}
                                className="bg-red-600 text-white px-5 flex flex-col items-center justify-center"
                                aria-label="Sohbeti Sil"
                            >
                                <TrashIcon className="w-6 h-6"/>
                                <span className="text-xs mt-1">Sil</span>
                            </button>
                        </div>
                        <div
                            id={`chat-item-${chat.id}`}
                            className="w-full bg-black relative z-10"
                            style={{ transform: isSwiped ? `translateX(${SWIPE_THRESHOLD}px)` : 'translateX(0px)', transition: 'transform 0.3s ease-out'}}
                            onTouchStart={(e) => handleTouchStart(e, chat.id)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={(e) => handleTouchEnd(e, chat.id)}
                            onMouseDown={() => swipedChatId && resetSwipe(swipedChatId)}
                        >
                            <div
                                onClick={() => { if (!swipedChatId) onNavigateToChat(otherUser, product || undefined); else resetSwipe(chat.id) }}
                                className="w-full flex items-start gap-4 p-4 text-left hover:bg-gray-900 transition-colors cursor-pointer"
                            >
                                <img src={otherUser.avatarUrl} alt={otherUser.username} className="w-14 h-14 rounded-full flex-shrink-0"/>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <h2 className="font-semibold truncate">{otherUser.username}</h2>
                                        <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatTimestampForChatList(lastMessage.timestamp, t)}</p>
                                    </div>
                                    {product && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <img src={product.variants[0].mediaUrl} alt={product.name} className="w-8 h-8 rounded-md object-contain bg-gray-800"/>
                                            <p className="text-xs text-gray-400 font-medium truncate">{t('product')}: {product.name}</p>
                                        </div>
                                    )}
                                    <p className={`text-sm text-gray-400 truncate ${product ? 'mt-1' : 'mt-0'}`}>{lastMessageText}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        )}
      </main>
    </div>
  );
};