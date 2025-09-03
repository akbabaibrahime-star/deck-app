import React, { useState } from 'react';
import type { User, SizeGuideTemplate, ProductPackTemplate, SaleRecord, Product } from '../types';
import { RulerIcon, PlusIcon, AspectRatioIcon, CurrencyDollarIcon, ChevronDownIcon, LanguageIcon, ShieldCheckIcon, ChatBubbleIcon } from './Icons';
import { useTranslation } from '../App';
import { BrandOwnerSalesReportView, SalesRepSalesReportView } from './SalesReportView';

interface SettingsCardProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  startOpen?: boolean;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, icon: Icon, children, startOpen = false }) => {
  const [isOpen, setIsOpen] = useState(startOpen);

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left p-4 hover:bg-white/5 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4">
            <Icon className="w-6 h-6 text-gray-400 flex-shrink-0" />
            <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
            <div className="p-4 border-t border-white/10">
            {children}
            </div>
        </div>
      </div>
    </div>
  );
};


interface SettingsViewProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onCreateSizeGuideTemplate: () => void;
  onEditSizeGuideTemplate: (template: SizeGuideTemplate) => void;
  onDeleteSizeGuideTemplate: (templateId: string) => void;
  onCreatePackTemplate: () => void;
  onEditPackTemplate: (template: ProductPackTemplate) => void;
  onDeletePackTemplate: (templateId: string) => void;
  onShowChangePasswordModal: () => void;
  allSales: SaleRecord[];
  allUsers: User[];
  myProducts: Product[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
    user,
    onUpdateUser,
    onCreateSizeGuideTemplate,
    onEditSizeGuideTemplate,
    onDeleteSizeGuideTemplate,
    onCreatePackTemplate,
    onEditPackTemplate,
    onDeletePackTemplate,
    onShowChangePasswordModal,
    allSales,
    allUsers,
    myProducts
}) => {
    const { t, language, setLanguage } = useTranslation();
    const isSeller = user.role === 'brand_owner' || user.role === 'sales_rep';
    const [paymentId, setPaymentId] = useState(user.paymentProviderId || '');

    const handleSavePaymentInfo = () => {
        onUpdateUser({ ...user, paymentProviderId: paymentId });
    };

    const handleVoiceMessageToggle = () => {
        onUpdateUser({ ...user, voiceMessagesEnabled: !user.voiceMessagesEnabled });
    };

    return (
        <div className="bg-black text-white h-screen overflow-y-auto pt-16 pb-20">
            <div className="px-4">
                <h1 className="text-3xl font-bold font-serif">{t('settings')}</h1>
            </div>
            
            <div className="p-4 space-y-4">
                <SettingsCard title={t('language')} icon={LanguageIcon}>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setLanguage('tr')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${language === 'tr' ? 'bg-white text-black' : 'bg-gray-800'}`}>
                            {t('turkish')}
                        </button>
                        <button onClick={() => setLanguage('ru')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${language === 'ru' ? 'bg-white text-black' : 'bg-gray-800'}`}>
                            {t('russian')}
                        </button>
                        <button onClick={() => setLanguage('en')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${language === 'en' ? 'bg-white text-black' : 'bg-gray-800'}`}>
                            {t('english')}
                        </button>
                         <button onClick={() => setLanguage('de')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${language === 'de' ? 'bg-white text-black' : 'bg-gray-800'}`}>
                            {t('german')}
                        </button>
                    </div>
                </SettingsCard>

                <SettingsCard title={t('accountSecurity')} icon={ShieldCheckIcon}>
                    <button onClick={onShowChangePasswordModal} className="w-full text-left bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-colors">
                        <span className="font-semibold">{t('changePassword')}</span>
                    </button>
                </SettingsCard>

                {isSeller && (
                     <SettingsCard title={t('chatSettings')} icon={ChatBubbleIcon}>
                        <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg">
                            <label htmlFor="voiceMessageToggle" className="text-sm font-medium text-gray-300">{t('enableVoiceMessages')}</label>
                            <button type="button" role="switch" aria-checked={user.voiceMessagesEnabled} onClick={handleVoiceMessageToggle} id="voiceMessageToggle" className={`${user.voiceMessagesEnabled ? 'bg-blue-600' : 'bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}>
                            <span className={`${user.voiceMessagesEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
                            </button>
                        </div>
                    </SettingsCard>
                )}


                {user.role === 'brand_owner' && (
                    <SettingsCard title={t('paymentSettings')} icon={CurrencyDollarIcon}>
                        <div className="space-y-4">
                            {user.paymentProviderId ? (
                                <div className="p-3 bg-green-900/50 text-green-300 rounded-lg text-sm">
                                    <p className="font-bold">{t('paymentsActive')}</p>
                                    <p className="text-xs">{t('paymentsActiveDesc')}</p>
                                </div>
                            ) : (
                                <div className="p-3 bg-yellow-900/50 text-yellow-300 rounded-lg text-sm">
                                    <p className="font-bold">{t('paymentsInactive')}</p>
                                    <p className="text-xs">{t('paymentsInactiveDesc')}</p>
                                </div>
                            )}
                            <div>
                                <label htmlFor="paymentId" className="block text-sm font-medium text-gray-400 mb-1">{t('paymentProviderId')}</label>
                                <input
                                    type="text"
                                    id="paymentId"
                                    value={paymentId}
                                    onChange={(e) => setPaymentId(e.target.value)}
                                    placeholder={t('paymentProviderIdPlaceholder')}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                                />
                            </div>
                            <button onClick={handleSavePaymentInfo} className="w-full bg-blue-600 font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                {t('savePaymentInfo')}
                            </button>
                        </div>
                    </SettingsCard>
                )}

                {isSeller && (
                    <SettingsCard title={t('salesReport')} icon={CurrencyDollarIcon}>
                        {user.role === 'sales_rep' ? (
                            <SalesRepSalesReportView salespersonId={user.id} allSales={allSales} />
                        ) : (
                            <BrandOwnerSalesReportView ownerId={user.id} allSales={allSales} allUsers={allUsers} myProducts={myProducts} />
                        )}
                    </SettingsCard>
                )}

                {user.role === 'brand_owner' && (
                    <>
                        <SettingsCard title={t('sizeGuideTemplates')} icon={RulerIcon}>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-gray-400">Manage your sizing templates.</p>
                                <button onClick={onCreateSizeGuideTemplate} className="p-1.5 bg-gray-800 rounded-full hover:bg-gray-700">
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {user.sizeGuideTemplates && user.sizeGuideTemplates.length > 0 ? (
                                    user.sizeGuideTemplates.map(template => (
                                        <div key={template.id} className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <RulerIcon className="w-5 h-5 text-gray-400"/>
                                                <span className="font-semibold">{template.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => onEditSizeGuideTemplate(template)} className="text-sm text-blue-400 hover:text-blue-300">{t('edit')}</button>
                                                <button onClick={() => onDeleteSizeGuideTemplate(template.id)} className="text-sm text-red-400 hover:text-red-300">{t('delete')}</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">{t('noSizeGuideTemplates')}</p>
                                )}
                            </div>
                        </SettingsCard>

                        <SettingsCard title={t('packTemplates')} icon={AspectRatioIcon}>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-gray-400">Manage your wholesale pack templates.</p>
                                <button onClick={onCreatePackTemplate} className="p-1.5 bg-gray-800 rounded-full hover:bg-gray-700">
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {user.packTemplates && user.packTemplates.length > 0 ? (
                                    user.packTemplates.map(template => (
                                        <div key={template.id} className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <AspectRatioIcon className="w-5 h-5 text-gray-400"/>
                                                <span className="font-semibold">{template.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => onEditPackTemplate(template)} className="text-sm text-blue-400 hover:text-blue-300">{t('edit')}</button>
                                                <button onClick={() => onDeletePackTemplate(template.id)} className="text-sm text-red-400 hover:text-red-300">{t('delete')}</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">{t('noPackTemplates')}</p>
                                )}
                            </div>
                        </SettingsCard>
                    </>
                )}
            </div>
        </div>
    );
};