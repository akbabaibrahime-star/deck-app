import React, { useState } from 'react';
import { useTranslation } from '../App';
import { CloseIcon } from './Icons';

interface ChangePasswordModalProps {
  onClose: () => void;
  onSave: (passwords: { currentPassword: string; newPassword: string }) => void;
  error: string | null;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, onSave, error }) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (newPassword !== confirmPassword) {
      setLocalError(t('passwordsDoNotMatch'));
      return;
    }
    if (newPassword.length < 6) {
        setLocalError('New password must be at least 6 characters long.');
        return;
    }
    onSave({ currentPassword, newPassword });
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 animate-fadeIn-dialog" onClick={onClose}>
      <div className="bg-[#121212] rounded-lg w-full max-w-sm flex flex-col transform animate-slideUp-dialog" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">{t('changePassword')}</h2>
          <button onClick={onClose}><CloseIcon /></button>
        </header>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('currentPassword')}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('newPassword')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('confirmNewPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
              required
            />
          </div>
          {(error || localError) && (
            <p className="text-sm text-red-400 text-center">{error || localError}</p>
          )}
          <button type="submit" className="w-full bg-blue-600 font-bold py-2 rounded-lg">{t('saveChanges')}</button>
        </form>
      </div>
    </div>
  );
};
