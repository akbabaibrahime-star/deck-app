import React, { useState } from 'react';
import type { ProductPackTemplate } from '../types';
import { CloseIcon } from './Icons';
import { useTranslation } from '../App';

interface PackTemplateEditorProps {
  onSave: (templateData: Omit<ProductPackTemplate, 'id'>, templateId?: string) => void;
  onClose: () => void;
  templateToEdit?: ProductPackTemplate;
}

export const PackTemplateEditor: React.FC<PackTemplateEditorProps> = ({ onSave, onClose, templateToEdit }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(templateToEdit?.name || '');
  const [contents, setContents] = useState<{ [size: string]: number }>(templateToEdit?.contents || {});
  
  const [sizes, setSizes] = useState<string[]>(templateToEdit ? Object.keys(templateToEdit.contents) : []);
  const [currentSize, setCurrentSize] = useState('');

  const handleAddSize = () => {
    const trimmedSize = currentSize.trim().toUpperCase();
    if (trimmedSize && !sizes.includes(trimmedSize)) {
      setSizes([...sizes, trimmedSize]);
      setCurrentSize('');
    }
  };

  const handleRemoveSize = (indexToRemove: number) => {
    const sizeToRemove = sizes[indexToRemove];
    setSizes(sizes.filter((_, index) => index !== indexToRemove));
    setContents(prev => {
        const newContents = { ...prev };
        delete newContents[sizeToRemove];
        return newContents;
    });
  };

  const handleSizeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSize();
    }
  };

  const handleContentChange = (size: string, quantity: string) => {
    const numQuantity = parseInt(quantity, 10);
    setContents(prev => {
        const newContents = { ...prev };
        if (!isNaN(numQuantity) && numQuantity > 0) {
            newContents[size] = numQuantity;
        } else {
            delete newContents[size];
        }
        return newContents;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert("Please provide a name for the template.");
        return;
    }
    const finalContents = Object.fromEntries(
        Object.entries(contents).filter(([, qty]) => qty > 0)
    );
    onSave({ name, contents: finalContents }, templateToEdit?.id);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 animate-fadeIn-dialog" onClick={onClose}>
        <div className="bg-[#121212] rounded-lg w-full max-w-lg flex flex-col max-h-[90vh] transform animate-slideUp-dialog" onClick={e => e.stopPropagation()}>
            <header className="p-4 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold">{templateToEdit ? t('editPackTemplate') : t('createPackTemplate')}</h2>
                <button onClick={onClose}><CloseIcon /></button>
            </header>
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-4 space-y-4">
                 <div>
                    <label htmlFor="templateName" className="block text-sm font-medium text-gray-400 mb-1">{t('templateName')}</label>
                    <input type="text" id="templateName" value={name} onChange={e => setName(e.target.value)} placeholder={t('packTemplateNamePlaceholder')} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" required />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">{t('sizes')}</label>
                    <div className="flex flex-wrap gap-2 mb-2 p-2 min-h-[44px] bg-gray-900 rounded-lg border border-gray-800">
                    {sizes.map((size, index) => (
                        <div key={index} className="flex items-center gap-1.5 bg-gray-700 text-white text-sm font-medium rounded-full px-3 py-1 animate-fadeIn">
                        <span>{size}</span>
                        <button type="button" onClick={() => handleRemoveSize(index)} className="text-gray-400 hover:text-white" aria-label={`Remove ${size} size`}>
                            <CloseIcon className="w-3.5 h-3.5" />
                        </button>
                        </div>
                    ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={currentSize}
                            placeholder={t('sizeInputPlaceholder')}
                            onChange={e => setCurrentSize(e.target.value)}
                            onKeyDown={handleSizeInputKeyDown}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                        />
                        <button 
                            type="button" 
                            onClick={handleAddSize} 
                            className="bg-gray-700 text-white font-semibold px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                            disabled={!currentSize.trim()}
                        >
                            {t('add')}
                        </button>
                    </div>
                </div>

                 <div className="pt-4 border-t border-gray-800">
                    <label className="block text-sm font-medium text-gray-400 mb-2">{t('packContents')}</label>
                    {sizes.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {sizes.map(size => (
                                <div key={size} className="animate-fadeIn">
                                    <label htmlFor={`pack-qty-${size}`} className="block text-center text-sm font-medium text-gray-300 mb-1">{size}</label>
                                    <input
                                        type="number"
                                        id={`pack-qty-${size}`}
                                        min="0"
                                        placeholder="0"
                                        value={contents[size] || ''}
                                        onChange={(e) => handleContentChange(size, e.target.value)}
                                        className="w-full text-center bg-gray-800 border border-gray-700 rounded-lg px-2 py-2"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-gray-500">{t('addSizesToDefineContents')}</p>
                    )}
                </div>
            </form>
            <footer className="p-4 border-t border-gray-800 flex-shrink-0">
                <button onClick={handleSubmit} className="w-full bg-blue-600 font-bold py-2 rounded-lg">{t('saveTemplate')}</button>
            </footer>
             <style>{`
                @keyframes fadeIn-dialog { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn-dialog { animation: fadeIn-dialog 0.2s ease-out forwards; }
                @keyframes slideUp-dialog { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slideUp-dialog { animation: slideUp-dialog 0.2s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
             `}</style>
        </div>
    </div>
  );
};