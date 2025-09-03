import type { User, Product, ChatMessage, Chat, SaleRecord, LiveStream, LiveComment } from '../types';

export const users: User[] = [
  {
    id: 'user1',
    username: 'AtelierAura',
    avatarUrl: 'https://picsum.photos/seed/user1/200',
    originalAvatarUrl: 'https://picsum.photos/seed/user1/800',
    bio: 'Timeless elegance, ethically crafted. Slow fashion from Paris.',
    language: 'de',
    decks: [
      { id: 'deck1', name: 'La Parisienne', mediaUrls: ['https://picsum.photos/seed/deck1/400', 'https://picsum.photos/seed/deck1-2/400'], productCount: 2, productIds: ['prod1', 'prod2'] },
      { id: 'deck2', name: 'Autumn Hues', mediaUrls: ['https://picsum.photos/seed/deck2/400'], productCount: 1, productIds: ['prod1'] },
    ],
    contact: { email: 'contact@atelieraura.com', phone: '555-0101' },
    address: { googleMapsUrl: 'https://www.google.com/maps/place/Rue+de+la+Paix,+Paris,+France' },
    password: 'password123',
    followingIds: ['user2', 'user4'],
    followerIds: ['user4'],
    role: 'brand_owner',
    teamMemberIds: ['user5'],
    paymentProviderId: 'acct_atelieraura_12345',
    voiceMessagesEnabled: true,
  },
  {
    id: 'user2',
    username: 'UrbanTread',
    avatarUrl: 'https://picsum.photos/seed/user2/200',
    originalAvatarUrl: 'https://picsum.photos/seed/user2/800',
    bio: 'High-performance streetwear. Engineered for the city.',
    language: 'en',
    decks: [
        { id: 'deck3', name: 'Techwear Essentials', mediaUrls: ['https://picsum.photos/seed/deck3/400', 'https://picsum.photos/seed/deck3-2/400'], productCount: 2, productIds: ['prod3', 'prod4'] },
    ],
    contact: { email: 'info@urbantread.io', phone: '555-0102' },
    address: { googleMapsUrl: 'https://www.google.com/maps/place/Shibuya+Crossing,+Shibuya+City,+Tokyo,+Japan' },
    password: 'password123',
    followingIds: [],
    followerIds: ['user1', 'user4'],
    role: 'brand_owner',
    voiceMessagesEnabled: false,
  },
  {
    id: 'user3',
    username: 'NomadLinen',
    avatarUrl: 'https://picsum.photos/seed/user3/200',
    originalAvatarUrl: 'https://picsum.photos/seed/user3/800',
    bio: 'Breathable, beautiful linen for the modern wanderer.',
    language: 'ru',
    decks: [
        { id: 'deck4', name: 'Coastal Living', mediaUrls: ['https://picsum.photos/seed/deck4/400'], productCount: 1, productIds: ['prod5'] },
    ],
    contact: { email: 'hello@nomadlinen.co', phone: '555-0103' },
    address: { googleMapsUrl: 'https://www.google.com/maps/place/Byron+Bay+NSW,+Australia' },
    password: 'password123',
    followingIds: [],
    followerIds: ['user4'],
    role: 'brand_owner',
    voiceMessagesEnabled: true,
  },
  {
    id: 'user4',
    username: 'Ibrahim Akbaba',
    avatarUrl: 'https://picsum.photos/seed/user4/200',
    originalAvatarUrl: 'https://picsum.photos/seed/user4/800',
    bio: 'Software engineer and fashion enthusiast. Welcome to my brand!',
    language: 'tr',
    decks: [],
    contact: { email: 'akbaba.ibrahime@gmail.com', phone: '555-0104' },
    address: { googleMapsUrl: 'https://www.google.com/maps/place/Kızılay+Square,+Kızılay,+06420+Çankaya/Ankara,+Turkey' },
    password: 'admin123',
    followingIds: ['user1', 'user2', 'user3'],
    followerIds: [],
    role: 'brand_owner',
    teamMemberIds: [],
    voiceMessagesEnabled: true,
    sizeGuideTemplates: [
      {
        id: 'sgt1',
        name: 'Standart T-Shirt Kalıbı',
        sizeGuide: {
          headers: ['Göğüs', 'Bel', 'Kol Boyu'],
          measurements: {
            'S': ['86-89', '66-69', '20'],
            'M': ['91-94', '71-74', '21'],
            'L': ['97-102', '76-80', '22'],
          }
        }
      },
      {
        id: 'sgt2',
        name: 'Unisex Hoodie Kalıbı',
        sizeGuide: {
            headers: ['Göğüs', 'Boy'],
            measurements: {
                'XS': ['100', '68'],
                'S': ['106', '70'],
                'M': ['112', '72'],
                'L': ['118', '74'],
                'XL': ['124', '76'],
            }
        }
      }
    ],
    packTemplates: [
      {
        id: 'ppt1',
        name: 'Standart Seri (4 Adet)',
        contents: { 'S': 1, 'M': 2, 'L': 1 }
      },
      {
        id: 'ppt2',
        name: 'Küçük Seri (3 Adet)',
        contents: { 'S': 1, 'M': 1, 'L': 1 }
      },
      {
        id: 'ppt3',
        name: 'Büyük Seri (4 Adet)',
        contents: { 'L': 2, 'XL': 2 }
      }
    ]
  },
  {
    id: 'user5',
    username: 'Sophie Dubois',
    avatarUrl: 'https://picsum.photos/seed/user5/200',
    originalAvatarUrl: 'https://picsum.photos/seed/user5/800',
    bio: 'Sales representative for AtelierAura. Passionate about helping you find the perfect piece.',
    language: 'de',
    decks: [],
    contact: { email: 'sophie@atelieraura.com', phone: '555-0105' },
    address: { googleMapsUrl: 'https://www.google.com/maps/place/Rue+de+la+Paix,+Paris,+France' },
    password: 'password123',
    followingIds: [],
    followerIds: [],
    role: 'sales_rep',
    companyId: 'user1',
    commissionRate: 10, // 10% commission
    voiceMessagesEnabled: true,
  },
  {
    id: 'user6',
    username: 'Alex Chen',
    avatarUrl: 'https://picsum.photos/seed/user6/200',
    originalAvatarUrl: 'https://picsum.photos/seed/user6/800',
    bio: 'Loves discovering new brands and unique styles.',
    language: 'en',
    decks: [],
    contact: { email: 'alex.chen@example.com', phone: '555-0106' },
    address: { googleMapsUrl: 'https://www.google.com/maps' },
    password: 'password123',
    followingIds: ['user1'],
    followerIds: [],
    role: 'customer',
  }
];

export const products: Product[] = [
  {
    id: 'prod1',
    name: 'The Marais Trench',
    price: 420.00,
    originalPrice: 480.00,
    isFeatured: true,
    description: 'A classic, double-breasted trench coat made from water-resistant cotton gabardine. Your perfect companion for unpredictable weather, offering both style and function.',
    fabric: {
        name: 'Cotton Gabardine',
        description: 'A tightly woven, durable, and water-resistant fabric invented by Thomas Burberry. It has a smooth finish and excellent drape.',
        closeUpImageUrl: 'https://picsum.photos/seed/fabric1/800',
        movementVideoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    },
    variants: [
        { name: 'Beige', color: '#C8A67B', mediaUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', mediaType: 'video'},
        { name: 'Navy', color: '#000080', mediaUrl: 'https://picsum.photos/seed/prod1-navy/1080/1920', mediaType: 'image'},
    ],
    creator: users[0],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    sizeGuide: {
        headers: ['Göğüs', 'Bel', 'Kalça'],
        measurements: {
            'XS': ['81-84', '61-64', '86-89'],
            'S': ['86-89', '66-69', '91-94'],
            'M': ['91-94', '71-74', '97-99'],
            'L': ['97-102', '76-80', '102-105'],
            'XL': ['104-109', '83-88', '109-114'],
        },
    },
    shopTheLookProductIds: ['prod2'],
    category: 'Giyim/Dış Giyim',
    tags: ['klasik', 'suya dayanıklı', 'pamuk'],
    viewCount: 1245,
    salesCount: 152,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
  },
  {
    id: 'prod2',
    name: 'Silk Charmeuse Blouse',
    price: 180.00,
    isFeatured: true,
    description: 'A fluid, lustrous silk blouse that drapes beautifully. Features a concealed placket and mother-of-pearl buttons for a touch of luxury.',
    fabric: {
        name: 'Silk Charmeuse',
        description: 'A lightweight fabric woven with a satin weave, where the front side is a lustrous satin finish, and the back has a dull, crepe finish.',
        closeUpImageUrl: 'https://picsum.photos/seed/fabric2/800',
        movementVideoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    },
    variants: [
        { name: 'Ivory', color: '#FFFFF0', mediaUrl: 'https://picsum.photos/seed/prod2-ivory/1080/1920', mediaType: 'image'},
        { name: 'Black', color: '#000000', mediaUrl: 'https://picsum.photos/seed/prod2-black/1080/1920', mediaType: 'image'},
    ],
    creator: users[0],
    sizes: ['XS', 'S', 'M', 'L'],
    sizeGuide: {
        headers: ['Göğüs', 'Bel', 'Kalça'],
        measurements: {
            'XS': ['81-84', '61-64', '86-89'],
            'S': ['86-89', '66-69', '91-94'],
            'M': ['91-94', '71-74', '97-99'],
            'L': ['97-102', '76-80', '102-105'],
        }
    },
    category: 'Giyim/Üst Giyim/Bluz',
    tags: ['ipek', 'lüks', 'düğmeli'],
    viewCount: 980,
    salesCount: 210,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
  },
  {
    id: 'prod3',
    name: 'X-7 Utility Pant',
    price: 250.00,
    isFeatured: true,
    description: 'A technical cargo pant with articulated knees, multiple zip-pockets, and a water-repellent finish. Built for movement and utility.',
     fabric: {
        name: 'Ripstop Nylon',
        description: 'A woven fabric, often made of nylon, using a special reinforcing technique that makes it resistant to tearing and ripping.',
        closeUpImageUrl: 'https://picsum.photos/seed/fabric3/800',
        movementVideoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    },
    variants: [
        { name: 'Graphite', color: '#36454F', mediaUrl: 'https://picsum.photos/seed/prod3-graphite/1080/1920', mediaType: 'image'},
        { name: 'Black', color: '#000000', mediaUrl: 'https://picsum.photos/seed/prod3-black/1080/1920', mediaType: 'image'},
    ],
    creator: users[1],
    sizes: ['S', 'M', 'L', 'XL'],
    isWholesale: true,
    packs: [
        {
            id: 'pack-prod3-1',
            name: 'Standart Seri',
            contents: { 'S': 1, 'M': 2, 'L': 1 },
            totalQuantity: 4,
            price: 800.00
        },
        {
            id: 'pack-prod3-2',
            name: 'Büyük Beden Seri',
            contents: { 'L': 2, 'XL': 2 },
            totalQuantity: 4,
            price: 880.00
        }
    ],
    sizeGuide: {
        headers: ['Göğüs', 'Bel', 'Kalça'],
        measurements: {
            'S': ['91-96', '76-81', '91-96'],
            'M': ['97-102', '82-87', '97-102'],
            'L': ['103-108', '88-93', '103-108'],
            'XL': ['109-114', '94-99', '109-114'],
        }
    },
    category: 'Giyim/Alt Giyim/Pantolon',
    tags: ['teknik', 'kargo', 'su itici', 'toptan'],
    viewCount: 2500,
    salesCount: 450,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 4)),
  },
  {
    id: 'prod4',
    name: 'Aero-Shell Jacket',
    price: 380.00,
    isFeatured: false,
    description: 'An ultralight, packable windbreaker made from a high-tech Japanese nylon. Features laser-cut ventilation and magnetic closures.',
    fabric: {
        name: 'Ultralight Nylon',
        description: 'A synthetic fabric known for its exceptional strength, elasticity, and abrasion resistance, while being incredibly lightweight.',
        closeUpImageUrl: 'https://picsum.photos/seed/fabric4/800',
        movementVideoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
    variants: [
        { name: 'Silver', color: '#C0C0C0', mediaUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', mediaType: 'video'},
    ],
    creator: users[1],
    sizes: ['S', 'M', 'L'],
    sizeGuide: {
        headers: ['Göğüs', 'Bel'],
        measurements: {
            'S': ['91-96', '76-81'],
            'M': ['97-102', '82-87'],
            'L': ['103-108', '88-93'],
        }
    },
    shopTheLookProductIds: ['prod3'],
    category: 'Giyim/Dış Giyim/Ceket',
    tags: ['hafif', 'teknik', 'naylon'],
    viewCount: 1800,
    salesCount: 95,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
  },
  {
    id: 'prod5',
    name: 'Breezy Linen Tunic',
    price: 155.00,
    isFeatured: true,
    description: 'An oversized linen tunic perfect for warm days or as a beach cover-up. Effortlessly chic and incredibly comfortable.',
    fabric: {
        name: 'European Flax Linen',
        description: 'A natural fiber made from the flax plant. It is known for its strength, breathability, and ability to soften with each wash.',
        closeUpImageUrl: 'https://picsum.photos/seed/fabric5/800',
        movementVideoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    },
    variants: [
        { name: 'White', color: '#FFFFFF', mediaUrl: 'https://picsum.photos/seed/prod5-white/1080/1920', mediaType: 'image'},
        { name: 'Sand', color: '#C2B280', mediaUrl: 'https://picsum.photos/seed/prod5-sand/1080/1920', mediaType: 'image'},
    ],
    creator: users[2],
    sizes: ['One Size'],
    sizeGuide: {
        headers: ['Göğüs'],
        measurements: {
            'One Size': ['110-120'],
        }
    },
    category: 'Giyim/Üst Giyim/Tunik',
    tags: ['keten', 'oversize', 'plaj'],
    viewCount: 3200,
    salesCount: 640,
    createdAt: new Date(),
  }
];

export const chats: Chat[] = [
    {
        id: 'chat1',
        participantIds: ['user4', 'user1'], // User is Ibrahim Akbaba (tr), other is AtelierAura (de)
        productId: 'prod1', // About The Marais Trench
        messages: [
            { id: 'chat1-msg1', text: 'Hi, does the Marais Trench run true to size?', senderId: 'user4', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
            { id: 'chat1-msg2', text: 'Hallo! Ja, die Passform ist klassisch. Wir empfehlen Ihre übliche Größe. Lassen Sie mich wissen, wenn Sie Maße benötigen!', senderId: 'user1', timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString() },
            { id: 'chat1-msg3', text: 'Thanks! I\'ll take a size M in Beige.', senderId: 'user4', timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString() },
            { id: 'chat1-msg4', text: 'Natürlich! Ich habe gerade das Vorbestellformular gesendet. Lassen Sie mich wissen, wenn es noch etwas gibt.', senderId: 'user5', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
        ]
    },
    {
        id: 'chat2',
        participantIds: ['user4', 'user2'], // User is Ibrahim Akbaba, other is UrbanTread
        productId: 'prod4', // About Aero-Shell Jacket
        messages: [
            { id: 'chat2-msg1', text: 'Is the Aero-Shell Jacket fully waterproof?', senderId: 'user4', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
            { id: 'chat2-msg2', text: 'It\'s highly water-resistant, perfect for city rain, but not for a heavy downpour. It uses a high-tech Japanese nylon with a DWR finish.', senderId: 'user2', timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString() },
        ]
    },
    {
        id: 'chat3',
        participantIds: ['user4', 'user3'], // User is Ibrahim Akbaba, other is NomadLinen
        // No productId, so this is a general chat
        messages: [
             { id: 'chat3-msg1', text: 'Just wanted to say I love the linen tunic! So comfy.', senderId: 'user4', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        ]
    }
];

export const saleRecords: SaleRecord[] = [
    {
        id: 'sale1',
        salespersonId: 'user5',
        brandOwnerId: 'user1',
        items: [
            { productId: 'prod1', productName: 'The Marais Trench', variantName: 'Beige', size: 'M', quantity: 1, pricePerUnit: 420.00 },
            { productId: 'prod2', productName: 'Silk Charmeuse Blouse', variantName: 'Ivory', size: 'S', quantity: 2, pricePerUnit: 180.00 }
        ],
        totalAmount: 780.00,
        commissionAmount: 78.00, // 10% of 780
        timestamp: new Date(), // Today
    },
    {
        id: 'sale2',
        salespersonId: 'user5',
        brandOwnerId: 'user1',
        items: [
            { productId: 'prod1', productName: 'The Marais Trench', variantName: 'Navy', size: 'L', quantity: 1, pricePerUnit: 420.00 }
        ],
        totalAmount: 420.00,
        commissionAmount: 42.00, // 10% of 420
        timestamp: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
    },
    {
        id: 'sale3',
        salespersonId: 'user5',
        brandOwnerId: 'user1',
        items: [
            { productId: 'prod2', productName: 'Silk Charmeuse Blouse', variantName: 'Black', size: 'M', quantity: 5, pricePerUnit: 180.00 }
        ],
        totalAmount: 900.00,
        commissionAmount: 90.00, // 10% of 900
        timestamp: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Last month
    },
];

export const mockComments: Omit<LiveComment, 'id' | 'timestamp'>[] = [
    { userId: 'user6', username: 'Alex Chen', avatarUrl: 'https://picsum.photos/seed/user6/200', text: 'Bu harika görünüyor!', type: 'comment' },
    { userId: 'user2', username: 'UrbanTread', avatarUrl: 'https://picsum.photos/seed/user2/200', text: 'Love this collection!', type: 'comment' },
    { userId: 'user3', username: 'NomadLinen', avatarUrl: 'https://picsum.photos/seed/user3/200', text: 'Wow 😍', type: 'comment' },
    { userId: 'user5', username: 'Sophie Dubois', avatarUrl: 'https://picsum.photos/seed/user5/200', text: 'Need this trench coat!', type: 'comment' },
    { userId: 'user6', username: 'Alex Chen', avatarUrl: 'https://picsum.photos/seed/user6/200', text: 'Can you show the back?', type: 'comment' },
];

export const liveStreams: LiveStream[] = [
    {
        id: 'live1',
        hostId: 'user1', // AtelierAura
        title: 'La Parisienne: Yeni Sezon Lansmanı',
        status: 'live',
        startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        thumbnailUrl: 'https://picsum.photos/seed/live1-thumb/400/600',
        productShowcaseIds: ['prod1', 'prod2'],
        viewerCount: 1340,
        likesCount: 25700,
        comments: [
            { id: 'c1', userId: 'user6', username: 'Alex Chen', avatarUrl: 'https://picsum.photos/seed/user6/200', text: 'AtelierAura katıldı', type: 'join', timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString() },
            { id: 'c2', userId: 'user2', username: 'UrbanTread', avatarUrl: 'https://picsum.photos/seed/user2/200', text: 'Bu trench coat harika!', type: 'comment', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
            { id: 'c3', userId: 'user6', username: 'Alex Chen', avatarUrl: 'https://picsum.photos/seed/user6/200', text: '💖', type: 'like', timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString() },
        ],
        playbackUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    },
    {
        id: 'live2',
        hostId: 'user2', // UrbanTread
        title: 'Techwear Essentials Showcase',
        status: 'upcoming',
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        thumbnailUrl: 'https://picsum.photos/seed/live2-thumb/400/600',
        productShowcaseIds: ['prod3', 'prod4'],
        viewerCount: 0,
        likesCount: 0,
        comments: []
    },
    {
        id: 'live3',
        hostId: 'user3', // NomadLinen
        title: 'Coastal Living: Linen Collection',
        status: 'ended',
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        endedAt: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000)).toISOString(),
        thumbnailUrl: 'https://picsum.photos/seed/live3-thumb/400/600',
        productShowcaseIds: ['prod5'],
        viewerCount: 876,
        likesCount: 12400,
        comments: [],
        playbackUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    }
];