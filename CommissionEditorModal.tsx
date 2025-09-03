import React, { useState } from 'react';
import type { User } from '../types';
import { CloseIcon } from './Icons';
import { useTranslation } from '../App';

interface CommissionEditorModalProps {
  member: User;
  onClose: () => void;
  onSave: (memberId: string, newRate: number) => void;
}

export const CommissionEditorModal: React.FC<CommissionEditorModalProps> = ({ member, onClose, onSave }) => {
  const { t } = useTranslation();
  const [rate, setRate] = useState(member.commissionRate || 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newRate = Number(rate);
    if (!isNaN(newRate) && newRate >= 0 && newRate <= 100) {
      onSave(member.id, newRate);
    } else {
        alert("Please enter a valid commission rate between 0 and 100.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 animate-fadeIn-dialog" onClick={onClose}>
      <div className="bg-[#121212] rounded-lg w-full max-w-sm flex flex-col transform animate-slideUp-dialog" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Edit Commission</h2>
          <button onClick={onClose}><CloseIcon /></button>
        </header>
        <form onSubmit={handleSave} className="p-4 space-y-4">
          <p className="text-sm text-gray-400">Set the commission rate for <span className="font-semibold text-white">{member.username}</span>.</p>
          <div>
            <label htmlFor="commissionRateInput" className="block text-sm font-medium text-gray-400 mb-1">Commission Rate (%)</label>
            <input
              id="commissionRateInput"
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
              min="0"
              max="100"
              step="0.1"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">
            {t('saveChanges')}
          </button>
        </form>
      </div>
       <style>{`
          @keyframes fadeIn-dialog { from { opacity: 0; } to { opacity: 1; } } .animate-fadeIn-dialog { animation: fadeIn-dialog 0.2s ease-out forwards; }
          @keyframes slideUp-dialog { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-slideUp-dialog { animation: slideUp-dialog 0.2s ease-out forwards; }
        `}</style>
    </div>
  );
};
