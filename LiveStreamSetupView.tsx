import React, { useState, useRef } from 'react';
import type { User, Product } from '../types';
import { useTranslation } from '../App';
import { PlusIcon, TrashIcon, ArrowRightIcon, CameraIcon, CloseIcon } from './Icons';

interface LiveStreamSetupViewProps {
  currentUser: User;
  myProducts: Product[];
  onFinalizeStream: (setup: { title: string, thumbnail: string, productIds: string[], scheduledAt?: string }) => void;
}

// A simple drag-and-drop hook
const useDraggableList = <T extends { id: string }>(initialList: T[]) => {
    const [list, setList] = useState(initialList);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragItem.current = position;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragOverItem.current = position;
        const newList = [...list];
        const dragItemContent = newList[dragItem.current!];
        newList.splice(dragItem.current!, 1);
        newList.splice(dragOverItem.current!, 0, dragItemContent);
        dragItem.current = dragOverItem.current;
        dragOverItem.current = null;
        setList(newList);
    };

    return { list, setList, handleDragStart, handleDragEnter };
};


const ProductPickerModal: React.FC<{
  products: Product[];
  onAdd: (product: Product) => void;
  onClose: () => void;
}> = ({ products, onAdd, onClose }) => {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-[#121212] rounded-xl w-full max-w-md flex flex-col h-[70vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold">{t('addProduct')}</h3>
                    <button onClick={onClose}><CloseIcon/></button>
                </header>
                <div className="flex-grow p-2 overflow-y-auto">
                    {products.length > 0 ? (
                        <div className="space-y-2">
                           {products.map(p => (
                                <div key={p.id} className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg">
                                    <img src={p.variants[0].mediaUrl} alt={p.name} className="w-12 h-12 object-contain rounded-md" />
                                    <p className="text-sm font-semibold flex-1 truncate">{p.name}</p>
                                    <button onClick={() => onAdd(p)} className="p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-colors"><PlusIcon className="w-4 h-4"/></button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 pt-10">{t('noOtherProductsToAdd')}</p>
                    )}
                </div>
                <footer className="p-4 border-t border-gray-800">
                    <button onClick={onClose} className="w-full bg-gray-700 font-bold py-2 rounded-lg hover:bg-gray-600 transition-colors">{t('close')}</button>
                </footer>
            </div>
        </div>
    )
}


export const LiveStreamSetupView: React.FC<LiveStreamSetupViewProps> = ({ currentUser, myProducts, onFinalizeStream }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState<string>('');
  const [availableProducts, setAvailableProducts] = useState(myProducts);
  const { list: showcasedProducts, setList: setShowcasedProducts, handleDragStart, handleDragEnter } = useDraggableList<Product>([]);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    return now.toISOString().slice(0, 16);
  });


  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setThumbnail(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addProductToShowcase = (product: Product) => {
    setShowcasedProducts(prev => [...prev, product]);
    setAvailableProducts(prev => prev.filter(p => p.id !== product.id));
  };
  
  const removeProductFromShowcase = (product: Product) => {
    setShowcasedProducts(prev => prev.filter(p => p.id !== product.id));
    setAvailableProducts(prev => [...prev, product]);
  };
  
  const handleFinalize = () => {
      onFinalizeStream({
          title,
          thumbnail,
          productIds: showcasedProducts.map(p => p.id),
          scheduledAt: isScheduling ? new Date(scheduledAt).toISOString() : undefined
      })
  }

  const isStep1Valid = title.trim() !== '' && thumbnail !== '' && (!isScheduling || scheduledAt !== '');
  const isStep2Valid = showcasedProducts.length > 0;

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold font-serif">{t('streamDetails')}</h2>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">{t('streamTitle')}</label>
              <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('streamTitlePlaceholder')} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t('coverPhoto')}</label>
              <input type="file" accept="image/*" ref={thumbnailInputRef} onChange={handleThumbnailChange} className="hidden"/>
              <button onClick={() => thumbnailInputRef.current?.click()} className="w-full aspect-[3/4] bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 hover:border-gray-600">
                {thumbnail ? <img src={thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover rounded-lg" /> : <PlusIcon className="w-10 h-10 text-gray-500" />}
              </button>
            </div>
             <div>
                <div className="flex justify-between items-center bg-gray-800 p-2 rounded-lg">
                    <label htmlFor="scheduleToggle" className="text-sm font-medium text-gray-300">{t('scheduleForLater')}</label>
                    <button type="button" role="switch" aria-checked={isScheduling} onClick={() => setIsScheduling(!isScheduling)} id="scheduleToggle" className={`${isScheduling ? 'bg-blue-600' : 'bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}>
                        <span className={`${isScheduling ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
                    </button>
                </div>
                {isScheduling && (
                    <div className="mt-4 animate-fadeIn">
                        <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-400 mb-1">{t('streamDateTime')}</label>
                        <input 
                            type="datetime-local" 
                            id="scheduledAt" 
                            value={scheduledAt}
                            onChange={e => setScheduledAt(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>
                )}
            </div>
            <button onClick={() => setStep(2)} disabled={!isStep1Valid} className="w-full bg-blue-600 font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-600">
                <span>{t('selectProducts')}</span>
                <ArrowRightIcon className="w-5 h-5"/>
            </button>
          </div>
        )
      case 2:
        return (
            <div className="h-full flex flex-col animate-fadeIn">
                <h2 className="text-2xl font-bold font-serif mb-2 flex-shrink-0">{t('orderProducts')}</h2>
                <p className="text-sm text-gray-400 mb-4 flex-shrink-0">{t('orderProductsDescription')}</p>

                <div className="flex-grow bg-gray-900 rounded-lg p-2 space-y-2 overflow-y-auto">
                    {showcasedProducts.length > 0 ? showcasedProducts.map((p, index) => (
                        <div
                            key={p.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragOver={(e) => e.preventDefault()}
                            className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg cursor-grab active:cursor-grabbing"
                        >
                            <img src={p.variants[0].mediaUrl} alt={p.name} className="w-12 h-12 object-contain rounded-md" />
                            <p className="text-sm font-semibold flex-1 truncate">{p.name}</p>
                            <button onClick={() => removeProductFromShowcase(p)}><TrashIcon className="w-5 h-5 text-red-500"/></button>
                        </div>
                    )) : <p className="text-center text-sm text-gray-500 pt-10">{t('noProductsAddedYet')}</p>}
                </div>
                
                 <button onClick={() => setIsProductPickerOpen(true)} className="mt-4 w-full flex items-center justify-center gap-2 text-sm py-3 px-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 flex-shrink-0">
                    <PlusIcon className="w-5 h-5" /> {t('addProduct')}
                </button>

                <div className="flex gap-2 mt-4 flex-shrink-0">
                     <button onClick={() => setStep(1)} className="flex-1 bg-gray-700 font-bold py-3 rounded-lg">{t('back')}</button>
                     <button onClick={handleFinalize} disabled={!isStep2Valid} className="flex-1 bg-red-600 font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-600">
                        <CameraIcon className="w-5 h-5"/>
                        <span>{isScheduling ? t('scheduleStream') : t('goLive')}</span>
                    </button>
                </div>
            </div>
        )
      default: return null;
    }
  }

  return (
    <>
        <div className="bg-black text-white h-screen overflow-y-auto pt-16 pb-4 flex flex-col">
          <div className="p-4 flex-grow flex flex-col">
            {renderStep()}
          </div>
        </div>
        {isProductPickerOpen && (
            <ProductPickerModal
                products={availableProducts}
                onAdd={addProductToShowcase}
                onClose={() => setIsProductPickerOpen(false)}
            />
        )}
        <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        `}</style>
    </>
  );
};
