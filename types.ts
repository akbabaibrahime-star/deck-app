export interface MediaVariant {
  color: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  name: string;
}

export interface SizeGuide {
  headers: string[]; // e.g. ["Göğüs", "Bel", "Kol Boyu"]
  measurements: {
    [size: string]: string[];
  };
}

export interface SizeGuideTemplate {
  id: string;
  name: string;
  sizeGuide: SizeGuide;
}

export interface ProductPack {
  id:string;
  name: string;
  contents: { [size: string]: number };
  totalQuantity: number;
  price: number;
}

export interface ProductPackTemplate {
  id: string;
  name: string;
  contents: { [size: string]: number };
}

export interface Product {
  id: string;
  name:string;
  price: number;
  originalPrice?: number;
  description: string;
  fabric: {
    name: string;
    description: string;
    closeUpImageUrl?: string;
    movementVideoUrl?: string;
  };
  variants: MediaVariant[];
  creator: UserSummary;
  sizes?: string[];
  sizeGuide?: SizeGuide;
  shopTheLookProductIds?: string[];
  category?: string;
  tags?: string[];
  isFeatured?: boolean;
  isWholesale?: boolean;
  packs?: ProductPack[];
  viewCount?: number;
  salesCount?: number;
  createdAt?: Date;
}

export interface UserSummary {
  id: string;
  username: string;
  avatarUrl: string;
}

export interface Deck {
  id: string;
  name: string;
  mediaUrls: string[];
  productCount: number;
  productIds: string[];
}

export interface User extends UserSummary {
  bio: string;
  decks: Deck[];
  contact: {
    email: string;
    phone: string;
  };
  address: {
    googleMapsUrl: string;
  };
  password?: string;
  followingIds: string[];
  followerIds: string[];
  originalAvatarUrl?: string;
  sizeGuideTemplates?: SizeGuideTemplate[];
  packTemplates?: ProductPackTemplate[];
  role: 'brand_owner' | 'sales_rep' | 'customer';
  companyId?: string;
  teamMemberIds?: string[];
  language?: 'tr' | 'ru' | 'en' | 'de';
  commissionRate?: number; // Commission percentage, e.g., 15 for 15%
  paymentProviderId?: string;
  voiceMessagesEnabled?: boolean;
}

export interface CartItem {
  productId: string;
  variantName: string;
  quantity: number;
  size?: string;
  packId?: string;
  specialPrice?: number;
}

export interface PreOrderItem {
    productId: string;
    variantName: string;
    size?: string;
    packId?: string;
    packName?: string;
    quantity: number;
    price: number;
    name: string;
    imageUrl: string;
}

export interface PreOrderPayload {
    items: PreOrderItem[];
    subtotal: number;
    salespersonId: string;
    salespersonName: string;
}

export interface ChatMessage {
  id: string;
  text: string; // Fallback text
  senderId: string;
  timestamp: string;
  type?: 'text' | 'pre-order' | 'audio';
  payload?: PreOrderPayload | { audioUrl: string; duration: number };
}

export interface Chat {
  id: string;
  participantIds: [string, string];
  messages: ChatMessage[];
  productId?: string; // Each chat can be about a specific product
}

export interface AiChatMessage {
    role: 'user' | 'model';
    text: string;
    isLoading?: boolean;
}

export interface VideoScene {
  imageUrl: string;
  duration: number; // in milliseconds
  textOverlay: string;
  animationStyle: string;
}

export interface Notification {
  id: string;
  fromUser: UserSummary;
  message: string;
  link: { type: 'product' | 'deck'; id: string; variantName?: string };
  timestamp: Date;
  read: boolean;
}

export interface SaleRecordItem {
    productId: string;
    productName: string;
    variantName: string;
    size?: string;
    packName?: string;
    quantity: number; // Number of items or packs
    pricePerUnit: number; // Price per item or per pack
}

export interface SaleRecord {
    id: string;
    salespersonId: string;
    brandOwnerId: string;
    items: SaleRecordItem[];
    totalAmount: number;
    commissionAmount: number;
    timestamp: Date;
}

export interface LiveComment {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  text: string;
  timestamp: string; // ISO string
  type: 'comment' | 'like' | 'join';
}

export interface LiveStream {
  id: string;
  hostId: string;
  title: string;
  status: 'upcoming' | 'live' | 'ended';
  scheduledAt?: string; // ISO string
  startedAt?: string; // ISO string
  endedAt?: string; // ISO string
  thumbnailUrl: string;
  productShowcaseIds: string[];
  viewerCount: number;
  likesCount: number;
  comments: LiveComment[];
  playbackUrl?: string; // For ended streams
  isHostControlled?: boolean;
  hostPinnedProductIndex?: number | null;
  activeDiscount?: {
    productId: string;
    discountPercentage: number;
    expiresAt: string; // ISO string
  };
}