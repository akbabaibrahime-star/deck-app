import React from 'react';
import type { User, Deck } from '../types';
import { MailIcon, MapPinIcon, LinkIcon } from './Icons';
import { useTranslation } from '../App';

interface PublicProfileViewProps {
  user: User;
  onNavigateToDeck: (deck: Deck) => void;
  onShareProfile: (userId: string) => void;
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({ user, onNavigateToDeck, onShareProfile }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-black text-white h-screen overflow-y-auto pb-8">
      <div className="p-4 space-y-6 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={user.avatarUrl} alt={user.username} className="w-20 h-20 rounded-full border-2 border-gray-700" />
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
            </div>
          </div>
          <button 
            onClick={() => onShareProfile(user.id)}
            className="p-3 bg-gray-800 rounded-full text-sm hover:bg-gray-700 transition-colors"
            aria-label="Share Profile"
          >
            <LinkIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-300">{user.bio}</p>

        <div className="space-y-2 pt-4 border-t border-gray-800">
          <a href={`mailto:${user.contact.email}`} className="flex items-center gap-3 text-sm text-gray-400">
              <MailIcon className="w-4 h-4"/>
              <span>{user.contact.email}</span>
          </a>
          {user.address.googleMapsUrl && (
            <a href={user.address.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-400">
                <MapPinIcon className="w-4 h-4"/>
                <span>{t('viewLocation')}</span>
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-gray-800 pt-4">
        <h2 className="px-4 text-xl font-semibold mb-2">{t('decks')}</h2>
        <div className="grid grid-cols-2 gap-px bg-gray-800">
          {user.decks.map(deck => (
            <button key={deck.id} onClick={() => onNavigateToDeck(deck)} className="relative bg-black aspect-square group focus:outline-none">
              <img src={deck.mediaUrls[0]} alt={deck.name} className="w-full h-full object-contain opacity-75 group-hover:opacity-50 transition-opacity" />
              <div className="absolute bottom-0 left-0 p-2">
                <h3 className="font-bold">{deck.name}</h3>
                <p className="text-xs text-gray-300">{deck.productCount} products</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
