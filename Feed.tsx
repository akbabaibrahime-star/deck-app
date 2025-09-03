import React, { useEffect, useState, useRef } from 'react';
import type { Product, User, UserSummary } from '../types';
import { ProductCard } from './ProductCard';

interface FeedProps {
  products: Product[];
  allProducts: Product[]; // For Shop The Look
  likedProductIds: Set<string>;
  savedProductIds: Set<string>;
  onLikeToggle: (productId: string) => void;
  onSaveToggle: (productId: string) => void;
  onAddToCart: (productId: string, variantName: string, size?: string, packId?: string, specialPrice?: number) => void;
  onFilterByCreator: (creator: UserSummary) => void;
  onNavigateToFullProfile: (creator: UserSummary) => void;
  onNavigateToChat: (creator: UserSummary, product: Product) => void;
  onShare: (product: Product) => void;
  onOpenFitFinder: (product: Product) => void;
  onShopTheLookItemClick: (product: Product) => void;
  currentUser: User | null;
  onFollowToggle: (targetUserId: string) => void;
  productToShow?: { productId: string; variantName: string } | null;
  onProductShown: () => void;
  onActiveProductChange: (productId: string) => void;
  initialProductId: string | null;
}

export const Feed: React.FC<FeedProps> = (props) => {
  const { productToShow, onProductShown, currentUser, onFollowToggle, onActiveProductChange, initialProductId } = props;
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // SAHTE VERİLER YERİNE SUNUCUDAN VERİ ÇEKMEK İÇİN YENİ DURUM (STATE)
  const [feedProducts, setFeedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // BU BÖLÜM, BİLEŞEN EKRANA GELDİĞİNDE SUNUCUDAN VERİLERİ ÇEKER
  useEffect(() => {
    // server.js'de oluşturduğumuz adrese istek yapıyoruz.
    fetch('/api/products')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: Product[]) => {
        // Gelen verilerle bileşenin durumunu güncelliyoruz.
        setFeedProducts(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
        // Hata durumunda, prop'lardan gelen orijinal ürünleri kullanabiliriz.
        setFeedProducts(props.products);
        setIsLoading(false);
      });
  }, [props.products]); // props.products değişirse, bu etki yeniden çalışır.


  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
          const productId = (entry.target as HTMLElement).dataset.productId;
          if (productId) {
            setActiveProductId(productId);
            onActiveProductChange(productId);
          }
        }
      });
    };

    observer.current = new IntersectionObserver(handleIntersect, { threshold: 0.75 });
    
    if (!productToShow && feedProducts.length > 0) {
      const initialId = initialProductId || feedProducts[0].id;
      setActiveProductId(initialId);
      if (initialId) onActiveProductChange(initialId);
    }

    const currentObserver = observer.current;
    return () => currentObserver?.disconnect();
  }, [onActiveProductChange, feedProducts, initialProductId, productToShow]);

  useEffect(() => {
    if (productToShow) {
      onProductShown();
      const element = document.querySelector(`[data-product-id="${productToShow.productId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'instant' });
      }
    } else if (initialProductId) {
       const element = document.querySelector(`[data-product-id="${initialProductId}"]`);
       if (element) {
         element.scrollIntoView({ behavior: 'instant' });
       }
    }
  }, [productToShow, onProductShown, initialProductId]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory">
      {feedProducts.map(product => {
        let initialVariantIndex: number | undefined;
        if (productToShow && product.id === productToShow.productId) {
          const foundIndex = product.variants.findIndex(v => v.name === productToShow.variantName);
          initialVariantIndex = foundIndex !== -1 ? foundIndex : 0;
        }

        return (
          <ProductCard
            key={product.id}
            product={product}
            allProducts={props.allProducts}
            isLiked={props.likedProductIds.has(product.id)}
            isSaved={props.savedProductIds.has(product.id)}
            onLikeToggle={props.onLikeToggle}
            onSaveToggle={props.onSaveToggle}
            onAddToCart={props.onAddToCart}
            onFilterByCreator={props.onFilterByCreator}
            onNavigateToFullProfile={props.onNavigateToFullProfile}
            onNavigateToChat={props.onNavigateToChat}
            onShare={props.onShare}
            onOpenFitFinder={props.onOpenFitFinder}
            onShopTheLookItemClick={props.onShopTheLookItemClick}
            currentUser={currentUser}
            onFollowToggle={onFollowToggle}
            initialVariantIndex={initialVariantIndex}
            isActive={activeProductId === product.id}
            observer={observer.current}
          />
        );
      })}
    </div>
  );
};
