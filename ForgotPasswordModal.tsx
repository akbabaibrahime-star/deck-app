import React, { useState } from 'react';
import { useTranslation } from '../App';
import { CloseIcon } from './Icons';
import type { User } from '../types';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onPasswordReset: (identifier: string, newPassword: string) => void;
  allUsers: User[];
}

type Step = 'enter-identifier' | 'enter-code' | 'reset-password';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onPasswordReset, allUsers }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('enter-identifier');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleIdentifierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const userExists = allUsers.some(u => 
        u.contact.email.toLowerCase() === identifier.toLowerCase() ||
        u.contact.phone === identifier
    );

    if (userExists) {
        setStep('enter-code');
    } else {
        setError(t('userNotFound'));
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // For demo, we just check for a 6-digit code.
    if (code.length === 6 && /^\d+$/.test(code)) {
        setStep('reset-password');
    } else {
        setError("Please enter a valid 6-digit code.");
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
    }
    onPasswordReset(identifier, newPassword);
  };

  const renderStep = () => {
    switch (step) {
      case 'enter-identifier':
        return (
          <form onSubmit={handleIdentifierSubmit} className="p-4 space-y-4">
            <p className="text-sm text-gray-400">{t('emailOrPhone')}</p>
            <div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                placeholder={t('emailOrPhone')}
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg">{t('sendResetCode')}</button>
          </form>
        );
      case 'enter-code':
        return (
          <form onSubmit={handleCodeSubmit} className="p-4 space-y-4">
            <p className="text-sm text-gray-400">{t('enterVerificationCode')}</p>
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-center tracking-[0.5em] text-white"
                placeholder="_ _ _ _ _ _"
                maxLength={6}
                required
              />
              <p className="text-xs text-center text-gray-500 mt-2">{t('demoCodeMessage')}</p>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg">{t('verify')}</button>
          </form>
        );
      case 'reset-password':
        return (
          <form onSubmit={handleResetSubmit} className="p-4 space-y-4">
            <p className="text-sm text-gray-400">Enter your new password.</p>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t('newPassword')}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t('confirmNewPassword')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg">{t('resetPassword')}</button>
          </form>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 animate-fadeIn-dialog" onClick={onClose}>
      <div className="bg-[#121212] rounded-lg w-full max-w-sm flex flex-col transform animate-slideUp-dialog text-white" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">{t('passwordReset')}</h2>
          <button onClick={onClose}><CloseIcon /></button>
        </header>
        {error && <p className="text-sm text-red-400 text-center p-2 bg-red-500/10">{error}</p>}
        {renderStep()}
      </div>
    </div>
  );
};