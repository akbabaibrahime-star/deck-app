import React, { useState, useMemo } from 'react';
import type { User, Product, Deck } from '../types';
import { ChatBubbleIcon, PhoneIcon, MailIcon, MapPinIcon } from './Icons';
import { useTranslation } from '../App';
import { ProductCarousel3D } from './ProductCarousel3D';

interface CreatorProfileProps {
  creator: User;
  allUsers: User[];
  allProducts: Product[];
  onNavigateToChat: (creator: User, product?: Product) => void;
  onNavigateToDeck: (deck: Deck) => void;
  currentUser: User | null;
  onFollowToggle: (targetUserId: string) => void;
}

const TabButton: React.FC<{ name: string; isActive: boolean; onClick: () => void }> = ({ name, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 font-semibold text-center transition-colors duration-200 py-3 ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
    >
        {name}
    </button>
);

export const CreatorProfile: React.FC<CreatorProfileProps> = ({ creator, allUsers, allProducts, onNavigateToChat, onNavigateToDeck, currentUser, onFollowToggle }) => {
    const { t } = useTranslation();
    const isFollowing = currentUser?.followingIds.includes(creator.id);
    const isSelf = currentUser?.id === creator.id;
    
    const [activeTab, setActiveTab] = useState<'decks' | 'products'>('decks');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const creatorProducts = useMemo(() => allProducts.filter(p => p.creator.id === creator.id), [allProducts, creator.id]);
    const featuredProducts = useMemo(() => creatorProducts.filter(p => p.isFeatured), [creatorProducts]);

    const categories = useMemo(() => {
        const uniqueCategories = new Set(creatorProducts.map(p => p.category).filter((c): c is string => !!c));
        return Array.from(uniqueCategories);
    }, [creatorProducts]);

    const categoryImages = useMemo(() => {
        const imageMap = new Map<string, string>();
        categories.forEach(category => {
            const firstProductInCategory = creatorProducts.find(p => p.category === category);
            if (firstProductInCategory && firstProductInCategory.variants.length > 0) {
                imageMap.set(category, firstProductInCategory.variants[0].mediaUrl);
            }
        });
        return imageMap;
    }, [categories, creatorProducts]);

    const tags = useMemo(() => {
        const uniqueTags = new Set(creatorProducts.flatMap(p => p.tags || []));
        return Array.from(uniqueTags);
    }, [creatorProducts]);
    
    const filteredProducts = useMemo(() => creatorProducts.filter(product => {
        const categoryMatch = !selectedCategory || product.category === selectedCategory;
        const tagMatch = !selectedTag || (product.tags && product.tags.includes(selectedTag));
        return categoryMatch && tagMatch;
    }), [creatorProducts, selectedCategory, selectedTag]);

    const teamMembers = creator.teamMemberIds
        ?.map(id => allUsers.find(u => u.id === id))
        .filter((u): u is User => !!u) ?? [];

  return (
    <>
    <div className="bg-black text-white h-screen overflow-y-auto pt-16 pb-8">
      <div className="space-y-6">
        <div className="p-4 space-y-6">
            <div className="flex items-center gap-4">
            <img src={creator.avatarUrl} alt={creator.username} className="w-24 h-24 rounded-full border-2 border-gray-700" />
            <div>
                <h1 className="text-2xl font-bold">{creator.username}</h1>
                <p className="text-gray-400">{creator.contact.email}</p>
            </div>
            </div>

            <div className="flex justify-around text-center py-4 border-y border-gray-800">
                <div className="w-1/3">
                    <p className="font-bold text-xl">{creator.decks.length}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{t('decks')}</p>
                </div>
                <div className="w-1/3 border-x border-gray-800">
                    <p className="font-bold text-xl">{creator.followerIds.length}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{t('followers')}</p>
                </div>
                <div className="w-1/3">
                    <p className="font-bold text-xl">{creator.followingIds.length}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{t('following')}</p>
                </div>
            </div>

            <p className="text-gray-300">{creator.bio}</p>

            <div className="flex gap-2">
                <button 
                onClick={() => onNavigateToChat(creator)}
                className="flex-1 bg-gray-800 text-white font-bold py-3 px-6 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                >
                <ChatBubbleIcon className="w-5 h-5" />
                <span>{t('sendMessage')}</span>
                </button>
                {!isSelf && currentUser && (
                <button
                    onClick={() => onFollowToggle(creator.id)}
                    className={`flex-1 font-bold py-3 px-6 rounded-lg text-sm transition-colors ${
                    isFollowing
                        ? 'bg-white/10 text-white border border-gray-600 hover:bg-white/20'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                >
                    {isFollowing ? t('followingStatus') : t('follow')}
                </button>
                )}
            </div>

            {/* Contact Info Section */}
            <div className="space-y-4 pt-4 border-t border-gray-800">
                <h2 className="text-xl font-semibold">{t('contactInfo')}</h2>
                <div className="space-y-2">
                    <a href={`tel:${creator.contact.phone}`} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                        <PhoneIcon className="w-5 h-5 text-gray-400"/>
                        <span>{creator.contact.phone}</span>
                    </a>
                    <a href={`mailto:${creator.contact.email}`} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                        <MailIcon className="w-5 h-5 text-gray-400"/>
                        <span>{creator.contact.email}</span>
                    </a>
                    {creator.address.googleMapsUrl && (
                        <a href={creator.address.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                            <MapPinIcon className="w-5 h-5 text-gray-400"/>
                            <span>{t('viewLocation')}</span>
                        </a>
                    )}
                </div>
            </div>
        </div>

        {/* Featured Products Carousel */}
        {featuredProducts.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-gray-800">
                <h2 className="text-xl font-semibold px-4">{t('featuredProducts')}</h2>
                <ProductCarousel3D 
                    products={featuredProducts} 
                    onProductClick={(product) => {
                        setActiveTab('products');
                        setSelectedCategory(product.category || null);
                        setSelectedTag(null);
                    }}
                />
            </div>
        )}

        {/* Shop by Category Section */}
        {categories.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-800 px-4">
                <h2 className="text-xl font-semibold">{t('shopByCategory')}</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
                    {categories.map(category => {
                        const imageUrl = categoryImages.get(category);
                        return (
                            <button 
                                key={category}
                                onClick={() => {
                                    setActiveTab('products');
                                    setSelectedCategory(category);
                                }}
                                className="relative flex-shrink-0 w-32 h-20 bg-gray-900 rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform hover:scale-105"
                            >
                                {imageUrl && <img src={imageUrl} alt={category} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity" />}
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-2">
                                    <p className="text-white font-bold text-center text-sm">{category.split('/').pop()}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        )}
        
        {teamMembers.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-800 px-4">
                <h2 className="text-xl font-semibold">{t('ourTeam')}</h2>
                <div className="space-y-3">
                    {teamMembers.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                            <img src={member.avatarUrl} alt={member.username} className="w-12 h-12 rounded-full"/>
                            <div>
                                <p className="font-semibold">{member.username}</p>
                                <p className="text-sm text-gray-400 capitalize">{t('salesperson')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      <div className="border-t border-gray-800">
        <div className="flex border-b border-gray-800 sticky top-14 bg-black z-10">
            <TabButton name={t('decks')} isActive={activeTab === 'decks'} onClick={() => setActiveTab('decks')} />
            <TabButton name={t('products')} isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} />
        </div>
         <div>
            {activeTab === 'decks' && (
                <div className="grid grid-cols-2 gap-px bg-gray-800">
                {creator.decks.map(deck => (
                    <button key={deck.id} onClick={() => onNavigateToDeck(deck)} className="relative bg-black aspect-square group focus:outline-none">
                    <img src={deck.mediaUrls[0]} alt={deck.name} className="w-full h-full object-contain opacity-75 group-hover:opacity-50 transition-opacity" />
                    <div className="absolute bottom-0 left-0 p-2">
                        <h3 className="font-bold">{deck.name}</h3>
                        <p className="text-xs text-gray-300">{deck.productCount} products</p>
                    </div>
                    </button>
                ))}
                </div>
            )}
            {activeTab === 'products' && (
                <div className="p-4 space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">{t('category')}</h3>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setSelectedCategory(null)} className={`px-3 py-1 text-xs rounded-full border ${!selectedCategory ? 'bg-white text-black border-white' : 'border-gray-600'}`}>{t('all')}</button>
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 text-xs rounded-full border ${selectedCategory === cat ? 'bg-white text-black border-white' : 'border-gray-600'}`}>{cat.split('/').pop()}</button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">{t('tags')}</h3>
                        <div className="flex flex-wrap gap-2">
                           <button onClick={() => setSelectedTag(null)} className={`px-3 py-1 text-xs rounded-full border ${!selectedTag ? 'bg-white text-black border-white' : 'border-gray-600'}`}>{t('all')}</button>
                            {tags.map(tag => (
                                <button key={tag} onClick={() => setSelectedTag(tag)} className={`px-3 py-1 text-xs rounded-full border capitalize ${selectedTag === tag ? 'bg-white text-black border-white' : 'border-gray-600'}`}>{tag}</button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="relative aspect-[3/4] group bg-gray-900 rounded-lg overflow-hidden">
                                <img src={product.variants[0].mediaUrl} alt={product.name} className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                                    <p className="font-semibold text-xs truncate">{product.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {filteredProducts.length === 0 && <p className="text-center text-gray-500 py-10">{t('nothingHereYet')}</p>}
                </div>
            )}
        </div>
      </div>
    </div>
    <style>{`
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    `}</style>
    </>
  );
};