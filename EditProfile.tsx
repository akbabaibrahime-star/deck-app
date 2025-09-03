import React, { useState, useRef } from 'react';
import type { User } from '../types';
import { AvatarCropper } from './AvatarCropper';
import type { MediaUpload } from './UploadActionSheet';
import { useTranslation } from '../App';

interface EditProfileProps {
  user: User;
  onSave: (updatedUser: User) => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ user, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(user);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleMediaSelected([{ dataUrl: reader.result as string, file }]);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleMediaSelected = (media: MediaUpload[]) => {
    const firstItem = media[0];
    if (firstItem) {
      setImageToCrop(firstItem.dataUrl);
    }
  };

  const handleRealign = () => {
    if (formData.originalAvatarUrl) {
        setImageToCrop(formData.originalAvatarUrl);
    }
  };

  const handleCroppedAvatarSave = async (croppedImage: string) => {
    let resizedOriginal: string | undefined = undefined;
    if (imageToCrop) {
        try {
            resizedOriginal = await new Promise<string>((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    const maxSize = 1024; // Max size for the "original" to be stored
                    let { width, height } = img;
                    if (width > height) {
                        if (width > maxSize) {
                            height = Math.round(height * (maxSize / width));
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = Math.round(width * (maxSize / height));
                            height = maxSize;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject('Could not get canvas context');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                };
                img.onerror = (err) => reject(err);
                img.src = imageToCrop;
            });
        } catch (err) {
            console.error("Could not resize original avatar:", err);
            resizedOriginal = imageToCrop; // fallback to large one on error
        }
    }

    setFormData(prev => ({
        ...prev,
        avatarUrl: croppedImage,
        originalAvatarUrl: resizedOriginal || prev.originalAvatarUrl
    }));
    setImageToCrop(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    
    if (keys.length > 1) {
      const [category, field] = keys as [keyof User, string];
      setFormData(prev => ({
        ...prev,
        [category]: {
          ...(prev[category] as object),
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="bg-black text-white h-screen overflow-y-auto pt-16 pb-24">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">{t('editProfile')}</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="relative group">
                        <img src={formData.avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-gray-700" />
                        <button
                            type="button"
                            onClick={handleAvatarClick}
                            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            aria-label="Change profile picture"
                        >
                            <span className="font-semibold">{t('change')}</span>
                        </button>
                    </div>
                    {formData.originalAvatarUrl && (
                        <button
                            type="button"
                            onClick={handleRealign}
                            className="text-sm text-blue-400 hover:text-blue-300"
                        >
                            {t('realign')}
                        </button>
                    )}
                </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">{t('username')}</label>
              <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-1">{t('bio')}</label>
              <textarea name="bio" id="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
            </div>
            
            <div className="pt-4 border-t border-gray-800">
              <h2 className="text-lg font-semibold mb-2">{t('contactInfo')}</h2>
              <div>
                <label htmlFor="contact.email" className="block text-sm font-medium text-gray-400 mb-1">{t('email')}</label>
                <input type="email" name="contact.email" id="contact.email" value={formData.contact.email} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="mt-4">
                <label htmlFor="contact.phone" className="block text-sm font-medium text-gray-400 mb-1">{t('phone')}</label>
                <input type="tel" name="contact.phone" id="contact.phone" value={formData.contact.phone} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            
             <div className="pt-4 border-t border-gray-800">
              <h2 className="text-lg font-semibold">{t('address')}</h2>
              <div className="mt-2">
                <label htmlFor="address.googleMapsUrl" className="block text-sm font-medium text-gray-400 mb-1">{t('googleMapsLink')}</label>
                <input type="url" name="address.googleMapsUrl" id="address.googleMapsUrl" value={formData.address.googleMapsUrl} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="https://maps.app.goo.gl/..." />
              </div>
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-sm border-t border-white/10 max-w-md mx-auto">
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                {t('saveChanges')}
              </button>
            </div>
          </form>
        </div>
      </div>
      {imageToCrop && (
        <AvatarCropper
          imageSrc={imageToCrop}
          onSave={handleCroppedAvatarSave}
          onClose={() => setImageToCrop(null)}
        />
      )}
    </>
  );
};