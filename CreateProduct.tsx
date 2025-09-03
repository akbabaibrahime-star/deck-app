import React, { useState, useMemo, useRef } from 'react';
import type { Product, MediaVariant, SizeGuide, User, SizeGuideTemplate, ProductPack, ProductPackTemplate } from '../types';
import { PlusIcon, TrashIcon, CloseIcon, PhotographIcon, RulerIcon, CameraIcon } from './Icons';
import { AISceneStudio } from './AISceneStudio';
import type { MediaUpload } from './UploadActionSheet';
import { useTranslation } from '../App';
import { VideoRecorder } from './VideoRecorder';

interface CreateProductProps {
  onSave: (product: Omit<Product, 'id' | 'creator'>) => void;
  onUpdate?: (product: Product) => void;
  onClose: () => void;
  currentUser: User | null;
  productToEdit?: Product;
}

type DraftVariant = Omit<MediaVariant, 'mediaType'> & { file?: File };
type DraftPack = { name: string; price: string; contents: { [size: string]: string } };

const PREDEFINED_HEADERS = ['Göğüs', 'Bel', 'Kalça', 'Kol Boyu', 'Omuz Boyu'];

export const CreateProduct: React.FC<CreateProductProps> = ({ onSave, onUpdate, onClose, currentUser, productToEdit }) => {
  const { t } = useTranslation();
  const isEditing = !!productToEdit;
  const [step, setStep] = useState(1);

  const mapVariantsToDraft = (variants: MediaVariant[] = []): DraftVariant[] => {
    return variants.map(v => ({
      name: v.name,
      color: v.color,
      mediaUrl: v.mediaUrl,
      file: undefined,
    }));
  };

  const mapPacksToDraft = (packs: ProductPack[] = []): DraftPack[] => {
    return packs.map(p => ({
        name: p.name,
        price: p.price.toString(),
        contents: Object.entries(p.contents).reduce((acc, [size, qty]) => {
            acc[size] = qty.toString();
            return acc;
        }, {} as {[size: string]: string})
    }));
  };
  
  const getInitialMeasurements = () => {
    if (!productToEdit || !productToEdit.sizeGuide) return {};
    const initial: { [size: string]: { [header: string]: string } } = {};
    const { sizeGuide } = productToEdit;
    (productToEdit.sizes || []).forEach(size => {
      initial[size] = {};
      sizeGuide.headers.forEach((header, index) => {
        initial[size][header] = sizeGuide.measurements[size]?.[index] || '';
      });
    });
    return initial;
  };

  // All state is kept at the top level to persist across steps
  const [isWholesale, setIsWholesale] = useState(productToEdit?.isWholesale || false);
  const [name, setName] = useState(productToEdit?.name || '');
  const [price, setPrice] = useState(productToEdit?.price?.toString() || '');
  const [originalPrice, setOriginalPrice] = useState(productToEdit?.originalPrice?.toString() || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [sizes, setSizes] = useState<string[]>(productToEdit?.sizes || []);
  const [currentSize, setCurrentSize] = useState('');
  const [variants, setVariants] = useState<DraftVariant[]>(mapVariantsToDraft(productToEdit?.variants));
  const [packs, setPacks] = useState<DraftPack[]>(mapPacksToDraft(productToEdit?.packs));
  const [fabricName, setFabricName] = useState(productToEdit?.fabric.name || '');
  const [fabricDescription, setFabricDescription] = useState(productToEdit?.fabric.description || '');
  const [fabricCloseUpImage, setFabricCloseUpImage] = useState<string | null>(productToEdit?.fabric.closeUpImageUrl || null);
  const [category, setCategory] = useState(productToEdit?.category || '');
  const [tags, setTags] = useState<string[]>(productToEdit?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>(productToEdit?.sizeGuide?.headers || ['Göğüs', 'Bel', 'Kalça']);
  const [measurements, setMeasurements] = useState<{ [size: string]: { [header: string]: string } }>(getInitialMeasurements());
  
  const [isAISceneStudioOpen, setIsAISceneStudioOpen] = useState(false);
  const [editingVariantIndexForAI, setEditingVariantIndexForAI] = useState<number | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showPackTemplatePicker, setShowPackTemplatePicker] = useState(false);
  const [packTemplateTargetIndex, setPackTemplateTargetIndex] = useState<number | null>(null);
  const [uploadTarget, setUploadTarget] = useState<'fabric' | { type: 'variant', index: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraForVariantIndex, setCameraForVariantIndex] = useState<number | null>(null);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video' | null>(null);


  // --- Step Validation ---
  const isStep1Valid = useMemo(() => {
    return name.trim() && fabricName.trim() && fabricDescription.trim();
  }, [name, fabricName, fabricDescription]);

  const isStep2Valid = useMemo(() => {
    if (variants.length === 0) return false;
    return variants.every(v => v.name.trim() && v.mediaUrl);
  }, [variants]);

  const isStep3Valid = useMemo(() => {
    if (isWholesale) {
      if (packs.length === 0) return false;
      return packs.every(p => {
          const totalQty = Object.values(p.contents).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
          return p.name.trim() && p.price.trim() && !isNaN(parseFloat(p.price)) && totalQty > 0;
      });
    } else {
      return price.trim() && !isNaN(parseFloat(price));
    }
  }, [isWholesale, packs, price]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!name.trim()) errors.push("Product name is required.");
    if (!isWholesale && (!price.trim() || isNaN(parseFloat(price)))) errors.push("A valid price is required.");
    if (isWholesale && packs.length === 0) errors.push("Please define at least one pack for wholesale.");
    if (isWholesale) {
      packs.forEach((pack, i) => {
        if (!pack.name.trim()) errors.push(`Pack #${i + 1} needs a name.`);
        if (!pack.price.trim() || isNaN(parseFloat(pack.price))) errors.push(`Pack #${i + 1} needs a valid price.`);
        const totalQty = Object.values(pack.contents).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
        if (totalQty === 0) errors.push(`Pack #${i + 1} must contain at least one item.`);
      });
    }
    if (variants.length === 0) {
      errors.push("Please add at least one product variant.");
    } else {
      variants.forEach((v, i) => {
        if (!v.name.trim()) errors.push(`Variant #${i + 1} needs a name.`);
        if (!v.mediaUrl) errors.push(`Variant #${i + 1} needs an image or video.`);
      });
    }
    return errors;
  }, [name, price, variants, isWholesale, packs]);
  
  const isFormValid = validationErrors.length === 0;

  // --- Handlers ---
  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleAddVariant = () => setVariants([...variants, { name: '', color: '#000000', mediaUrl: '' }]);
  const handleAddPack = () => setPacks([...packs, { name: '', price: '', contents: {} }]);
  const handleVariantChange = (index: number, field: keyof DraftVariant, value: any) => { const newVariants = [...variants]; (newVariants[index] as any)[field] = value; setVariants(newVariants); };
  const handlePackChange = (index: number, field: keyof DraftPack, value: any) => { const newPacks = [...packs]; (newPacks[index] as any)[field] = value; setPacks(newPacks); };
  const handlePackContentChange = (packIndex: number, size: string, quantity: string) => { const newPacks = [...packs]; newPacks[packIndex].contents[size] = quantity; setPacks(newPacks); };
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
  const removePack = (index: number) => setPacks(packs.filter((_, i) => i !== index));
  const handleAddTag = () => { const trimmedTag = currentTag.trim().toLowerCase(); if (trimmedTag && !tags.includes(trimmedTag)) { setTags([...tags, trimmedTag]); setCurrentTag(''); } };
  const handleRemoveTag = (indexToRemove: number) => setTags(tags.filter((_, index) => index !== indexToRemove));
  const handleAddSize = () => { const trimmedSize = currentSize.trim().toUpperCase(); if (trimmedSize && !sizes.includes(trimmedSize)) { setSizes([...sizes, trimmedSize]); setMeasurements(prev => ({ ...prev, [trimmedSize]: {} })); setCurrentSize(''); } };
  const handleRemoveSize = (indexToRemove: number) => {
    const sizeToRemove = sizes[indexToRemove];
    setSizes(sizes.filter((_, index) => index !== indexToRemove));
    setMeasurements(prev => { const newMeasurements = { ...prev }; delete newMeasurements[sizeToRemove]; return newMeasurements; });
    setPacks(prevPacks => prevPacks.map(pack => { const newContents = { ...pack.contents }; delete newContents[sizeToRemove]; return { ...pack, contents: newContents }; }));
  };
  const handleMeasurementChange = (size: string, header: string, value: string) => setMeasurements(prev => ({ ...prev, [size]: { ...prev[size], [header]: value } }));
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } };
  const handleSizeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSize(); } };
  const handleToggleHeader = (header: string) => setSelectedHeaders(prev => prev.includes(header) ? prev.filter(h => h !== header) : [...prev, header]);
  const handleAIImageGenerated = (imageUrl: string) => {
    if (editingVariantIndexForAI !== null) { handleVariantChange(editingVariantIndexForAI, 'mediaUrl', imageUrl); handleVariantChange(editingVariantIndexForAI, 'file', undefined); }
    setIsAISceneStudioOpen(false); setEditingVariantIndexForAI(null);
  };
  const handleTemplateSelect = (template: SizeGuideTemplate) => {
    const { sizeGuide } = template; const templateSizes = Object.keys(sizeGuide.measurements); setSizes(templateSizes); setSelectedHeaders(sizeGuide.headers);
    const newMeasurements: { [size: string]: { [header: string]: string } } = {};
    templateSizes.forEach(size => { newMeasurements[size] = {}; sizeGuide.headers.forEach((header, index) => { newMeasurements[size][header] = sizeGuide.measurements[size][index] || ''; }); });
    setMeasurements(newMeasurements); setShowTemplatePicker(false);
  };
  const handlePackTemplateSelect = (template: ProductPackTemplate) => {
    if (packTemplateTargetIndex === null) return;
    const newPacks = [...packs]; const targetPack = newPacks[packTemplateTargetIndex]; if (!targetPack) return;
    targetPack.name = template.name; const newContents: { [size: string]: string } = {};
    sizes.forEach(size => { if (template.contents[size]) { newContents[size] = String(template.contents[size]); } });
    targetPack.contents = newContents; setPacks(newPacks); setShowPackTemplatePicker(false); setPackTemplateTargetIndex(null);
  };
  const handleUploadClick = (target: 'fabric' | { type: 'variant', index: number }) => { setUploadTarget(target); fileInputRef.current?.click(); };

  const handleMediaSelected = (media: MediaUpload[]) => {
    const firstItem = media[0]; if (!firstItem || !uploadTarget) return;
    if (uploadTarget === 'fabric') { setFabricCloseUpImage(firstItem.dataUrl); } 
    else if (typeof uploadTarget === 'object' && uploadTarget.type === 'variant') { handleVariantChange(uploadTarget.index, 'mediaUrl', firstItem.dataUrl); handleVariantChange(uploadTarget.index, 'file', firstItem.file); }
    setUploadTarget(null);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const maxSize = 1024; let { width, height } = img;
              if (width > height) { if (width > maxSize) { height = Math.round(height * (maxSize / width)); width = maxSize; } } 
              else { if (height > maxSize) { width = Math.round(width * (maxSize / height)); height = maxSize; } }
              const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
              const ctx = canvas.getContext('2d'); if (!ctx) return reject('No canvas context');
              ctx.drawImage(img, 0, 0, width, height); resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.onerror = reject; img.src = event.target?.result as string;
          };
          reader.onerror = reject; reader.readAsDataURL(file);
        }).then(resizedDataUrl => { handleMediaSelected([{ dataUrl: resizedDataUrl, file }]);
        }).catch(err => { console.error("Image resize failed", err); const reader = new FileReader(); reader.onload = () => handleMediaSelected([{ dataUrl: reader.result as string, file }]); reader.readAsDataURL(file); });
      } else {
        const reader = new FileReader();
        reader.onload = () => { handleMediaSelected([{ dataUrl: reader.result as string, file }]); };
        reader.readAsDataURL(file);
      }
    }
    if (e.target) e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) { alert(`Please fix the following issues:\n- ${validationErrors.join('\n- ')}`); return; }
    const finalVariants: MediaVariant[] = variants.map(v => ({ name: v.name, color: v.color, mediaUrl: v.mediaUrl, mediaType: v.file?.type.startsWith('video') ? 'video' : 'image' }));
    let finalSizeGuide: SizeGuide | undefined = undefined;
    if (sizes.length > 0 && selectedHeaders.length > 0) {
      finalSizeGuide = { headers: selectedHeaders, measurements: {} };
      sizes.forEach(size => { finalSizeGuide!.measurements[size] = selectedHeaders.map(header => measurements[size]?.[header] || ''); });
    }
    const finalPacks: ProductPack[] | undefined = isWholesale ? packs.map((pack, index) => {
      const contents: { [size: string]: number } = {}; let totalQuantity = 0;
      Object.entries(pack.contents).forEach(([size, qtyStr]) => { const qty = parseInt(qtyStr) || 0; if (qty > 0) { contents[size] = qty; totalQuantity += qty; } });
      return { id: `pack-new-${Date.now()}-${index}`, name: pack.name, price: parseFloat(pack.price), contents, totalQuantity };
    }) : undefined;
    const productData: Omit<Product, 'id' | 'creator'> = {
      name, price: parseFloat(price) || 0, originalPrice: parseFloat(originalPrice) || undefined, description,
      fabric: { name: fabricName || "Not specified", description: fabricDescription || "A high-quality fabric.", closeUpImageUrl: fabricCloseUpImage ?? undefined, movementVideoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
      variants: finalVariants, sizes: sizes, sizeGuide: finalSizeGuide, category: category || undefined, tags: tags.length > 0 ? tags : undefined, isWholesale, packs: finalPacks, isFeatured: isEditing ? productToEdit.isFeatured : false
    };
    if (isEditing) { onUpdate?.({ ...productData, id: productToEdit.id, creator: productToEdit.creator }); } else { onSave(productData); }
  };

  const stepTitles = [t('step1Of3'), t('step2Of3'), t('step3Of3')];

  // --- Render Functions for Steps ---
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
        <label htmlFor="isWholesaleToggle" className="text-sm font-medium text-gray-300">{t('wholesale')}</label>
        <button type="button" role="switch" aria-checked={isWholesale} onClick={() => setIsWholesale(!isWholesale)} id="isWholesaleToggle" className={`${isWholesale ? 'bg-blue-600' : 'bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}>
          <span className={`${isWholesale ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
        </button>
      </div>
      <div>
        <label htmlFor="productName" className="block text-sm font-medium text-gray-400 mb-1">{t('productName')}</label>
        <input type="text" id="productName" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" required/>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">{t('description')}</label>
        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
      </div>
      <div className="pt-4 border-t border-gray-800">
        <h3 className="text-lg font-semibold mb-2">{t('fabricDetails')}</h3>
        <div>
            <label htmlFor="fabricName" className="block text-sm font-medium text-gray-400 mb-1">{t('fabricName')}</label>
            <input type="text" id="fabricName" value={fabricName} onChange={e => setFabricName(e.target.value)} placeholder={t('fabricNamePlaceholder')} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div className="mt-2">
            <label htmlFor="fabricDescription" className="block text-sm font-medium text-gray-400 mb-1">{t('fabricDescription')}</label>
            <textarea id="fabricDescription" value={fabricDescription} onChange={e => setFabricDescription(e.target.value)} rows={2} placeholder={t('fabricDescriptionPlaceholder')} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
        </div>
        <div className="mt-2">
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('fabricCloseUpImage')}</label>
            <button type="button" onClick={() => handleUploadClick('fabric')} className="w-full h-24 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-700 hover:border-gray-600">
            {fabricCloseUpImage ? <img src={fabricCloseUpImage} className="w-full h-full object-contain" alt="Fabric close-up"/> : <PlusIcon className="w-8 h-8 text-gray-500" />}
            </button>
        </div>
      </div>
      <div className="pt-4 border-t border-gray-800">
        <h3 className="text-lg font-semibold mb-2">{t('categorization')}</h3>
        <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-400 mb-1">{t('category')}</label>
            <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} placeholder={t('categoryPlaceholder')} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div className="mt-2">
            <label htmlFor="tags-input" className="block text-sm font-medium text-gray-400 mb-1">{t('tags')}</label>
            <div className="flex flex-wrap gap-2 mb-2 p-2 min-h-[44px] bg-gray-900 rounded-lg border border-gray-800">
                {tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-1.5 bg-gray-700 text-white text-sm font-medium rounded-full px-3 py-1 animate-fadeIn">
                    <span className="capitalize">{tag}</span>
                    <button type="button" onClick={() => handleRemoveTag(index)} className="text-gray-400 hover:text-white" aria-label={`Remove ${tag} tag`}>
                      <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input type="text" id="tags-input" value={currentTag} placeholder={t('tagsPlaceholder')} onChange={e => setCurrentTag(e.target.value)} onKeyDown={handleTagInputKeyDown} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <button type="button" onClick={handleAddTag} className="bg-gray-700 text-white font-semibold px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50" disabled={!currentTag.trim()}>{t('add')}</button>
            </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
       <div className="pt-4">
        <h3 className="text-lg font-semibold mb-2">{t('variants')}</h3>
        <div className="space-y-3">
            {variants.map((variant, index) => (
                <div key={index} className="p-3 bg-gray-900 rounded-lg space-y-2">
                    <div className="flex justify-between items-center"><p className="font-semibold text-sm">{t('variantN', { index: index + 1})}</p><button type="button" onClick={() => removeVariant(index)}><TrashIcon className="w-5 h-5 text-red-500"/></button></div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => handleUploadClick({ type: 'variant', index })} className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-dashed border-gray-700">
                            {variant.mediaUrl ? <img src={variant.mediaUrl} className="w-full h-full object-contain" alt={`Variant ${index+1}`}/> : <PlusIcon className="w-6 h-6 text-gray-500"/>}
                        </button>
                        <div className="flex-1 space-y-2">
                            <input type="text" placeholder={t('variantNamePlaceholder')} value={variant.name} onChange={e => handleVariantChange(index, 'name', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" required/>
                            <div className="flex items-center gap-2">
                                <label htmlFor={`color-${index}`} className="text-sm">{t('color')}:</label>
                                <input type="color" id={`color-${index}`} value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)} className="w-8 h-8 p-0 border-none rounded bg-gray-800" />
                                <div className="ml-auto flex gap-1">
                                    <button type="button" onClick={() => { setEditingVariantIndexForAI(index); setIsAISceneStudioOpen(true); }} className="p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/40" title={t('generateWithAI')}><PhotographIcon className="w-5 h-5" /></button>
                                    <button type="button" onClick={() => { setCameraForVariantIndex(index); setCameraMode('photo'); }} className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40" title="Take Photo"><PhotographIcon className="w-5 h-5" /></button>
                                    <button type="button" onClick={() => { setCameraForVariantIndex(index); setCameraMode('video'); }} className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40" title="Record Video"><CameraIcon className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <button type="button" onClick={handleAddVariant} className="mt-2 w-full flex items-center justify-center gap-2 text-sm py-2 px-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300"><PlusIcon className="w-5 h-5"/> {t('addVariant')}</button>
      </div>
      <div className="pt-4 border-t border-gray-800">
        <div className="flex justify-between items-center mb-2"><h3 className="block text-lg font-semibold">{t('sizesAndMeasurements')}</h3>
            {currentUser?.sizeGuideTemplates && currentUser.sizeGuideTemplates.length > 0 && (<button type="button" onClick={() => setShowTemplatePicker(true)} className="text-sm text-blue-400 font-semibold flex items-center gap-1"><RulerIcon className="w-4 h-4" />{t('loadFromTemplate')}</button>)}
        </div>
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">{t('availableSizes')}</label>
            <div className="flex flex-wrap gap-2 mb-2 p-2 min-h-[44px] bg-gray-900 rounded-lg border border-gray-800">
              {sizes.map((size, index) => (<div key={index} className="flex items-center gap-1.5 bg-gray-700 text-white text-sm font-medium rounded-full px-3 py-1 animate-fadeIn"><span>{size}</span><button type="button" onClick={() => handleRemoveSize(index)} className="text-gray-400 hover:text-white" aria-label={`Remove ${size} size`}><CloseIcon className="w-3.5 h-3.5" /></button></div>))}
            </div>
            <div className="flex gap-2">
                <input type="text" id="sizes-input" value={currentSize} placeholder={t('sizeInputPlaceholder')} onChange={e => setCurrentSize(e.target.value)} onKeyDown={handleSizeInputKeyDown} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <button type="button" onClick={handleAddSize} className="bg-gray-700 text-white font-semibold px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!currentSize.trim()}>{t('add')}</button>
            </div>
        </div>
        {sizes.length > 0 && (
            <div className="mt-4 animate-fadeIn">
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('measurementHeadings')}</label>
                <div className="flex flex-wrap gap-2 mb-4">
                    {PREDEFINED_HEADERS.map(header => (<button type="button" key={header} onClick={() => handleToggleHeader(header)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedHeaders.includes(header) ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-600 text-gray-300'}`}>{selectedHeaders.includes(header) ? '✓ ' : ''}{header}</button>))}
                </div>
                {selectedHeaders.length > 0 && (
                    <div className="space-y-2 overflow-x-auto">
                        <h4 className="text-sm font-medium text-gray-400">{t('enterMeasurements')}</h4>
                        <div className="grid gap-2 text-xs text-center font-bold text-gray-500 px-1" style={{gridTemplateColumns: `minmax(60px, 1fr) repeat(${selectedHeaders.length}, minmax(80px, 1fr))`}}>
                            <span>{t('size')}</span>{selectedHeaders.map(h => <span key={h}>{h}</span>)}
                        </div>
                        {sizes.map(size => (
                            <div key={size} className="grid gap-2 items-center animate-fadeIn" style={{gridTemplateColumns: `minmax(60px, 1fr) repeat(${selectedHeaders.length}, minmax(80px, 1fr))`}}>
                                <span className="text-sm font-semibold text-center bg-gray-800/50 py-1.5 rounded-md">{size}</span>
                                {selectedHeaders.map(header => (<input key={header} type="text" placeholder="-" value={measurements[size]?.[header] || ''} onChange={(e) => handleMeasurementChange(size, header, e.target.value)} className="w-full text-xs text-center bg-gray-800 border border-gray-700 rounded-md px-1 py-1.5" />))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      {isWholesale ? (
        <div className="pt-4 animate-fadeIn">
            <h3 className="text-lg font-semibold mb-2">{t('definePacks')}</h3>
            <div className="space-y-3">
                {packs.map((pack, index) => (
                    <div key={index} className="p-3 bg-gray-900 rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-2">
                                <input type="text" placeholder={t('packName')} value={pack.name} onChange={e => handlePackChange(index, 'name', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" required/>
                                <input type="number" placeholder={t('packPrice')} value={pack.price} onChange={e => handlePackChange(index, 'price', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" required/>
                            </div>
                            <div className="flex flex-col items-end ml-2 gap-2">
                                <button type="button" onClick={() => removePack(index)} className="p-1"><TrashIcon className="w-5 h-5 text-red-500"/></button>
                                {currentUser?.packTemplates && currentUser.packTemplates.length > 0 && (<button type="button" onClick={() => { setPackTemplateTargetIndex(index); setShowPackTemplatePicker(true); }} className="text-xs text-blue-400 font-semibold p-1">{t('loadFromTemplate')}</button>)}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block">Adetler</label>
                            {sizes.length > 0 ? (
                              <div className="grid grid-cols-4 gap-2">
                                {sizes.map(size => (<div key={size}><label htmlFor={`pack-${index}-size-${size}`} className="text-xs text-center block mb-1">{size}</label><input id={`pack-${index}-size-${size}`} type="number" min="0" value={pack.contents[size] || ''} onChange={e => handlePackContentChange(index, size, e.target.value)} className="w-full text-center bg-gray-800 border border-gray-700 rounded-md px-1 py-1.5"/></div>))}
                              </div>
                            ) : <p className="text-xs text-center text-gray-500">{t('addSizesToDefineContents')}</p>}
                        </div>
                    </div>
                ))}
            </div>
              <button type="button" onClick={handleAddPack} className="mt-2 w-full flex items-center justify-center gap-2 text-sm py-2 px-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300"><PlusIcon className="w-5 h-5"/> {t('addPack')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 animate-fadeIn">
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-400 mb-1">{t('price')}</label>
                <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" required={!isWholesale}/>
            </div>
            <div>
                <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-400 mb-1">{t('originalPrice')}</label>
                <input type="number" id="originalPrice" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"/>
            </div>
        </div>
      )}
    </div>
  );
  
  return (
    <>
      <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col animate-fadeIn">
        <div className="w-full h-full max-w-md mx-auto flex flex-col bg-black">
           <header className="p-4 flex justify-between items-center bg-[#121212] flex-shrink-0">
            <h2 className="text-xl font-bold">{isEditing ? t('editProduct') : t('addNewProduct')}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6" /></button>
          </header>

          <div className="p-4 flex-shrink-0">
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-1">{stepTitles[step - 1]}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
              <div className="flex-grow overflow-y-auto px-4 pb-4">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
              </div>
              <footer className="p-4 bg-[#121212] flex-shrink-0 flex items-center gap-2">
                {step > 1 && <button type="button" onClick={handleBack} className="flex-1 bg-gray-700 font-bold py-3 rounded-lg">{t('back')}</button>}
                {step < 3 && <button type="button" onClick={handleNext} disabled={step === 1 ? !isStep1Valid : !isStep2Valid} className="flex-1 bg-blue-600 font-bold py-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">{t('next')}</button>}
                {step === 3 && <button type="submit" disabled={!isFormValid} className="flex-1 bg-blue-600 font-bold py-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">{isEditing ? t('saveChanges') : t('saveProduct')}</button>}
              </footer>
          </form>
        </div>
      </div>

      {isAISceneStudioOpen && <AISceneStudio onSave={handleAIImageGenerated} onClose={() => { setIsAISceneStudioOpen(false); setEditingVariantIndexForAI(null); }} />}
      {showTemplatePicker && (
         <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowTemplatePicker(false)}>
            <div className="bg-[#121212] rounded-lg p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-3">{t('selectSizeGuideTemplate')}</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {currentUser?.sizeGuideTemplates?.map(template => (<button key={template.id} onClick={() => handleTemplateSelect(template)} className="w-full text-left p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">{template.name}</button>))}
                </div>
            </div>
         </div>
      )}
      {showPackTemplatePicker && (
         <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowPackTemplatePicker(false)}>
            <div className="bg-[#121212] rounded-lg p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-3">{t('selectPackTemplate')}</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {currentUser?.packTemplates?.map(template => (<button key={template.id} onClick={() => handlePackTemplateSelect(template)} className="w-full text-left p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">{template.name}</button>))}
                </div>
            </div>
         </div>
      )}
      {cameraForVariantIndex !== null && cameraMode && (
        <VideoRecorder
            initialMode={cameraMode}
            onClose={() => { setCameraForVariantIndex(null); setCameraMode(null); }}
            onSave={(mediaDataUrl, mediaBlob, mediaType) => {
                if (cameraForVariantIndex !== null) {
                    const fileType = mediaType === 'video' ? 'video/webm' : 'image/jpeg';
                    const fileName = `capture-${Date.now()}.${mediaType === 'video' ? 'webm' : 'jpg'}`;
                    const file = new File([mediaBlob], fileName, { type: fileType });

                    handleVariantChange(cameraForVariantIndex, 'mediaUrl', mediaDataUrl);
                    handleVariantChange(cameraForVariantIndex, 'file', file);
                }
                setCameraForVariantIndex(null);
                setCameraMode(null);
            }}
        />
      )}
      <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
          input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
          input[type="color"]::-webkit-color-swatch { border: none; border-radius: 4px; }
        `}</style>
    </>
  );
};
