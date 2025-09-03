import React, { useState, useEffect, useRef } from 'react';
import type { User, Deck, SizeGuideTemplate, Product, SaleRecord } from '../types';
import { EllipsisVerticalIcon, LinkIcon, FilmIcon, PhoneIcon, MailIcon, MapPinIcon, BellIcon, Cog6ToothIcon, PlusIcon, StarIcon, PencilIcon, SparklesIcon } from './Icons';
import { useTranslation } from '../App';

interface ProfileProps {
  user: User;
  allUsers: User[];
  myProducts: Product[];
  savedProducts: Product[];
  likedProducts: Product[];
  salesRecords: SaleRecord[];
  onEditProfile: () => void;
  onCreateDeck: () => void;
  onNavigateToDeck: (deck: Deck) => void;
  onEditDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
  onShareProfile: (userId: string) => void;
  onShareDeck: (deckId: string) => void;
  onGenerateVideoForDeck: (deck: Deck) => void;
  onLogout: () => void;
  onShowFollowingList: () => void;
  onShowSettings: () => void;
  onShowNotifications: () => void;
  unreadNotificationsCount: number;
  onShowTeamManagement: (owner: User) => void;
  onRemoveTeamMember: (ownerId: string, memberId: string) => void;
  onToggleFeatured: (productId: string) => void;
  onEditCommission: (member: User) => void;
  onNavigateToAIStylist: () => void;
}

const TabButton: React.FC<{ name: string; isActive: boolean; onClick: () => void }> = ({ name, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 font-semibold text-center transition-colors duration-200 py-3 ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
    >
        {name}
    </button>
);

const ProductsGrid: React.FC<{ products: Product[]; emptyMessage: string }> = ({ products, emptyMessage }) => {
    if (products.length === 0) {
        return <p className="text-center text-gray-500 py-10">{emptyMessage}</p>;
    }
    return (
        <div className="grid grid-cols-2 gap-px bg-gray-800">
          {products.map(product => (
            <div key={product.id} className="relative aspect-[3/4] group bg-black">
              <img 
                src={product.variants[0].mediaUrl} 
                alt={product.name} 
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                <p className="font-semibold text-xs truncate">{product.name}</p>
              </div>
            </div>
          ))}
        </div>
    );
};

const MyProductsGrid: React.FC<{ products: Product[]; onToggleFeatured: (productId: string) => void; emptyMessage: string; }> = ({ products, onToggleFeatured, emptyMessage }) => {
    if (products.length === 0) {
        return <p className="text-center text-gray-500 py-10">{emptyMessage}</p>;
    }
    return (
        <div className="grid grid-cols-2 gap-px bg-gray-800">
          {products.map(product => (
            <div key={product.id} className="relative aspect-[3/4] group bg-black">
              <img 
                src={product.variants[0].mediaUrl} 
                alt={product.name} 
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between p-2">
                <p className="font-semibold text-xs truncate flex-1">{product.name}</p>
                <button 
                  onClick={() => onToggleFeatured(product.id)}
                  className="p-1.5 bg-black/50 rounded-full text-white hover:bg-black/75 transition-colors z-10"
                  aria-label="Toggle Featured"
                >
                  <StarIcon className={`w-5 h-5 transition-colors ${product.isFeatured ? 'fill-yellow-400 stroke-yellow-400' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
    );
};


export const Profile: React.FC<ProfileProps> = ({ 
    user, allUsers, myProducts, savedProducts, likedProducts, salesRecords, onEditProfile, onCreateDeck, onNavigateToDeck, 
    onEditDeck, onDeleteDeck, onShareProfile, onShareDeck, 
    onGenerateVideoForDeck, onLogout, onShowFollowingList,
    onShowSettings, onShowNotifications, unreadNotificationsCount,
    onShowTeamManagement, onRemoveTeamMember, onToggleFeatured, onEditCommission,
    onNavigateToAIStylist
}) => {
  const { t } = useTranslation();
  const [openMenuDeckId, setOpenMenuDeckId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'decks' | 'myProducts' | 'saved' | 'liked'>('decks');
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isBrandOwner = user.role === 'brand_owner';
  const isSalesRep = user.role === 'sales_rep';

  useEffect(() => {
      if (isSalesRep) {
          setActiveTab('saved');
      } else if (isBrandOwner) {
          setActiveTab('decks');
      }
  }, [isSalesRep, isBrandOwner]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuDeckId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);
  
  const teamMembers = user.teamMemberIds
    ?.map(id => allUsers.find(u => u.id === id))
    .filter((u): u is User => !!u) ?? [];

  return (
    <div className="bg-black text-white h-screen overflow-y-auto pb-20">
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img src={user.avatarUrl} alt={user.username} className="w-24 h-24 rounded-full border-2 border-gray-700" />
              <div>
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <p className="text-gray-400">{user.contact.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onShowNotifications} className="p-2 relative">
                    <BellIcon />
                    {unreadNotificationsCount > 0 && 
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{unreadNotificationsCount}</span>}
                </button>
                 <button onClick={onShowSettings} className="p-2">
                    <Cog6ToothIcon />
                </button>
            </div>
        </div>
        <p className="text-gray-300">{user.bio}</p>
        
        <div className="flex justify-around text-center py-4 border-y border-gray-800">
            {isBrandOwner && (
                <div className="w-1/3">
                    <p className="font-bold text-xl">{user.decks.length}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{t('decks')}</p>
                </div>
            )}
            <button disabled className={`w-1/3 ${isBrandOwner ? 'border-x border-gray-800' : ''} cursor-default`}>
                <p className="font-bold text-xl">{user.followerIds.length}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{t('followers')}</p>
            </button>
            <button onClick={onShowFollowingList} className={`w-1/3 ${!isBrandOwner ? 'border-x border-gray-800' : ''}`}>
                <p className="font-bold text-xl">{user.followingIds.length}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{t('following')}</p>
            </button>
        </div>

        <div className="space-y-2">
            <div className="flex gap-2">
                <button onClick={onEditProfile} className="flex-1 bg-gray-800 text-white font-bold py-3 px-4 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                    {t('editProfile')}
                </button>
                {isBrandOwner && (
                    <button onClick={onCreateDeck} className="flex-1 bg-gray-800 text-white font-bold py-3 px-4 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                        {t('createDeck')}
                    </button>
                )}
            </div>
             <button
                onClick={onNavigateToAIStylist}
                className="w-full bg-purple-600/20 text-purple-300 font-bold py-3 px-4 rounded-lg text-sm hover:bg-purple-600/30 transition-colors flex items-center justify-center gap-2">
                <SparklesIcon className="w-5 h-5"/>
                {t('aiStylist')}
            </button>
             {isBrandOwner && (
                <button 
                    onClick={() => onShareProfile(user.id)}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <LinkIcon className="w-5 h-5"/>
                    {t('shareProfile')}
                </button>
             )}
             <button 
                onClick={onLogout}
                className="w-full bg-red-600/20 text-red-400 font-bold py-3 px-4 rounded-lg text-sm hover:bg-red-600/30 transition-colors">
                {t('logout')}
            </button>
        </div>
        
        <div className="space-y-4 pt-4 border-t border-gray-800">
            <h2 className="text-xl font-semibold">{t('contactInfo')}</h2>
            <div className="space-y-2">
                {user.contact.phone && (
                    <a href={`tel:${user.contact.phone}`} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                        <PhoneIcon className="w-5 h-5 text-gray-400"/>
                        <span>{user.contact.phone}</span>
                    </a>
                )}
                 {user.contact.email && (
                    <a href={`mailto:${user.contact.email}`} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                        <MailIcon className="w-5 h-5 text-gray-400"/>
                        <span>{user.contact.email}</span>
                    </a>
                 )}
                {user.address.googleMapsUrl && (
                    <a href={user.address.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                        <MapPinIcon className="w-5 h-5 text-gray-400"/>
                        <span>{t('viewLocation')}</span>
                    </a>
                )}
            </div>
        </div>

        {isBrandOwner && (
             <div className="space-y-4 pt-4 border-t border-gray-800">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{t('teamManagement')}</h2>
                     <button onClick={() => onShowTeamManagement(user)} className="flex items-center gap-1.5 bg-gray-800 text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                        <PlusIcon className="w-4 h-4"/>
                        {t('addMember')}
                    </button>
                </div>
                <div className="space-y-3">
                    {teamMembers.length > 0 ? teamMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between gap-3 p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                                <img src={member.avatarUrl} alt={member.username} className="w-12 h-12 rounded-full"/>
                                <div>
                                    <p className="font-semibold">{member.username}</p>
                                    <p className="text-sm text-gray-400 capitalize">{t('salesperson')}</p>
                                    <button onClick={() => onEditCommission(member)} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors pt-1">
                                        <PencilIcon className="w-3 h-3"/>
                                        <span>{member.commissionRate !== undefined ? `${member.commissionRate}% ${t('commission')}` : t('setCommission')}</span>
                                    </button>
                                </div>
                            </div>
                            <button 
                                onClick={() => onRemoveTeamMember(user.id, member.id)}
                                className="text-sm text-red-400 hover:text-red-300 transition-colors font-semibold self-center"
                            >
                                {t('remove')}
                            </button>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-500">{t('noTeamMembers')}</p>
                    )}
                </div>
            </div>
        )}
      </div>

      <div className="border-t border-gray-800 mt-4">
        <div className="flex border-b border-gray-800 sticky top-0 bg-black z-10">
            {isBrandOwner && <TabButton name={`${t('decks')} (${user.decks.length})`} isActive={activeTab === 'decks'} onClick={() => setActiveTab('decks')} />}
            {isBrandOwner && <TabButton name={`${t('products')} (${myProducts.length})`} isActive={activeTab === 'myProducts'} onClick={() => setActiveTab('myProducts')} />}
            <TabButton name={`${t('saved')} (${savedProducts.length})`} isActive={activeTab === 'saved'} onClick={() => setActiveTab('saved')} />
            <TabButton name={`${t('liked')} (${likedProducts.length})`} isActive={activeTab === 'liked'} onClick={() => setActiveTab('liked')} />
        </div>
        <div>
            {activeTab === 'decks' && isBrandOwner && (
                <div className="grid grid-cols-2 gap-px bg-gray-800">
                {user.decks.map(deck => (
                    <div key={deck.id} className="relative bg-black aspect-square group">
                    <button onClick={() => onNavigateToDeck(deck)} className="w-full h-full focus:outline-none">
                        <img src={deck.mediaUrls[0]} alt={deck.name} className="w-full h-full object-contain opacity-75 group-hover:opacity-50 transition-opacity" />
                        <div className="absolute bottom-0 left-0 p-2">
                        <h3 className="font-bold">{deck.name}</h3>
                        <p className="text-xs text-gray-300">{deck.productCount} products</p>
                        </div>
                    </button>
                    <div className="absolute top-1 right-1">
                        <button onClick={() => setOpenMenuDeckId(openMenuDeckId === deck.id ? null : deck.id)} className="p-1.5 bg-black/50 rounded-full text-white hover:bg-black/75 transition-colors">
                        <EllipsisVerticalIcon className="w-5 h-5" />
                        </button>
                        {openMenuDeckId === deck.id && (
                        <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 py-1 animate-fadeIn">
                            <button
                            onClick={() => { onGenerateVideoForDeck(deck); setOpenMenuDeckId(null); }}
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                            >
                            <FilmIcon className="w-4 h-4" />
                            {t('generatePromoVideo')}
                            </button>
                            <button
                            onClick={() => { onEditDeck(deck); setOpenMenuDeckId(null); }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                            >
                            {t('edit')}
                            </button>
                            <button
                            onClick={() => { onShareDeck(deck.id); setOpenMenuDeckId(null); }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                            >
                            {t('share')}
                            </button>
                            <button
                            onClick={() => { onDeleteDeck(deck.id); setOpenMenuDeckId(null); }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                            >
                            {t('delete')}
                            </button>
                        </div>
                        )}
                    </div>
                    </div>
                ))}
                </div>
            )}
             {activeTab === 'myProducts' && isBrandOwner && <MyProductsGrid products={myProducts} onToggleFeatured={onToggleFeatured} emptyMessage={t('nothingHereYet')} />}
             {activeTab === 'saved' && <ProductsGrid products={savedProducts} emptyMessage={t('nothingHereYet')} />}
             {activeTab === 'liked' && <ProductsGrid products={likedProducts} emptyMessage={t('nothingHereYet')} />}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { 
            animation: fadeIn 0.1s ease-out forwards; 
            transform-origin: top right;
        }
      `}</style>
    </div>
  );
};