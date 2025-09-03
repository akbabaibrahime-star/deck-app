import React, { useState } from 'react';
import type { User, Product, UserSummary } from '../types';
import { Cog6ToothIcon, SparklesIcon } from './Icons';
import { useTranslation } from '../App';

interface CustomerProfileProps {
  user: User;
  savedProducts: Product[];
  likedProducts: Product[];
  followingUsers: UserSummary[];
  onEditProfile: () => void;
  onLogout: () => void;
  onShowFollowingList: () => void;
  onShowSettings: () => void;
  onNavigateToCreator: (user: UserSummary) => void;
  onNavigateToAIStylist: () => void;
}

const TabButton: React.FC<{ name: string; count: number; isActive: boolean; onClick: () => void }> = ({ name, count, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 font-semibold text-center transition-colors duration-200 py-3 ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
    >
        {name} <span className="text-xs">({count})</span>
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

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ 
    user, savedProducts, likedProducts, followingUsers, onEditProfile, 
    onLogout, onShowFollowingList, onShowSettings, onNavigateToCreator,
    onNavigateToAIStylist
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'saved' | 'liked'>('saved');

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
                 <button onClick={onShowSettings} className="p-2">
                    <Cog6ToothIcon />
                </button>
            </div>
        </div>
        <p className="text-gray-300">{user.bio}</p>
        
        <div className="flex justify-around text-center py-4 border-y border-gray-800">
            <button onClick={onShowFollowingList} className="w-1/3">
                <p className="font-bold text-xl">{followingUsers.length}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{t('following')}</p>
            </button>
            <div className="w-1/3 border-x border-gray-800">
                <p className="font-bold text-xl">{savedProducts.length}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{t('saved')}</p>
            </div>
            <div className="w-1/3">
                <p className="font-bold text-xl">{likedProducts.length}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{t('liked')}</p>
            </div>
        </div>

        <div className="space-y-2">
            <div className="flex gap-2">
                <button onClick={onEditProfile} className="flex-1 bg-gray-800 text-white font-bold py-3 px-4 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                    {t('editProfile')}
                </button>
                <button
                    onClick={onNavigateToAIStylist}
                    className="flex-1 bg-purple-600/20 text-purple-300 font-bold py-3 px-4 rounded-lg text-sm hover:bg-purple-600/30 transition-colors flex items-center justify-center gap-2">
                    <SparklesIcon className="w-5 h-5"/>
                    {t('aiStylist')}
                </button>
            </div>
             <button 
                onClick={onLogout}
                className="w-full bg-red-600/20 text-red-400 font-bold py-3 px-4 rounded-lg text-sm hover:bg-red-600/30 transition-colors">
                {t('logout')}
            </button>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-4">
        <div className="flex border-b border-gray-800 sticky top-0 bg-black z-10">
            <TabButton name={t('saved')} count={savedProducts.length} isActive={activeTab === 'saved'} onClick={() => setActiveTab('saved')} />
            <TabButton name={t('liked')} count={likedProducts.length} isActive={activeTab === 'liked'} onClick={() => setActiveTab('liked')} />
        </div>
        <div>
             {activeTab === 'saved' && <ProductsGrid products={savedProducts} emptyMessage={t('noSavedItemsYet')} />}
             {activeTab === 'liked' && <ProductsGrid products={likedProducts} emptyMessage={t('noLikedItemsYet')} />}
        </div>
      </div>
    </div>
  );
};