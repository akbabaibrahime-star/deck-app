import React from 'react';
import type { CartItem, Product, User, Chat, PreOrderPayload, PreOrderItem } from '../types';
import { PlusIcon, MinusIcon, TrashIcon, ShareIcon, PaperAirplaneIcon, ShoppingBagIcon, ShieldCheckIcon } from './Icons';
import { useTranslation } from '../App';

interface BasketViewProps {
  cart: CartItem[];
  products: Product[];
  currentUser: User | null;
  allUsers: User[];
  allChats: Chat[];
  updateCartItemQuantity: (productId: string, variantName: string, newQuantity: number, size?: string, packId?: string) => void;
  onSendPreOrder?: (creator: User, payload: PreOrderPayload) => void;
  onCheckout?: (creator: User, items: CartItem[]) => void;
  onNavigateToProduct?: (productId: string, variantName: string) => void;
}

export const BasketView: React.FC<BasketViewProps> = ({ cart, products, currentUser, allUsers, allChats, updateCartItemQuantity, onSendPreOrder, onCheckout, onNavigateToProduct }) => {
  const { t } = useTranslation();
  const getProductDetails = (productId: string) => products.find(p => p.id === productId);

  // This function is kept for the share cart functionality
  const generatePreOrderTextForSharing = (creator: User, items: CartItem[], salespersonName: string) => {
    const now = new Date();
    const subtotal = items.reduce((total, item) => {
        const product = getProductDetails(item.productId);
        if (!product) return total;
        if (item.specialPrice !== undefined) {
            return total + item.specialPrice * item.quantity;
        }
        if (item.packId && product.packs) {
          const pack = product.packs.find(p => p.id === item.packId);
          return total + (pack ? pack.price * item.quantity : 0);
        }
        return total + product.price * item.quantity;
    }, 0);
    const totalQuantity = items.reduce((total, item) => {
      const product = getProductDetails(item.productId);
      if (!product) return total;
      if (item.packId && product.packs) {
          const pack = product.packs.find(p => p.id === item.packId);
          return total + (pack ? pack.totalQuantity * item.quantity : 0);
      }
      return total + item.quantity;
    }, 0);

    let text = `--- ${t('preOrderForm')} ---\n`;
    text += `${t('brand')}: ${creator.username}\n`;
    text += `${t('date')}: ${now.toLocaleDateString()}\n`;
    text += `${t('time')}: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n`;
    text += `${t('salesperson')}: ${salespersonName}\n`;
    
    const colWidths = { model: 10, sizeColor: 16, qty: 4, price: 9, total: 10 };
    const totalWidth = Object.values(colWidths).reduce((a, b) => a + b, 0) + 4;
    text += '-'.repeat(totalWidth) + '\n';
    text += t('modelCode').padEnd(colWidths.model) + '  ' + t('sizeColor').padEnd(colWidths.sizeColor) + '  ' + t('quantityShort').padStart(colWidths.qty) + '  ' + t('unitPriceShort').padStart(colWidths.price) + '  ' + t('total').padStart(colWidths.total) + '\n';
    text += '-'.repeat(totalWidth) + '\n';

    items.forEach(item => {
        const product = getProductDetails(item.productId);
        if (product) {
            let price = item.specialPrice !== undefined ? item.specialPrice : product.price;
            if (item.packId && product.packs) {
                const pack = product.packs.find(p => p.id === item.packId);
                if (pack) {
                    price = pack.price;
                    const itemTotal = price * item.quantity;
                    const sizeColorStr = `${pack.name}/${item.variantName}`;
                    text += (product.id || '').substring(0, colWidths.model).padEnd(colWidths.model) + '  ' + sizeColorStr.substring(0, colWidths.sizeColor).padEnd(colWidths.sizeColor) + '  ' + item.quantity.toString().padStart(colWidths.qty) + '  ' + `$${price.toFixed(2)}`.padStart(colWidths.price) + '  ' + `$${itemTotal.toFixed(2)}`.padStart(colWidths.total) + '\n';
                    text += `  └ ${product.name}\n`;
                }
            } else {
                const itemTotal = price * item.quantity;
                const sizeColorStr = `${item.size || '-'}/${item.variantName}`;
                text += (product.id || '').substring(0, colWidths.model).padEnd(colWidths.model) + '  ' + sizeColorStr.substring(0, colWidths.sizeColor).padEnd(colWidths.sizeColor) + '  ' + item.quantity.toString().padStart(colWidths.qty) + '  ' + `$${price.toFixed(2)}`.padStart(colWidths.price) + '  ' + `$${itemTotal.toFixed(2)}`.padStart(colWidths.total) + '\n';
                text += `  └ ${product.name}\n`;
            }
        }
    });

    text += '-'.repeat(totalWidth) + '\n';
    const totalLabelWidth = totalWidth - colWidths.total;
    // FIX: Replaced corrupted text with `totalLabelWidth` and aligned total quantity value.
    text += `${t('totalQuantity')}:`.padEnd(totalLabelWidth) + totalQuantity.toString().padStart(colWidths.total) + '\n';
    text += `${t('grandTotalWithAmount', { amount: `$${subtotal.toFixed(2)}` })}`.padStart(totalWidth) + '\n';

    return text;
  };

  const groupedCart = cart.reduce((acc, item) => {
    const product = getProductDetails(item.productId);
    if (!product) return acc;
    const creatorId = product.creator.id;
    if (!acc[creatorId]) {
      acc[creatorId] = [];
    }
    acc[creatorId].push(item);
    return acc;
  }, {} as { [creatorId: string]: CartItem[] });

  if (cart.length === 0) {
    return (
      <div className="bg-black text-white h-screen flex flex-col items-center justify-center p-8 text-center pb-20">
        <ShoppingBagIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h1 className="text-2xl font-bold">{t('yourBasketIsEmpty')}</h1>
        <p className="text-gray-400 mt-2">{t('looksLikeYouHaventAddedAnythingYet')}</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white h-screen overflow-y-auto pb-20">
      <header className="p-4 bg-[#121212] border-b border-gray-800 text-center sticky top-0 z-20">
        <h1 className="text-xl font-bold">{t('myBasket')}</h1>
      </header>

      <div className="p-4 space-y-6">
        {Object.entries(groupedCart).map(([creatorId, items]) => {
          const creator = allUsers.find(u => u.id === creatorId);
          if (!creator) return null;
          
          const paymentsEnabled = !!creator.paymentProviderId;

          const subtotal = items.reduce((total, item) => {
            if (item.specialPrice !== undefined) {
                return total + item.specialPrice * item.quantity;
            }
            const product = getProductDetails(item.productId);
            if (!product) return total;
            if (item.packId && product.packs) {
                const pack = product.packs.find(p => p.id === item.packId);
                return total + (pack ? pack.price * item.quantity : 0);
            }
            return total + product.price * item.quantity;
          }, 0);

          const handleSendOrder = () => {
              if (!currentUser || !onSendPreOrder) return;
              
              const preOrderItems: PreOrderItem[] = items.map(item => {
                  const product = getProductDetails(item.productId)!;
                  const variant = product.variants.find(v => v.name === item.variantName)!;
                  let price = item.specialPrice !== undefined ? item.specialPrice : product.price;
                  let packName: string | undefined = undefined;

                  if (item.packId && product.packs) {
                      const pack = product.packs.find(p => p.id === item.packId);
                      if (pack) {
                          price = pack.price;
                          packName = pack.name;
                      }
                  }

                  return {
                      productId: item.productId,
                      variantName: item.variantName,
                      size: item.size,
                      packId: item.packId,
                      packName: packName,
                      quantity: item.quantity,
                      price: price,
                      name: product.name,
                      imageUrl: variant.mediaUrl
                  };
              });

              const payload: PreOrderPayload = {
                  items: preOrderItems,
                  subtotal: subtotal,
                  salespersonId: currentUser.id,
                  salespersonName: currentUser.username,
              };
              
              onSendPreOrder(creator, payload);
          };
          
          const handleCheckout = () => {
              if (!onCheckout) return;
              onCheckout(creator, items);
          };

          return (
            <div key={creatorId} className="bg-gray-900 rounded-lg p-4 space-y-3">
              <h2 className="font-semibold">{t('fromCreator', { creator: creator.username })}</h2>
              {items.map((item, index) => {
                const product = getProductDetails(item.productId);
                if (!product) return null;
                const variant = product.variants.find(v => v.name === item.variantName);
                
                let price = item.specialPrice !== undefined ? item.specialPrice : product.price;
                let name = product.name;
                let subtitle = `${item.variantName}${item.size ? `, ${item.size}` : ''}`;
                
                if (item.packId && product.packs) {
                    const pack = product.packs.find(p => p.id === item.packId);
                    if (pack) {
                        price = pack.price;
                        name = pack.name;
                        subtitle = Object.entries(pack.contents).map(([size, qty]) => `${qty}${size}`).join(', ');
                    }
                }
                const totalPrice = price * item.quantity;

                return (
                  <div key={index} className="flex items-center gap-3">
                    <button disabled={!onNavigateToProduct} onClick={() => onNavigateToProduct?.(product.id, item.variantName)} className="flex-shrink-0">
                        <img src={variant?.mediaUrl} alt={name} className="w-16 h-20 object-contain bg-black rounded-md" />
                    </button>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold truncate">{name}</p>
                      <p className="text-xs text-gray-400 truncate">{subtitle}</p>
                      <p className="font-semibold text-sm mt-1">
                        {item.specialPrice !== undefined ? (
                            <span className="flex items-baseline gap-2">
                                <span className="text-red-400">${item.specialPrice.toFixed(2)}</span>
                                <span className="text-gray-500 line-through text-xs">${product.price.toFixed(2)}</span>
                            </span>
                        ) : (
                            `$${price.toFixed(2)}`
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                         <p className="font-bold text-base">${totalPrice.toFixed(2)}</p>
                        <div className="flex items-center gap-2 bg-gray-800 rounded-full p-0.5">
                            <button onClick={() => updateCartItemQuantity(item.productId, item.variantName, item.quantity - 1, item.size, item.packId)} className="p-1.5">
                                {item.quantity === 1 ? <TrashIcon className="w-4 h-4 text-red-500" /> : <MinusIcon className="w-4 h-4" />}
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateCartItemQuantity(item.productId, item.variantName, item.quantity + 1, item.size, item.packId)} className="p-1.5">
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                  </div>
                );
              })}
              <div className="border-t border-gray-700 pt-3 mt-3 space-y-3">
                <div className="flex justify-between font-semibold">
                  <span>{t('subtotal')}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                    {onSendPreOrder && (
                        <button 
                            onClick={handleSendOrder} 
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                            <span>{t('sendPreOrderToSeller')}</span>
                        </button>
                    )}
                     <div className="relative group" title={!paymentsEnabled ? t('sellerNotAcceptingPayments') : ''}>
                        <button 
                            onClick={handleCheckout}
                            disabled={!paymentsEnabled}
                            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-700 disabled:cursor-not-allowed"
                        >
                            <ShieldCheckIcon className="w-5 h-5" />
                            <span>{t('secureCheckout')}</span>
                        </button>
                    </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};