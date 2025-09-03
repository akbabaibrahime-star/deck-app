import React, { useState } from 'react';
import type { SizeGuideTemplate, SizeGuide } from '../types';
import { CloseIcon } from './Icons';
import { useTranslation } from '../App';

interface SizeGuideTemplateEditorProps {
  onSave: (templateData: Omit<SizeGuideTemplate, 'id'>, templateId?: string) => void;
  onClose: () => void;
  templateToEdit?: SizeGuideTemplate;
}

const PREDEFINED_HEADERS = ['Göğüs', 'Bel', 'Kalça', 'Kol Boyu', 'Omuz Boyu'];

export const SizeGuideTemplateEditor: React.FC<SizeGuideTemplateEditorProps> = ({ onSave, onClose, templateToEdit }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(templateToEdit?.name || '');
  const [sizes, setSizes] = useState<string[]>(templateToEdit ? Object.keys(templateToEdit.sizeGuide.measurements) : []);
  const [currentSize, setCurrentSize] = useState('');
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>(templateToEdit?.sizeGuide.headers || ['Göğüs', 'Bel', 'Kalça']);

  const getInitialMeasurements = () => {
    if (!templateToEdit) return {};
    const initial: { [size: string]: { [header: string]: string } } = {};
    Object.keys(templateToEdit.sizeGuide.measurements).forEach(size => {
      initial[size] = {};
      templateToEdit.sizeGuide.headers.forEach((header, index) => {
        initial[size][header] = templateToEdit.sizeGuide.measurements[size][index] || '';
      });
    });
    return initial;
  };
  const [measurements, setMeasurements] = useState<{ [size: string]: { [header: string]: string } }>(getInitialMeasurements());

  const handleAddSize = () => {
    const trimmedSize = currentSize.trim().toUpperCase();
    if (trimmedSize && !sizes.includes(trimmedSize)) {
      setSizes([...sizes, trimmedSize]);
      setMeasurements(prev => ({ ...prev, [trimmedSize]: {} }));
      setCurrentSize('');
    }
  };

  const handleRemoveSize = (indexToRemove: number) => {
    const sizeToRemove = sizes[indexToRemove];
    setSizes(sizes.filter((_, index) => index !== indexToRemove));
    setMeasurements(prev => {
        const newMeasurements = { ...prev };
        delete newMeasurements[sizeToRemove];
        return newMeasurements;
    });
  };

  const handleSizeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSize();
    }
  };

  const handleToggleHeader = (header: string) => {
    setSelectedHeaders(prev => 
      prev.includes(header) ? prev.filter(h => h !== header) : [...prev, header]
    );
  };
  
  const handleMeasurementChange = (size: string, header: string, value: string) => {
    setMeasurements(prev => ({
        ...prev,
        [size]: {
            ...prev[size],
            [header]: value
        }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert("Please provide a name for the template.");
        return;
    }

    const sizeGuide: SizeGuide = {
        headers: selectedHeaders,
        measurements: {},
    };

    sizes.forEach(size => {
        sizeGuide.measurements[size] = selectedHeaders.map(header => measurements[size]?.[header] || '');
    });
    
    onSave({ name, sizeGuide }, templateToEdit?.id);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 animate-fadeIn-dialog" onClick={onClose}>
        <div className="bg-[#121212] rounded-lg w-full max-w-lg flex flex-col max-h-[90vh] transform animate-slideUp-dialog" onClick={e => e.stopPropagation()}>
            <header className="p-4 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold">{templateToEdit ? t('editTemplate') : t('createTemplate')}</h2>
                <button onClick={onClose}><CloseIcon /></button>
            </header>
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-4 space-y-4">
                 <div>
                    <label htmlFor="templateName" className="block text-sm font-medium text-gray-400 mb-1">{t('templateName')}</label>
                    <input type="text" id="templateName" value={name} onChange={e => setName(e.target.value)} placeholder={t('templateNamePlaceholder')} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" required />
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

                {sizes.length > 0 && (
                    <div className="pt-4 border-t border-gray-800 animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-400 mb-2">{t('measurementHeadings')}</label>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {PREDEFINED_HEADERS.map(header => (
                                <button 
                                    type="button" 
                                    key={header} 
                                    onClick={() => handleToggleHeader(header)}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedHeaders.includes(header) ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-600 text-gray-300'}`}
                                >
                                    {selectedHeaders.includes(header) ? '✓ ' : ''}{header}
                                </button>
                            ))}
                        </div>

                        {selectedHeaders.length > 0 && (
                            <div className="space-y-2 overflow-x-auto">
                                <h4 className="text-sm font-medium text-gray-400">{t('enterMeasurements')}</h4>
                                <div className="grid gap-2 text-xs text-center font-bold text-gray-500 px-1" style={{gridTemplateColumns: `minmax(60px, 1fr) repeat(${selectedHeaders.length}, minmax(80px, 1fr))`}}>
                                    <span>{t('size')}</span>
                                    {selectedHeaders.map(h => <span key={h}>{h}</span>)}
                                </div>
                                {sizes.map(size => (
                                    <div key={size} className="grid gap-2 items-center" style={{gridTemplateColumns: `minmax(60px, 1fr) repeat(${selectedHeaders.length}, minmax(80px, 1fr))`}}>
                                        <span className="text-sm font-semibold text-center bg-gray-800/50 py-1.5 rounded-md">{size}</span>
                                        {selectedHeaders.map(header => (
                                                <input 
                                                key={header}
                                                type="text" 
                                                placeholder="-" 
                                                value={measurements[size]?.[header] || ''} 
                                                onChange={(e) => handleMeasurementChange(size, header, e.target.value)} 
                                                className="w-full text-xs text-center bg-gray-800 border border-gray-700 rounded-md px-1 py-1.5" 
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </form>
            <footer className="p-4 border-t border-gray-800 flex-shrink-0">
                <button onClick={handleSubmit} className="w-full bg-blue-600 font-bold py-2 rounded-lg">{t('saveTemplate')}</button>
            </footer>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
             `}</style>
        </div>
    </div>
  );
};