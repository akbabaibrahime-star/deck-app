import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon } from './Icons';
import { useTranslation } from '../App';

interface AvatarCropperProps {
  imageSrc: string;
  onSave: (croppedImage: string) => void;
  onClose: () => void;
}

const CROP_AREA_SIZE = 256;
const CROP_CONTAINER_SIZE = 320;

export const AvatarCropper: React.FC<AvatarCropperProps> = ({ imageSrc, onSave, onClose }) => {
  const { t } = useTranslation();
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
        // Fit image to cover the crop area initially ("cover" logic)
        const cropAreaW = CROP_AREA_SIZE;
        const cropAreaH = CROP_AREA_SIZE;
        const imgRatio = img.naturalWidth / img.naturalHeight;
        
        let width, height;
        if (imgRatio > 1) { // image is wider than crop area
            height = cropAreaH;
            width = cropAreaH * imgRatio;
        } else { // image is taller or same ratio
            width = cropAreaW;
            height = cropAreaW / imgRatio;
        }

        setImageSize({ width, height });
        // Reset zoom and offset for new image
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    };
  }, [imageSrc]);

  const handleInteractionStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };
  
  const handleInteractionMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;

    const scaledWidth = imageSize.width * zoom;
    const scaledHeight = imageSize.height * zoom;
    const maxOffsetX = Math.max(0, (scaledWidth - CROP_AREA_SIZE) / 2);
    const maxOffsetY = Math.max(0, (scaledHeight - CROP_AREA_SIZE) / 2);

    setOffset({
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, newX)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newY)),
    });
  };

  const handleInteractionEnd = () => {
    setIsDragging(false);
  };
  
  const handleCrop = () => {
    if (!imageRef.current || !imageSize.width) return;

    const canvas = document.createElement('canvas');
    const finalSize = 256; // Output size
    canvas.width = finalSize;
    canvas.height = finalSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    
    // Correct calculation for cropping logic
    // This ratio converts pre-zoomed screen pixels to original image pixels.
    const screenToOrigRatio = img.naturalWidth / imageSize.width;
    
    // This is the final ratio that converts post-zoomed screen pixels to original image pixels.
    const effectiveRatio = screenToOrigRatio / zoom;

    // Calculate the source rectangle dimensions in original image pixels.
    const sWidth = CROP_AREA_SIZE * effectiveRatio;
    const sHeight = CROP_AREA_SIZE * effectiveRatio;
    
    // Calculate the top-left corner (sx, sy) of the source rectangle.
    // Start from the center of the original image, adjust for the pan (offset), then move to the top-left of the source rect.
    const sx = (img.naturalWidth / 2) - (sWidth / 2) - (offset.x * effectiveRatio);
    const sy = (img.naturalHeight / 2) - (sHeight / 2) - (offset.y * effectiveRatio);

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, finalSize, finalSize);
    
    onSave(canvas.toDataURL('image/jpeg'));
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center animate-fadeIn" 
        onMouseUp={handleInteractionEnd} 
        onMouseLeave={handleInteractionEnd} 
        onMouseMove={(e) => handleInteractionMove(e.clientX, e.clientY)}
        onTouchEnd={handleInteractionEnd}
        onTouchMove={(e) => e.touches[0] && handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY)}
    >
        <div className="w-full max-w-sm bg-[#121212] rounded-lg shadow-lg flex flex-col text-white">
            <header className="p-4 flex justify-between items-center border-b border-gray-800">
                <h2 className="text-xl font-bold">{t('adjustAvatar')}</h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="p-4 flex-grow flex items-center justify-center">
                <div 
                    className="relative bg-gray-900"
                    style={{ width: `${CROP_CONTAINER_SIZE}px`, height: `${CROP_CONTAINER_SIZE}px` }}
                >
                    <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-2 border-white/50" 
                        style={{ width: `${CROP_AREA_SIZE}px`, height: `${CROP_AREA_SIZE}px` }}
                    >
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="Avatar to crop"
                            onMouseDown={(e) => { e.preventDefault(); handleInteractionStart(e.clientX, e.clientY); }}
                            onTouchStart={(e) => e.touches[0] && handleInteractionStart(e.touches[0].clientX, e.touches[0].clientY)}
                            className="cursor-grab active:cursor-grabbing"
                            style={{
                                width: `${imageSize.width}px`,
                                height: `${imageSize.height}px`,
                                transformOrigin: 'center center',
                                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                willChange: 'transform',
                            }}
                            draggable="false"
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4 border-t border-gray-800">
                <div className="flex items-center gap-3">
                    <span className="text-sm">{t('zoom')}</span>
                    <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.01"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
                    />
                </div>
                <button
                    onClick={handleCrop}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {t('saveAvatar')}
                </button>
            </div>
        </div>
        <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
            .range-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; background: #FFF; border-radius: 50%; cursor: pointer; }
            .range-slider::-moz-range-thumb { width: 20px; height: 20px; background: #FFF; border-radius: 50%; cursor: pointer; border: none; }
        `}</style>
    </div>
  );
};
