import React, { useState } from 'react';
import type { User } from '../types';
import { CloseIcon, PlusIcon } from './Icons';
import { useTranslation } from '../App';

interface TeamManagementModalProps {
  owner: User;
  allUsers: User[];
  onClose: () => void;
  onAddMember: (ownerId: string, memberId: string) => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ owner, allUsers, onClose, onAddMember }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const eligibleUsers = allUsers.filter(u => 
    u.id !== owner.id && // Not the owner
    !owner.teamMemberIds?.includes(u.id) && // Not already in the team
    !u.companyId && // Not part of any other team
    u.role !== 'brand_owner' // Not another brand owner
  );

  const filteredUsers = eligibleUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 animate-fadeIn-dialog" onClick={onClose}>
        <div className="bg-[#121212] rounded-lg w-full max-w-sm flex flex-col max-h-[70vh] transform animate-slideUp-dialog" onClick={(e) => e.stopPropagation()}>
            <header className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">{t('addMember')}</h2>
                <button onClick={onClose}><CloseIcon /></button>
            </header>
            
            <div className="p-4 border-b border-gray-800">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="İsim veya e-posta ile ara..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {filteredUsers.length > 0 ? (
                    <>
                        <p className="text-sm text-gray-400 px-2 pb-2">{t('selectUserToAdd')}</p>
                        {filteredUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between gap-3 p-2 hover:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 rounded-full"/>
                                    <div>
                                        <p className="font-semibold">{user.username}</p>
                                        <p className="text-sm text-gray-400">{user.contact.email}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onAddMember(owner.id, user.id)}
                                    className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
                                    aria-label={`Add ${user.username} to team`}
                                >
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <p>{searchTerm ? "Eşleşen kullanıcı bulunamadı." : t('noEligibleUsers')}</p>
                    </div>
                )}
            </div>
        </div>
        <style>{`
          @keyframes fadeIn-dialog { from { opacity: 0; } to { opacity: 1; } } .animate-fadeIn-dialog { animation: fadeIn-dialog 0.2s ease-out forwards; }
          @keyframes slideUp-dialog { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-slideUp-dialog { animation: slideUp-dialog 0.2s ease-out forwards; }
        `}</style>
    </div>
  );
};
