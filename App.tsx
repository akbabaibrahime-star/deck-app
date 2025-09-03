import React, { useState, useMemo, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { GoogleGenAI, Chat as GeminiChat } from "@google/genai";
import { users, products as mockProducts, chats as mockChats, saleRecords as mockSales, liveStreams as mockLiveStreams } from './data/mockData';
import type { User, Product, UserSummary, CartItem, Deck, AiChatMessage, Notification, SizeGuideTemplate, ProductPackTemplate, Chat, ChatMessage, PreOrderPayload, SaleRecord, SaleRecordItem, LiveStream, LiveComment } from './types';

import { Feed } from './components/Feed';
import { Profile } from './components/Profile';
import { CreatorProfile } from './components/CreatorProfile';
import { BasketView } from './components/BasketView';
import { ChatView } from './components/ChatView';
import { ChatListView } from './components/ChatListView';
import { EditProfile } from './components/EditProfile';
import { CreateDeck } from './components/CreateDeck';
import { EditDeck } from './components/EditDeck';
import { DeckDetailView } from './components/DeckDetailView';
import { PublicProfileView } from './components/PublicProfileView';
import { AIVideoStudio } from './components/AIVideoStudio';
import { LoginView } from './components/LoginView';
import { SizeGuideTemplateEditor } from './components/SizeGuideTemplateEditor';
import { PackTemplateEditor } from './components/PackTemplateEditor';
import { SettingsView } from './components/SettingsView';
import { TeamManagementModal } from './components/TeamManagementModal';
import { HomeIcon, UserIcon, ShoppingBagIcon, ArrowLeftIcon, SparklesIcon, CloseIcon, PlusIcon, BellIcon, ChatBubbleIcon, Cog6ToothIcon, BookmarkIcon, CameraIcon } from './components/Icons';
import { CustomerProfile } from './components/CustomerProfile';
import { SavedView } from './components/SavedView';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { CommissionEditorModal } from './components/CommissionEditorModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { LiveFeedsView } from './components/LiveFeedsView';
import { LiveStreamSetupView } from './components/LiveStreamSetupView';
import { LiveStreamPlayerView } from './components/LiveStreamPlayerView';
import { DeckGalleryView } from './components/DeckGalleryView';


// --- I1N8 SETUP ---
type Language = 'tr' | 'ru' | 'en' | 'de';
const translations = {
  // General
  'close': { tr: 'Kapat', ru: 'Закрыть', en: 'Close', de: 'Schließen' },
  'save': { tr: 'Kaydet', ru: 'Сохранить', en: 'Save', de: 'Speichern' },
  'edit': { tr: 'Düzenle', ru: 'Редактировать', en: 'Edit', de: 'Bearbeiten' },
  'share': { tr: 'Paylaş', ru: 'Поделиться', en: 'Share', de: 'Teilen' },
  'delete': { tr: 'Sil', ru: 'Удалить', en: 'Delete', de: 'Löschen' },
  'add': { tr: 'Ekle', ru: 'Добавить', en: 'Add', de: 'Hinzufügen' },
  'online': { tr: 'Online', ru: 'В сети', en: 'Online', de: 'Online' },
  'youPrefix': { tr: 'Siz: ', ru: 'Вы: ', en: 'You: ', de: 'Du: ' },
  'language': { tr: 'Dil', ru: 'Язык', en: 'Language', de: 'Sprache' },
  'turkish': { tr: 'Türkçe', ru: 'Турецкий', en: 'Turkish', de: 'Türkisch' },
  'russian': { tr: 'Rusça', ru: 'Русский', en: 'Russian', de: 'Russisch' },
  'english': { tr: 'İngilizce', ru: 'Английский', en: 'English', de: 'Englisch' },
  'german': { tr: 'Almanca', ru: 'Немецкий', en: 'German', de: 'Deutsch' },
  'info': { tr: 'Bilgi', ru: 'Инфо', en: 'Info', de: 'Info' },
  'remove': { tr: 'Kaldır', ru: 'Удалить', en: 'Remove', de: 'Entfernen' },
  'all': { tr: 'Tümü', ru: 'Все', en: 'All', de: 'Alle' },
  'from': { tr: 'den', ru: 'от', en: 'From', de: 'Ab' },
  'next': { tr: 'İleri', en: 'Next', ru: 'Далее', de: 'Weiter' },
  'back': { tr: 'Geri', en: 'Back', ru: 'Назад', de: 'Zurück' },
  'saveChanges': { tr: 'Değişiklikleri Kaydet', ru: 'Сохранить изменения', en: 'Save Changes', de: 'Änderungen speichern' },
  'confirm': { tr: 'Onayla', ru: 'Подтвердить', en: 'Confirm', de: 'Bestätigen' },
  'cancel': { tr: 'İptal', ru: 'Отмена', en: 'Cancel', de: 'Abbrechen' },
  'showingProductsFrom': { tr: '{creatorName} ürünlerini görüntülüyorsunuz', en: 'Showing products from {creatorName}', ru: 'Показаны товары от {creatorName}', de: 'Zeige Produkte von {creatorName}' },
  'clearFilter': { tr: 'Filtreyi Temizle', en: 'Clear Filter', ru: 'Очистить фильтр', de: 'Filter löschen' },


  // App Toasts & Modals
  'addedToCart': { tr: 'Sepete Eklendi!', ru: 'Добавлено в корзину!', en: 'Added to Cart!', de: 'Zum Warenkorb hinzugefügt!' },
  'linkCopied': { tr: 'Link panoya kopyalandı!', ru: 'Ссылка скопирована!', en: 'Link copied to clipboard!', de: 'Link in die Zwischenablage kopiert!' },
  'copyFailed': { tr: 'Kopyalanamadı.', ru: 'Не удалось скопировать.', en: 'Could not copy.', de: 'Kopieren fehlgeschlagen.' },
  'shareLink': { tr: 'Linki Paylaş', ru: 'Поделиться ссылкой', en: 'Share Link', de: 'Link teilen' },
  'shareUnsupported': { tr: 'Otomatik paylaşım kullanılamıyor. Lütfen aşağıdaki linki kopyalayın.', ru: 'Автоматическая отправка недоступна. Пожалуйста, скопируйте ссылку ниже.', en: 'Auto-sharing is not available. Please copy the link below.', de: 'Automatisches Teilen nicht verfügbar. Bitte kopiere den Link unten.' },
  'copy': { tr: 'Kopyala', ru: 'Копировать', en: 'Copy', de: 'Kopieren' },
  'passwordUpdatedSuccessfully': { tr: 'Şifre başarıyla güncellendi!', en: 'Password updated successfully!', ru: 'Пароль успешно обновлен!', de: 'Passwort erfolgreich aktualisiert!' },
  'settingsUpdated': { tr: 'Ayarlar güncellendi!', en: 'Settings updated!', ru: 'Настройки обновлены!', de: 'Einstellungen aktualisiert!' },
  'streamScheduled': { tr: 'Yayın başarıyla planlandı!', en: 'Stream scheduled successfully!', ru: 'Трансляция успешно запланирована!', de: 'Stream erfolgreich geplant!' },


  // Product
  'products': { tr: 'Ürünler', ru: 'Товары', en: 'Products', de: 'Produkte' },
  'category': { tr: 'Kategori', ru: 'Категория', en: 'Category', de: 'Kategorie' },
  'tags': { tr: 'Etiketler', ru: 'Теги', en: 'Tags', de: 'Tags' },
  'categoryAndTags': { tr: 'Kategori & Etiketler', ru: 'Категория и теги', en: 'Category & Tags', de: 'Kategorie & Tags' },
  'productDetails': { tr: 'Ürün Detayları', ru: 'Детали товара', en: 'Product Details', de: 'Produktdetails' },
  'fabricAndSize': { tr: 'Kumaş & Beden', ru: 'Ткань и размер', en: 'Fabric & Size', de: 'Stoff & Größe' },
  'texture': { tr: 'Doku', ru: 'Текстура', en: 'Texture', de: 'Textur' },
  'sizeGuideCm': { tr: 'Beden Tablosu (cm)', ru: 'Таблица размеров (см)', en: 'Size Guide (cm)', de: 'Größentabelle (cm)' },
  'size': { tr: 'Beden', ru: 'Размер', en: 'Size', de: 'Größe' },
  'addToCart': { tr: 'Sepete Ekle', ru: 'В корзину', en: 'Add to Cart', de: 'In den Warenkorb' },
  'like': { tr: 'Beğen', ru: 'Нравится', en: 'Like', de: 'Gefällt mir' },
  'chat': { tr: 'Sohbet', ru: 'Чат', en: 'Chat', de: 'Chat' },
  'shopByCategory': { tr: 'Kategoriye Göre Alışveriş Yap', ru: 'Покупки по категориям', en: 'Shop by Category', de: 'Nach Kategorie einkaufen' },
  'featuredProducts': { tr: 'Öne Çıkan Ürünler', ru: 'Рекомендуемые товары', en: 'Featured Products', de: 'Vorgestellte Produkte' },
  'new': { tr: 'YENİ', ru: 'НОВИНКА', en: 'NEW', de: 'NEU' },
  'sale': { tr: 'İndirim', ru: 'Скидка', en: 'Sale', de: 'Angebot' },
  'savePercent': { tr: '%{percent} TASARRUF', ru: 'СКИДКА {percent}%', en: 'SAVE {percent}%', de: '{percent}% SPAREN' },
  'wholesale': { tr: 'Toptan Satış', ru: 'Оптовая продажа', en: 'Wholesale', de: 'Großhandel' },
  'pack': { tr: 'Seri', ru: 'Пакет', en: 'Pack', de: 'Paket' },
  'availablePacks': { tr: 'Mevcut Seriler', ru: 'Доступные пакеты', en: 'Available Packs', de: 'Verfügbare Pakete' },
  'totalXItems': { tr: 'Toplam {count} adet', ru: 'Всего {count} шт.', en: 'Total {count} items', de: 'Gesamt {count} Artikel' },
  'pricePerItem': { tr: 'adet başına', ru: 'цена за шт.', en: 'price per item', de: 'Preis pro Artikel' },
  'contents': { tr: 'İçerik', ru: 'Содержимое', en: 'Contents', de: 'Inhalt' },


  // FitFinder
  'findMySize': { tr: 'Bedenimi Bul', ru: 'Найти мой размер', en: 'Find My Size', de: 'Meine Größe finden' },
  'findMySizeHelp': { tr: '{productName} için en uygun bedeni bulmanıza yardımcı olalım.', ru: 'Поможем найти лучший размер для {productName}.', en: 'Let us help you find the best size for {productName}.', de: 'Wir helfen dir, die beste Größe für {productName} zu finden.' },
  'heightCm': { tr: 'Boy (cm)', ru: 'Рост (см)', en: 'Height (cm)', de: 'Größe (cm)' },
  'heightPlaceholder': { tr: 'Örn: 175', ru: 'Напр: 175', en: 'e.g., 175', de: 'z.B. 175' },
  'weightKg': { tr: 'Kilo (kg)', ru: 'Вес (кг)', en: 'Weight (kg)', de: 'Gewicht (kg)' },
  'weightPlaceholder': { tr: 'Örn: 70', ru: 'Напр: 70', en: 'e.g., 70', de: 'z.B. 70' },
  'enterValidValues': { tr: 'Lütfen geçerli değerler girin.', ru: 'Пожалуйста, введите корректные значения.', en: 'Please enter valid values.', de: 'Bitte gib gültige Werte ein.' },
  'suggestedSize': { tr: 'Önerilen bedeniniz: {size}', ru: 'Рекомендуемый размер: {size}', en: 'Your suggested size is: {size}', de: 'Deine empfohlene Größe ist: {size}' },

  // Notifications
  'notifications': { tr: 'Bildirimler', ru: 'Уведомления', en: 'Notifications', de: 'Benachrichtigungen' },
  'noNotifications': { tr: 'Henüz bildirim yok.', ru: 'Пока нет уведомлений.', en: 'No notifications yet.', de: 'Noch keine Benachrichtigungen.' },
  'timeAgo': { tr: '{time} önce', ru: '{time} назад', en: '{time} ago', de: 'vor {time}' },
  'yearsShort': { tr: 'y', ru: 'г', en: 'y', de: 'J' },
  'monthsShort': { tr: 'a', ru: 'мес', en: 'mo', de: 'M' },
  'daysShort': { tr: 'g', ru: 'д', en: 'd', de: 'T' },
  'hoursShort': { tr: 's', ru: 'ч', en: 'h', de: 'Std' },
  'minutesShort': { tr: 'd', ru: 'м', en: 'm', de: 'Min' },
  'secondsShort': { tr: 'sn', ru: 'с', en: 's', de: 's' },
  'newDeckNotification': { tr: 'yeni bir koleksiyon yayınladı: {deckName}', ru: 'опубликовал(а) новую коллекцию: {deckName}', en: 'published a new collection: {deckName}', de: 'hat eine neue Kollektion veröffentlicht: {deckName}' },
  'newProductNotification': { tr: 'yeni bir ürün ekledi: {productName}', ru: 'добавил(а) новый товар: {productName}', en: 'added a new product: {productName}', de: 'hat ein neues Produkt hinzugefügt: {productName}' },
  
  // Social & Profile
  'followingStatus': { tr: 'Takip ediliyor', ru: 'Вы подписаны', en: 'Following', de: 'Gefolgt' },
  'follow': { tr: 'Takip Et', ru: 'Подписаться', en: 'Follow', de: 'Folgen' },
  'decks': { tr: 'Koleksiyonlar', ru: 'Коллекции', en: 'Decks', de: 'Kollektionen' },
  'followers': { tr: 'Takipçiler', ru: 'Подписчики', en: 'Followers', de: 'Follower' },
  'sendMessage': { tr: 'Mesaj Gönder', ru: 'Отправить сообщение', en: 'Send Message', de: 'Nachricht senden' },
  'contactInfo': { tr: 'İletişim Bilgileri', ru: 'Контактная информация', en: 'Contact Info', de: 'Kontaktinformationen' },
  'viewLocation': { tr: 'Konumu Görüntüle', ru: 'Посмотреть на карте', en: 'View Location', de: 'Standort anzeigen' },
  'editProfile': { tr: 'Profili Düzenle', ru: 'Редактировать профиль', en: 'Edit Profile', de: 'Profil bearbeiten' },
  'createDeck': { tr: 'Koleksiyon Oluştur', ru: 'Создать коллекцию', en: 'Create Deck', de: 'Kollektion erstellen' },
  'shareProfile': { tr: 'Profili Paylaş', ru: 'Поделиться профилем', en: 'Share Profile', de: 'Profil teilen' },
  'logout': { tr: 'Çıkış Yap', ru: 'Выйти', en: 'Log Out', de: 'Abmelden' },
  'saved': { tr: 'Kaydedilenler', ru: 'Сохраненные', en: 'Saved', de: 'Gemerkt' },
  'liked': { tr: 'Beğenilenler', ru: 'Понравившиеся', en: 'Liked', de: 'Gefällt mir' },
  'myProducts': { tr: 'Ürünlerim', ru: 'Мои товары', en: 'My Products', de: 'Meine Produkte' },
  'generatePromoVideo': { tr: 'Tanıtım Videosu Oluştur', ru: 'Создать промо-видео', en: 'Generate Promo Video', de: 'Promo-Video erstellen' },
  'nothingHereYet': { tr: 'Burada henüz bir şey yok.', ru: 'Здесь пока ничего нет.', en: 'Nothing here yet.', de: 'Hier ist noch nichts.' },
  'following': { tr: 'Takip Edilen', ru: 'Подписки', en: 'Following', de: 'Gefolgt' },
  'noOneYet': { tr: 'Henüz kimse yok.', ru: 'Пока никого нет.', en: 'No one yet.', de: 'Noch niemand hier.' },
  'ourTeam': { tr: 'Ekibimiz', ru: 'Наша команда', en: 'Our Team', de: 'Unser Team' },
  'teamManagement': { tr: 'Ekip Yönetimi', ru: 'Управление командой', en: 'Team Management', de: 'Team-Management' },
  'addMember': { tr: 'Üye Ekle', ru: 'Добавить участника', en: 'Add Member', de: 'Mitglied hinzufügen' },
  'noTeamMembers': { tr: 'Ekipte henüz üye yok.', ru: 'В команде пока нет участников.', en: 'No team members yet.', de: 'Noch keine Teammitglieder.' },
  'selectUserToAdd': { tr: 'Ekibe eklemek için bir kullanıcı seçin', ru: 'Выберите пользователя для добавления в команду', en: 'Select a user to add to the team', de: 'Wähle einen Benutzer zum Hinzufügen zum Team aus' },
  'noEligibleUsers': { tr: 'Eklenecek uygun kullanıcı bulunamadı.', ru: 'Подходящих пользователей для добавления не найдено.', en: 'No eligible users found to add.', de: 'Keine geeigneten Benutzer zum Hinzufügen gefunden.' },
  'removeMemberConfirmation': { tr: '"{username}" adlı üyeyi takımdan çıkarmak istediğinizden emin misiniz? Bu işlem, üyenin rolünü "Müşteri" olarak değiştirecek ve tüm satış ayrıcalıklarını kaldıracaktır.', ru: 'Вы уверены, что хотите удалить участника "{username}" из команды? Это действие изменит роль участника на "Клиент" и отзовет все права на продажу.', en: 'Are you sure you want to remove "{username}" from the team? This will change their role to "Customer" and remove all sales privileges.', de: 'Sind Sie sicher, dass Sie "{username}" aus dem Team entfernen möchten? Dadurch wird ihre Rolle auf "Kunde" geändert und alle Verkaufsrechte werden entzogen.' },
  'setCommission': { tr: 'Komisyon Belirle', en: 'Set Commission', ru: 'Установить комиссию', de: 'Provision festlegen' },

  // Basket & Saved & Pre-order
  'yourBasketIsEmpty': { tr: 'Sepetiniz Boş', ru: 'Ваша корзина пуста', en: 'Your Basket is Empty', de: 'Dein Warenkorb ist leer' },
  'looksLikeYouHaventAddedAnythingYet': { tr: 'Görünüşe göre henüz bir şey eklemediniz.', ru: 'Похоже, вы еще ничего не добавили.', en: "Looks like you haven't added anything yet.", de: 'Sieht so aus, als hättest du noch nichts hinzugefügt.' },
  'myBasket': { tr: 'Sepetim', ru: 'Моя корзина', en: 'My Basket', de: 'Mein Warenkorb' },
  'subtotal': { tr: 'Ara Toplam', ru: 'Промежуточный итог', en: 'Subtotal', de: 'Zwischensumme' },
  'grandTotal': { tr: 'Genel Toplam', ru: 'Общая сумма', en: 'Grand Total', de: 'Gesamtsumme' },
  'checkout': { tr: 'Ödeme Yap', ru: 'Оформить заказ', en: 'Checkout', de: 'Zur Kasse' },
  'myCollection': { tr: 'Koleksiyonum', ru: 'Моя коллекция', en: 'My Collection', de: 'Meine Sammlung' },
  'noSavedItemsYet': { tr: 'Henüz kaydedilmiş ürün yok.', ru: 'Пока нет сохраненных товаров.', en: 'No saved items yet.', de: 'Noch keine Artikel gemerkt.' },
  'noLikedItemsYet': { tr: 'Henüz beğenilmiş ürün yok.', ru: 'Пока нет понравившихся товаров.', en: 'No liked items yet.', de: 'Noch keine Artikel mit "Gefällt mir" markiert.' },
  'preOrderForm': { tr: 'Ön Sipariş Formu', ru: 'ФОРМА ПРЕДЗАКАЗА', en: 'Pre-Order Form', de: 'VORBESTELLFORMULAR' },
  'brand': { tr: 'Marka', ru: 'Бренд', en: 'Brand', de: 'Marke' },
  'date': { tr: 'Tarih', ru: 'Дата', en: 'Date', de: 'Datum' },
  'time': { tr: 'Saat', ru: 'Время', en: 'Time', de: 'Uhrzeit' },
  'salesperson': { tr: 'Satış Temsilcisi', ru: 'Торговый представитель', en: 'Sales Representative', de: 'Vertriebsmitarbeiter' },
  'modelCode': { tr: 'Model', ru: 'Модель', en: 'Model', de: 'Modell' },
  'color': { tr: 'Renk', ru: 'Цвет', en: 'Color', de: 'Farbe' },
  'quantityShort': { tr: 'Adt', ru: 'Кол', en: 'Qty', de: 'Mng' },
  'unitPrice': { tr: 'Birim Fiyat', ru: 'Цена за шт.', en: 'Unit Price', de: 'Stückpreis' },
  'unitPriceShort': { tr: 'B.Fiyat', ru: 'Цена', en: 'U.Price', de: 'E.Preis' },
  'total': { tr: 'Tutar', ru: 'Сумма', en: 'Total', de: 'Gesamt' },
  'totalQuantity': { tr: 'TOPLAM ADET', ru: 'ОБЩЕЕ КОЛИЧЕСТВО', en: 'TOTAL QUANTITY', de: 'GESAMTMENGE' },
  'grandTotalWithAmount': { tr: 'GENEL TOPLAM: ${amount}', ru: 'ИТОГО: ${amount}', en: 'GRAND TOTAL: ${amount}', de: 'GESAMTSUMME: ${amount}' },
  'sendPreOrderToSeller': { tr: 'Ön Siparişi Satıcıya Gönder', ru: 'Отправить предзаказ продавцу', en: 'Send Pre-order to Seller', de: 'Vorbestellung an Verkäufer senden' },
  'myDeckBasket': { tr: 'Deck Sepetim', ru: 'Моя корзина Deck', en: 'My Deck Basket', de: 'Mein Deck-Warenkorb' },
  'fromCreator': { tr: 'Satıcı: {creator}', ru: 'От: {creator}', en: 'From {creator}', de: 'Von {creator}' },
  'sizeColor': { tr: 'Beden/Renk', ru: 'Размер/Цвет', en: 'Size/Color', de: 'Größe/Farbe' },
  'editOrder': { tr: 'Siparişi Düzenle', ru: 'Редактировать заказ', en: 'Edit Order', de: 'Bestellung bearbeiten' },
  'editAndResend': { tr: 'Düzenle ve Yeniden Gönder', ru: 'Редактировать и отправить', en: 'Edit & Resend', de: 'Bearbeiten & Erneut senden' },
  'secureCheckout': { tr: 'Güvenli Ödeme', ru: 'Безопасная оплата', en: 'Secure Checkout', de: 'Sicherer Checkout' },
  'sellerNotAcceptingPayments': { tr: 'Satıcı henüz doğrudan ödeme kabul etmiyor.', ru: 'Продавец пока не принимает прямые платежи.', en: 'Seller does not accept direct payments yet.', de: 'Verkäufer akzeptiert noch keine Direktzahlungen.' },
  'paymentSuccessful': { tr: 'Ödeme Başarılı!', ru: 'Оплата прошла успешно!', en: 'Payment Successful!', de: 'Zahlung erfolgreich!' },
  'orderPlaced': { tr: 'Siparişiniz alındı.', ru: 'Ваш заказ размещен.', en: 'Your order has been placed.', de: 'Ihre Bestellung wurde aufgegeben.' },

  
  // Chat
  'typeAMessage': { tr: 'Bir mesaj yazın...', ru: 'Напишите сообщение...', en: 'Type a message...', de: 'Nachricht schreiben...' },
  'messages': { tr: 'Mesajlar', ru: 'Сообщения', en: 'Messages', de: 'Nachrichten' },
  'noMessagesYet': { tr: 'Сообщений пока нет.', ru: 'Сообщений пока нет.', en: 'No messages yet.', de: 'Noch keine Nachrichten.' },
  'product': { tr: 'Ürün', ru: 'Товар', en: 'Product', de: 'Produkt' },
  'chatSettings': { tr: 'Sohbet Ayarları', en: 'Chat Settings', ru: 'Настройки чата', de: 'Chat-Einstellungen' },
  'enableVoiceMessages': { tr: 'Sesli Mesajları Etkinleştir', en: 'Enable Voice Messages', ru: 'Включить голосовые сообщения', de: 'Sprachnachrichten aktivieren' },
  'yesterday': { tr: 'Dün', ru: 'Вчера', en: 'Yesterday', de: 'Gestern' },


  // AI
  'aiStylist': { tr: 'AI Stil Danışmanı', ru: 'AI Стилист', en: 'AI Stylist', de: 'KI-Stylist' },
  'aiWelcome': { tr: 'Merhaba! Ben sizin kişisel stil danışmanınızım. Ne tür bir kombin arıyorsunuz?', ru: 'Здравствуйте! Я ваш личный AI-стилист. Какой образ вы ищете?', en: "Hello! I'm your personal AI stylist. What kind of look are you searching for?", de: 'Hallo! Ich bin dein persönlicher KI-Stylist. Welche Art von Look suchst du?' },
  'aiOffline': { tr: 'Stil danışmanı şu an çevrimdışı. Lütfen daha sonra tekrar deneyin.', ru: 'Стилист в данный момент недоступен. Пожалуйста, попробуйте позже.', en: 'The stylist is currently offline. Please try again later.', de: 'Der Stylist ist derzeit offline. Bitte versuche es später erneut.' },
  'aiError': { tr: 'Üzgünüm, bir sorun oluştu. Lütfen tekrar deneyin.', ru: 'Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.', en: 'Sorry, something went wrong. Please try again.', de: 'Entschuldigung, etwas ist schiefgegangen. Bitte versuche es erneut.' },
  'askStyleQuestion': { tr: 'Bir stil sorusu sorun...', ru: 'Задайте вопрос о стиле...', en: 'Ask a style question...', de: 'Stelle eine Stilfrage...' },
  
  // Login & Security
  'login': { tr: 'Giriş Yap', ru: 'Войти', en: 'Log In', de: 'Anmelden' },
  'createAccount': { tr: 'Hesap Oluştur', ru: 'Создать аккаунт', en: 'Create Account', de: 'Konto erstellen' },
  'username': { tr: 'Kullanıcı Adı', ru: 'Имя пользователя', en: 'Username', de: 'Benutzername' },
  'yourUsername': { tr: 'Kullanıcı Adınız', ru: 'Ваше имя пользователя', en: 'Your Username', de: 'Dein Benutzername' },
  'email': { tr: 'E-posta', ru: 'Электронная почта', en: 'Email', de: 'E-Mail' },
  'password': { tr: 'Şifre', ru: 'Пароль', en: 'Password', de: 'Passwort' },
  'invalidCredentials': { tr: 'Geçersiz e-posta veya şifre.', ru: 'Неверный адрес электронной почты или пароль.', en: 'Invalid email or password.', de: 'Ungültige E-Mail oder Passwort.' },
  'emailExists': { tr: 'Bu e-posta adresine sahip bir hesap zaten var.', ru: 'Аккаунт с этим адресом электронной почты уже существует.', en: 'An account with this email address already exists.', de: 'Ein Konto mit dieser E-Mail-Adresse existiert bereits.' },
  'signUp': { tr: 'Kaydol', ru: 'Зарегистрироваться', en: 'Sign Up', de: 'Registrieren' },
  'noAccount': { tr: 'Hesabınız yok mu? Kaydolun', ru: 'Нет аккаунта? Зарегистрируйтесь', en: "Don't have an account? Sign up", de: 'Kein Konto? Registrieren' },
  'hasAccount': { tr: 'Zaten bir hesabınız var mı? Giriş yapın', ru: 'Уже есть аккаунт? Войдите', en: 'Already have an account? Log in', de: 'Bereits ein Konto? Anmelden' },
  'iWantTo': { tr: 'Şunun için buradayım...', en: 'I am here to...', ru: 'Я хочу...', de: 'Ich möchte...' },
  'shop': { tr: 'Alışveriş Yapmak', en: 'Shop', ru: 'Покупать', de: 'Einkaufen' },
  'shopDescription': { tr: 'Benzersiz markaları ve stilleri keşfedin.', en: 'Discover unique brands and styles.', ru: 'Откройте для себя уникальные бренды и стили.', de: 'Entdecke einzigartige Marken und Stile.' },
  'sell': { tr: 'Satış Yapmak', en: 'Sell', ru: 'Продавать', de: 'Verkaufen' },
  'sellDescription': { tr: 'Kendi mağazanızı açın ve ürünlerinizi listeleyin.', en: 'Open your store and list your products.', ru: 'Откройте свой магазин и размещайте товары.', de: 'Eröffne deinen eigenen Shop und liste deine Produkte auf.' },
  'accountSecurity': { tr: 'Hesap Güvenliği', en: 'Account Security', ru: 'Безопасность аккаунта', de: 'Kontosicherheit' },
  'changePassword': { tr: 'Şifreyi Değiştir', en: 'Change Password', ru: 'Изменить пароль', de: 'Passwort ändern' },
  'currentPassword': { tr: 'Mevcut Şifre', en: 'Current Password', ru: 'Текущий пароль', de: 'Aktuelles Passwort' },
  'newPassword': { tr: 'Yeni Şifre', en: 'New Password', ru: 'Новый пароль', de: 'Neues Passwort' },
  'confirmNewPassword': { tr: 'Yeni Şifreyi Onayla', en: 'Confirm New Password', ru: 'Подтвердите новый пароль', de: 'Neues Passwort bestätigen' },
  'passwordsDoNotMatch': { tr: 'Yeni şifreler eşleşmiyor.', en: 'New passwords do not match.', ru: 'Новые пароли не совпадают.', de: 'Neue Passwörter stimmen nicht überein.' },
  'incorrectCurrentPassword': { tr: 'Mevcut şifre yanlış.', en: 'Incorrect current password.', ru: 'Неверный текущий пароль.', de: 'Falsches aktuelles Passwort.' },
  'registerWithPhone': { en: 'Sign up with Phone', tr: 'Telefonla Kaydol', ru: 'Регистрация по телефону', de: 'Mit Telefonnummer registrieren' },
  'registerWithEmail': { en: 'Sign up with Email', tr: 'E-posta ile Kaydol', ru: 'Регистрация по E-Mail', de: 'Mit E-Mail registrieren' },
  'phoneNumber': { en: 'Phone Number', tr: 'Telefon Numarası', ru: 'Номер телефона', de: 'Telefonnummer' },
  'phoneExists': { en: 'An account with this phone number already exists.', tr: 'Bu telefon numarasına sahip bir hesap zaten var.', ru: 'Аккаунт с этим номером телефона уже существует.', de: 'Ein Konto mit dieser Telefonnummer existiert bereits.' },
  'searchCountry': { en: 'Search Country', tr: 'Ülke Ara', ru: 'Поиск страны', de: 'Land suchen' },
  'selectCountry': { en: 'Select Country', tr: 'Ülke Seç', ru: 'Выберите страну', de: 'Land auswählen' },
  'emailOrPhone': { en: 'Email or Phone Number', tr: 'E-posta veya Telefon Numarası', ru: 'Email или номер телефона', de: 'E-Mail oder Telefonnummer' },
  'forgotPassword': { en: 'Forgot Password?', tr: 'Şifremi Unuttum?', ru: 'Забыли пароль?', de: 'Passwort vergessen?' },
  'passwordReset': { en: 'Password Reset', tr: 'Şifre Sıırlama', ru: 'Сброс пароля', de: 'Passwort zurücksetzen' },
  'sendResetCode': { en: 'Send Reset Code', tr: 'Sıfırlama Kodu Gönder', ru: 'Отправить код сброса', de: 'Code senden' },
  'verificationCode': { en: 'Verification Code', tr: 'Doğrulama Kodu', ru: 'Код подтверждения', de: 'Bestätigungscode' },
  'enterVerificationCode': { en: 'Enter the code sent to your email/phone.', tr: 'E-postanıza/telefonunuza gönderilen kodu girin.', ru: 'Введите код, отправленный на вашу почту/телефон.', de: 'Geben Sie den Code ein, der an Ihre E-Mail/Ihr Telefon gesendet wurde.' },
  'verify': { en: 'Verify', tr: 'Doğrula', ru: 'Подтвердить', de: 'Bestätigen' },
  'resetPassword': { en: 'Reset Password', tr: 'Şifreyi Sıfırla', ru: 'Сбросить пароль', de: 'Passwort zurücksetzen' },
  'userNotFound': { en: 'User not found with that email/phone.', tr: 'Bu e-posta/telefon ile kullanıcı bulunamadı.', ru: 'Пользователь с таким email/телефоном не найден.', de: 'Benutzer mit dieser E-Mail/diesem Telefon nicht gefunden.' },
  'demoCodeMessage': { en: '(For this demo, any 6-digit code will work)', tr: '(Bu demo için herhangi bir 6 haneli kod geçerlidir)', ru: '(Для этой демонстрации подойдет любой 6-значный код)', de: '(Für diese Demo funktioniert jeder 6-stellige Code)' },

  
  // Settings & Templates
  'settings': { tr: 'Ayarlar', ru: 'Настройки', en: 'Settings', de: 'Einstellungen' },
  'sizeGuideTemplates': { tr: 'Beden Tablosu Şablonları', ru: 'Шаблоны таблиц размеров', en: 'Size Guide Templates', de: 'Größentabellen-Vorlagen' },
  'noSizeGuideTemplates': { tr: 'Henüz beden tablosu şablonu oluşturmadınız.', ru: 'Вы еще не создали шаблонов таблиц размеров.', en: "You haven't created any size guide templates yet.", de: 'Du hast noch keine Größentabellen-Vorlagen erstellt.' },
  'editTemplate': { tr: 'Şablonu Düzenle', ru: 'Редактировать шаблон', en: 'Edit Template', de: 'Vorlage bearbeiten' },
  'createTemplate': { tr: 'Yeni Şablon Oluştur', ru: 'Создать новый шаблон', en: 'Create New Template', de: 'Neue Vorlage erstellen' },
  'templateName': { tr: 'Şablon Adı', ru: 'Название шаблона', en: 'Template Name', de: 'Vorlagenname' },
  'templateNamePlaceholder': { tr: 'Örn: Standart T-Shirt Kalıbı', ru: 'Напр: Стандартный шаблон футболки', en: 'e.g., Standard T-Shirt Fit', de: 'z.B. Standard-T-Shirt-Passform' },
  'sizes': { tr: 'Bedenler', ru: 'Размеры', en: 'Sizes', de: 'Größen' },
  'sizeInputPlaceholder': { tr: 'Beden yazıp Enter\'a basın', ru: 'Введите размер и нажмите Enter', en: 'Type size and press Enter', de: 'Größe eingeben und Enter drücken' },
  'measurementHeadings': { tr: 'Ölçü Başlıkları', ru: 'Заголовки измерений', en: 'Measurement Headings', de: 'Maßüberschriften' },
  'enterMeasurements': { tr: 'Ölçüleri girin (cm)', ru: 'Введите измерения (см)', en: 'Enter measurements (cm)', de: 'Maße eingeben (cm)' },
  'saveTemplate': { tr: 'Şablonu Kaydet', ru: 'Сохранить шаблон', en: 'Save Template', de: 'Vorlage speichern' },
  'packTemplates': { tr: 'Seri Şablonları', ru: 'Шаблоны пакетов', en: 'Pack Templates', de: 'Paketvorlagen' },
  'noPackTemplates': { tr: 'Henüz seri şablonu oluşturmadınız.', ru: 'Вы еще не создали шаблонов пакетов.', en: "You haven't created any pack templates yet.", de: 'Du hast noch keine Paketvorlagen erstellt.' },
  'editPackTemplate': { tr: 'Seri Şablonunu Düzenle', ru: 'Редактировать шаблон пакета', en: 'Edit Pack Template', de: 'Paketvorlage bearbeiten' },
  'createPackTemplate': { tr: 'Yeni Seri Şablonu Oluştur', ru: 'Создать новый шаблон пакета', en: 'Create New Pack Template', de: 'Neue Paketvorlage erstellen' },
  'packTemplateNamePlaceholder': { tr: 'Örn: Standart Seri', ru: 'Напр: Стандартный пакет', en: 'e.g., Standard Pack', de: 'z.B. Standardpaket' },
  'packContents': { tr: 'Seri İçeriği', ru: 'Содержимое пакета', en: 'Pack Contents', de: 'Paketinhalt' },
  'selectPackTemplate': { tr: 'Seri Şablonu Seç', ru: 'Выберите шаблон пакета', en: 'Select Pack Template', de: 'Paketvorlage auswählen' },
  'addSizesToDefineContents': { tr: 'Seri içeriğini tanımlamak için lütfen önce beden ekleyin.', ru: 'Пожалуйста, сначала добавьте размеры, чтобы определить содержимое пакета.', en: 'Please add sizes first to define pack contents.', de: 'Bitte fügen Sie zuerst Größen hinzu, um den Paketinhalt zu definieren.' },
  'paymentSettings': { tr: 'Ödeme Ayarları', ru: 'Настройки платежей', en: 'Payment Settings', de: 'Zahlungseinstellungen' },
  'activatePayments': { tr: 'Ödemeleri Aktive Et', ru: 'Активировать платежи', en: 'Activate Payments', de: 'Zahlungen aktivieren' },
  'paymentProviderId': { tr: 'Ödeme Sağlayıcı ID', ru: 'ID поставщика платежей', en: 'Payment Provider ID', de: 'Zahlungsanbieter-ID' },
  'paymentProviderIdPlaceholder': { tr: 'Örn: acct_12345ABCDE', ru: 'Напр: acct_12345ABCDE', en: 'e.g., acct_12345ABCDE', de: 'z.B. acct_12345ABCDE' },
  'savePaymentInfo': { tr: 'Ödeme Bilgilerini Kaydet', ru: 'Сохранить платежную информацию', en: 'Save Payment Info', de: 'Zahlungsinformationen speichern' },
  'paymentsActive': { tr: 'Ödemeler Aktif', ru: 'Платежи активны', en: 'Payments Active', de: 'Zahlungen aktiv' },
  'paymentsActiveDesc': { tr: 'Sepetten doğrudan ödeme alabilirsiniz.', ru: 'Вы можете получать прямые платежи из корзины.', en: 'You can receive direct payments from the basket.', de: 'Sie können Direktzahlungen aus dem Warenkorb erhalten.' },
  'paymentsInactive': { tr: 'Ödemeler Devre Dışı', ru: 'Платежи неактивны', en: 'Payments Inactive', de: 'Zahlungen inaktiv' },
  'paymentsInactiveDesc': { tr: 'Doğrudan ödeme almak için Ödeme Sağlayıcı ID\'nizi girin.', ru: 'Введите ваш ID поставщика платежей для получения прямых платежей.', en: 'Enter your Payment Provider ID to receive direct payments.', de: 'Geben Sie Ihre Zahlungsanbieter-ID ein, um Direktzahlungen zu erhalten.' },


  // Edit Profile
  'change': { tr: 'Değiştir', ru: 'Изменить', en: 'Change', de: 'Ändern' },
  'realign': { tr: 'Yeniden Hizala', ru: 'Выровнять заново', en: 'Realign', de: 'Neu ausrichten' },
  'bio': { tr: 'Bio', ru: 'Био', en: 'Bio', de: 'Bio' },
  'phone': { tr: 'Telefon', ru: 'Телефон', en: 'Phone', de: 'Telefon' },
  'address': { tr: 'Adres', ru: 'Адрес', en: 'Address', de: 'Adresse' },
  'googleMapsLink': { tr: 'Google Haritalar Linki', ru: 'Ссылка на Google Карты', en: 'Google Maps Link', de: 'Google Maps Link' },
  
  // Create/Edit Deck
  'createNewDeck': { tr: 'Yeni Koleksiyon Oluştur', ru: 'Создать новую коллекцию', en: 'Create New Deck', de: 'Neue Kollektion erstellen' },
  'editDeck': { tr: 'Koleksiyonu Düzenle', ru: 'Редактировать коллекцию', en: 'Edit Deck', de: 'Kollektion bearbeiten' },
  'deckName': { tr: 'Koleksiyon Adı', ru: 'Название коллекции', en: 'Deck Name', de: 'Kollektionsname' },
  'deckNamePlaceholder': { tr: 'Örn: Yaz Koleksiyonu', ru: 'Напр: Летняя коллекция', en: 'e.g., Summer Collection', de: 'z.B. Sommerkollektion' },
  'collectionImages': { tr: 'Koleksiyon Görselleri', ru: 'Изображения коллекции', en: 'Collection Images', de: 'Kollektionsbilder' },
  'productsInThisDeck': { tr: 'Bu Koleksiyondaki Ürünler', ru: 'Товары в этой коллекции', en: 'Products in this Deck', de: 'Produkte in dieser Kollektion' },
  'addProduct': { tr: 'Ürün Ekle', ru: 'Добавить товар', en: 'Add Product', de: 'Produkt hinzufügen' },
  'gallery': { tr: 'Galeri', ru: 'Галерея', en: 'Gallery', de: 'Galerie' },
  
  // Create Product
  'addNewProduct': { tr: 'Yeni Ürün Ekle', ru: 'Добавить новый товар', en: 'Add New Product', de: 'Neues Produkt hinzufügen' },
  'editProduct': { tr: 'Ürünü Düzenle', ru: 'Редактировать товар', en: 'Edit Product', de: 'Produkt bearbeiten' },
  'productName': { tr: 'Ürün Adı', ru: 'Название товара', en: 'Product Name', de: 'Produktname' },
  'price': { tr: 'Fiyat ($)', ru: 'Цена ($)', en: 'Price ($)', de: 'Preis ($)' },
  'originalPrice': { tr: 'Üstü Çizili Fiyat (İndirim için)', ru: 'Зачеркнутая цена (для скидки)', en: 'Original Price (for discount)', de: 'Originalpreis (für Rabatt)' },
  'description': { tr: 'Aıklama', ru: 'Описание', en: 'Description', de: 'Beschreibung' },
  'fabricDetails': { tr: 'Kumaş Detayları', ru: 'Детали ткани', en: 'Fabric Details', de: 'Stoffdetails' },
  'fabricName': { tr: 'Kumaş Adı', ru: 'Название ткани', en: 'Fabric Name', de: 'Stoffname' },
  'fabricNamePlaceholder': { tr: 'Örn. Pamuk Gabardin', ru: 'Напр. Хлопковый габардин', en: 'e.g. Cotton Gabardine', de: 'z.B. Baumwoll-Gabardine' },
  'fabricDescription': { tr: 'Kumaş Açıklaması', ru: 'Описание ткани', en: 'Fabric Description', de: 'Stoffbeschreibung' },
  'fabricDescriptionPlaceholder': { tr: 'Kumaşın dokusunu ve hissini tanımlayın', ru: 'Опишите текстуру и ощущение от ткани', en: 'Describe the fabric\'s texture and feel', de: 'Beschreibe die Textur und das Gefühl des Stoffes' },
  'fabricCloseUpImage': { tr: 'Kumaş Yakın Çekim Görseli', ru: 'Изображение ткани крупным планом', en: 'Fabric Close-up Image', de: 'Stoff-Nahaufnahme' },
  'sizesAndMeasurements': { tr: 'Bedenler & Ölçüler', ru: 'Размеры и измерения', en: 'Sizes & Measurements', de: 'Größen & Maße' },
  'loadFromTemplate': { tr: 'Şablondan Yükle', ru: 'Загрузить из шаблона', en: 'Load from Template', de: 'Aus Vorlage laden' },
  'availableSizes': { tr: 'Mevcut Bedenler', ru: 'Доступные размеры', en: 'Available Sizes', de: 'Verfügbare Größen' },
  'variants': { tr: 'Varyantlar', ru: 'Варианты', en: 'Variants', de: 'Varianten' },
  'variantN': { tr: 'Varyant {index}', ru: 'Вариант {index}', en: 'Variant {index}', de: 'Variante {index}' },
  'variantNamePlaceholder': { tr: 'Varyant Adı (örn. Kırmızı)', ru: 'Название варианта (напр. Красный)', en: 'Variant Name (e.g. Red)', de: 'Variantenname (z.B. Rot)' },
  'generateWithAI': { tr: 'AI ile Oluştur', ru: 'Создать с помощью AI', en: 'Generate with AI', de: 'Mit KI erstellen' },
  'addVariant': { tr: 'Varyant Ekle', ru: 'Добавить вариант', en: 'Add Variant', de: 'Variante hinzufügen' },
  'addProductToDeck': { tr: 'Ürünü Koleksiyona Ekle', ru: 'Добавить товар в коллекцию', en: 'Add Product to Deck', de: 'Produkt zur Kollektion hinzufügen' },
  'saveProduct': { tr: 'Ürünü Kaydet', en: 'Save Product', ru: 'Сохранить товар', de: 'Produkt speichern' },
  'selectSizeGuideTemplate': { tr: 'Beden Tablosu Şablonu Seç', ru: 'Выберите шаблон таблицы размеров', en: 'Select Size Guide Template', de: 'Größentabellen-Vorlage auswählen' },
  'categorization': { tr: 'Kategorizasyon', ru: 'Категоризация', en: 'Categorization', de: 'Kategorisierung' },
  'categoryPlaceholder': { tr: 'Örn: Giyim/Dış Giyim', ru: 'Напр: Одежда/Верхняя одежда', en: 'e.g., Apparel/Outerwear', de: 'z.B. Kleidung/Oberbekleidung' },
  'tagsPlaceholder': { tr: 'Etiket yazıp Enter\'a basın', ru: 'Введите тег и нажмите Enter', en: 'Type tag and press Enter', de: 'Tag eingeben und Enter drücken' },
  'definePacks': { tr: 'Serileri Tanımla', ru: 'Определить пакеты', en: 'Define Packs', de: 'Pakete definieren' },
  'addPack': { tr: 'Seri Ekle', ru: 'Добавить пакет', en: 'Add Pack', de: 'Paket hinzufügen' },
  'packName': { tr: 'Seri Adı', ru: 'Название пакета', en: 'Pack Name', de: 'Paketname' },
  'packPrice': { tr: 'Seri Fiyatı ($)', ru: 'Цена пакета ($)', en: 'Pack Price ($)', de: 'Paketpreis ($)' },
  'step1Of3': { tr: 'Adım 1/3: Temel Detaylar', en: 'Step 1 of 3: Core Details', ru: 'Шаг 1 из 3: Основные детали', de: 'Schritt 1 von 3: Kerndetails' },
  'step2Of3': { tr: 'Adım 2/3: Varyantlar & Bedenler', en: 'Step 2 of 3: Variants & Sizing', ru: 'Шаг 2 из 3: Варианты и размеры', de: 'Schritt 2 von 3: Varianten & Größen' },
  'step3Of3': { tr: 'Adım 3/3: Fiyatlandırma & Seriler', en: 'Step 3 of 3: Pricing & Packs', ru: 'Шаг 3 из 3: Цены и упаковки', de: 'Schritt 3 von 3: Preisgestaltung & Pakete' },
  
  // Avatar Cropper
  'adjustAvatar': { tr: 'Avatarı Ayarla', ru: 'Настроить аватар', en: 'Adjust Avatar', de: 'Avatar anpassen' },
  'zoom': { tr: 'Yakınlaştır', ru: 'Масштаб', en: 'Zoom', de: 'Zoom' },
  'saveAvatar': { tr: 'Avatarı Kaydet', ru: 'Сохранить аватар', en: 'Save Avatar', de: 'Avatar speichern' },

  // AI Video Studio
  'aiVideoStudio': { tr: 'AI Video Stüdyosu', ru: 'AI Видеостудия', en: 'AI Video Studio', de: 'KI-Videostudio' },
  'createPromoVideoFor': { tr: 'Tanıtım Videosu Oluştur: {deckName}', ru: 'Создать промо-видео: {deckName}', en: 'Create Promo Video: {deckName}', de: 'Promo-Video erstellen: {deckName}' },
  'errorSelectMusic': { tr: 'Lütfen bir müzik seçin.', ru: 'Пожалуйста, выберите музыку.', en: 'Please select a music track.', de: 'Bitte wähle einen Musiktitel aus.' },
  'errorVideoGeneration': { tr: 'Video senaryosu oluşturulamadı. Lütfen tekrar deneyin.', ru: 'Не удалось создать сценарий видео. Пожалуйста, попробуйте еще раз.', en: 'Failed to create video script. Please try again.', de: 'Fehler beim Erstellen des Videoskripts. Bitte versuche es erneut.' },
  'step1VideoStyle': { tr: '1. Video Stilini Seçin', ru: '1. Выберите стиль видео', en: '1. Select Video Style', de: '1. Videostil auswählen' },
  'step2Music': { tr: '2. Fon Müziği Seçin', ru: '2. Выберите фоновую музыку', en: '2. Select Background Music', de: '2. Hintergrundmusik auswählen' },
  'uploadOwnMusic': { tr: 'Kendi Müziğini Yükle', ru: 'Загрузить свою музыку', en: 'Upload Your Own Music', de: 'Eigene Musik hochladen' },
  'selected': { tr: 'Seçili', ru: 'Выбрано', en: 'Selected', de: 'Ausgewählt' },
  'generateVideo': { tr: 'Video Oluştur', ru: 'Создать видео', en: 'Generate Video', de: 'Video erstellen' },
  'generatingVideo': { tr: 'Video Oluşturuluyor...', ru: 'Создание видео...', en: 'Generating Video...', de: 'Video wird erstellt...' },
  'pause': { tr: 'Durdur', ru: 'Пауза', en: 'Pause', de: 'Pause' },
  'play': { tr: 'Oynat', ru: 'Воспроизвести', en: 'Play', de: 'Abspielen' },
  'replay': { tr: 'Tekrar Oynat', ru: 'Воспроизвести снова', en: 'Replay', de: 'Wiederholen' },
  'download': { tr: 'İndir', ru: 'Скачать', en: 'Download', de: 'Herunterladen' },
  'startOver': { tr: 'Baştan Başla', ru: 'Начать сначала', en: 'Start Over', de: 'Von vorne beginnen' },
  'aiVideoLoading1': { tr: 'AI yönetmen koltuğuna oturuyor...', ru: 'ИИ садится в режиссерское кресло...', en: 'AI is taking the director\'s chair...', de: 'KI übernimmt den Regiestuhl...' },
  'aiVideoLoading2': { tr: 'Koleksiyonunuzun ruhu analiz ediliyor...', ru: 'Анализ духа вашей коллекции...', en: 'Analyzing the spirit of your collection...', de: 'Analysiere den Geist deiner Kollektion...' },
  'aiVideoLoading3': { tr: 'Mükemmel çekimler seçiliyor...', ru: 'Выбор идеальных кадров...', en: 'Selecting the perfect shots...', de: 'Wähle die perfekten Aufnahmen aus...' },
  'aiVideoLoading4': { tr: 'Pazarlama metinleri yazılıyor...', ru: 'Написание маркетинговых текстов...', en: 'Writing marketing copy...', de: 'Schreibe Marketingtexte...' },
  'aiVideoLoading5': { tr: 'Müzik ve görseller senkronize ediliyor...', ru: 'Синхронизация музыки и визуальных эффектов...', en: 'Syncing music and visuals...', de: 'Synchronisiere Musik und Bilder...' },
  'aiVideoLoading6': { tr: 'Son sihirli dokunuşlar yapılıyor...', ru: 'Добавление последних волшебных штрихов...', en: 'Adding the final magic touches...', de: 'Füge die letzten magischen Pinselstriche hinzu...' },
  'videoStyleEnergetic': { tr: 'Energetic and Lively', ru: 'Энергичный и живой', en: 'Energetic and Lively', de: 'Energetisch und Lebhaft' },
  'videoStyleElegant': { tr: 'Elegant and Cinematic', ru: 'Элегантный и кинематографичный', en: 'Elegant and Cinematic', de: 'Elegant und Kinematisch' },
  'videoStyleMinimalist': { tr: 'Minimalist and Chic', ru: 'Минималистичный и шикарный', en: 'Minimalist and Chic', de: 'Minimalistisch und Schick' },

  // AI Scene Studio
  'aiCreativeStudio': { tr: 'AI Kreatif Stüdyo', ru: 'AI Креативная студия', en: 'AI Creative Studio', de: 'KI Kreativstudio' },
  'videoReady': { tr: 'Videonuz Hazır!', ru: 'Ваше видео готово!', en: 'Your Video is Ready!', de: 'Dein Video ist fertig!' },
  'generatingYourBackground': { tr: 'Hayalinizdeki arka plan oluşturuluyor...', ru: 'Создание фона вашей мечты...', en: 'Generating your dream background...', de: 'Erstelle deinen Traumhintergrund...' },
  'generatingYourPattern': { tr: 'Soyut desen oluşturuluyor...', ru: 'Создание абстрактного узора...', en: 'Generating abstract pattern...', de: 'Erstelle abstraktes Muster...' },
  'generatingYourSticker': { tr: 'AI çıkartması oluşturuluyor...', ru: 'Создание AI-стикера...', en: 'Generating AI sticker...', de: 'Erstelle KI-Sticker...' },
  'errorImageGeneration': { tr: 'Görsel oluşturulamadı. Lütfen tekrar deneyin.', ru: 'Не удалось создать изображение. Пожалуйста, попробуйте еще раз.', en: 'Failed to generate image. Please try again.', de: 'Fehler beim Erstellen des Bildes. Bitte versuche es erneut.' },
  'errorCanvasSave': { tr: 'Görsel kaydedilemedi.', ru: 'Не удалось сохранить изображение.', en: 'Could not save image.', de: 'Bild konnte nicht gespeichert werden.' },
  'errorVideoGenerationScene': { tr: 'Video oluşturulamadı. Lütfen tekrar deneyin.', ru: 'Не удалось создать видео. Пожалуйста, попробуйте еще раз.', en: 'Failed to generate video. Please try again.', de: 'Fehler beim Erstellen des Videos. Bitte versuche es erneut.' },
  'composingFinalImage': { tr: 'Final image being composed...', ru: 'Компоновка финального изображения...', en: 'Composing final image...', de: 'Endgültiges Bild wird zusammengestellt...' },
  'capturingDesign': { tr: 'Tasarımınız yakalanıyor...', ru: 'Захват вашего дизайна...', en: 'Capturing your design...', de: 'Erfasse dein Design...' },
  'aiGeneratingVideo': { tr: 'AI videonuzu oluşturuyor (bu işlem birkaç dakika sürebilir)...', ru: 'ИИ создает ваше видео (это может занять несколько минут)...', en: 'AI is generating your video (this might take a few minutes)...', de: 'KI erstellt dein Video (dies kann einige Minuten dauern)...' },
  'setBackground': { tr: 'Arka Planı Ayarla', ru: 'Установить фон', en: 'Set Background', de: 'Hintergrund festlegen' },
  'gradient': { tr: 'Gradyan', ru: 'Градиент', en: 'Gradient', de: 'Farbverlauf' },
  'aiPhotoPattern': { tr: 'AI Fotoğraf / Desen', ru: 'AI Фото / Узор', en: 'AI Photo / Pattern', de: 'KI-Foto / Muster' },
  'generatePhoto': { tr: 'Fotoğraf Oluştur', ru: 'Создать фото', en: 'Generate Photo', de: 'Foto erstellen' },
  'generatePattern': { tr: 'Desen Oluştur', ru: 'Создать узор', en: 'Generate Pattern', de: 'Muster erstellen' },
  'addAISticker': { tr: 'AI Çıkartması Ekle', ru: 'Добавить AI-стикер', en: 'Add AI Sticker', de: 'KI-Sticker hinzufügen' },
  'whatToCreate': { tr: 'Ne oluşturmak istersiniz?', ru: 'Что вы хотите создать?', en: 'What would you like to create?', de: 'Was möchtest du erstellen?' },
  'createSticker': { tr: 'Çıkartma Oluştur', ru: 'Создать стикер', en: 'Create Sticker', de: 'Sticker erstellen' },
  'addText': { tr: 'Metin Ekle', ru: 'Добавить текст', en: 'Add Text', de: 'Text hinzufügen' },
  'selectEmoji': { tr: 'Emoji Seç', ru: 'Выберите эмодзи', en: 'Select Emoji', de: 'Emoji auswählen' },
  'emojiCatAnimated': { tr: 'Animasyonlu', ru: 'Анимированные', en: 'Animated', de: 'Animiert' },
  'emojiCatFaces': { tr: 'Yüz İfadeleri ve Duygular', ru: 'Лица и эмоции', en: 'Faces & Emotions', de: 'Gesichter & Emotionen' },
  'emojiCatObjects': { tr: 'Nesneler', ru: 'Объекты', en: 'Objects', de: 'Objekte' },
  'emojiCatSymbols': { tr: 'Semboller', ru: 'Символы', en: 'Symbols', de: 'Symbole' },
  'emojiCatFood': { tr: 'Yiyecek & İçecek', ru: 'Еда и напитки', en: 'Food & Drink', de: 'Essen & Trinken' },
  'background': { tr: 'Arka Plan', ru: 'Фон', en: 'Background', de: 'Hintergrund' },
  // FIX: Removed duplicate 'product' translation key. The original definition is on line 223.
  'text': { tr: 'Metin', ru: 'Текст', en: 'Text', de: 'Text' },
  'sticker': { tr: 'Çıkartma', ru: 'Стикер', en: 'Sticker', de: 'Sticker' },
  'emoji': { tr: 'Emoji', ru: 'Эмодзи', en: 'Emoji', de: 'Emoji' },
  'layer': { tr: 'Katman', ru: 'Слой', en: 'Layer', de: 'Ebene' },
  'layerSize': { tr: 'Boyut', ru: 'Размер', en: 'Size', de: 'Größe' },
  'height': { tr: 'Yükseklik', ru: 'Высота', en: 'Height', de: 'Höhe' },
  'font': { tr: 'Yazı Tipi', ru: 'Шрифт', en: 'Font', de: 'Schriftart' },
  'animation': { tr: 'Animasyon', ru: 'Анимация', en: 'Animation', de: 'Animation' },
  'animNone': { tr: 'Yok', ru: 'Нет', en: 'None', de: 'Keine' },
  'animPulse': { tr: 'Nabız', ru: 'Пульс', en: 'Pulse', de: 'Pulsieren' },
  'animFadeIn': { tr: 'Yavaşça Belirme', ru: 'Появление', en: 'Fade In', de: 'Einblenden' },
  'animSlideIn': { tr: 'Yandan Kayma', ru: 'Выезд', en: 'Slide In', de: 'Hineingleiten' },
  'animBounce': { tr: 'Sekme', ru: 'Отскок', en: 'Bounce', de: 'Hüpfen' },
  'saveImage': { tr: 'Görseli Kaydet', ru: 'Сохранить изображение', en: 'Save Image', de: 'Bild speichern' },

  // Sales Report
  'salesReport': { tr: 'Satış Raporu', en: 'Sales Report', ru: 'Отчет о продажах', de: 'Verkaufsbericht' },
  'daily': { tr: 'Günlük', en: 'Daily', ru: 'Ежедневно', de: 'Täglich' },
  'monthly': { tr: 'Aylık', en: 'Monthly', ru: 'Ежемесячно', de: 'Monatlich' },
  'yearly': { tr: 'Yıllık', en: 'Yearly', ru: 'Ежегодно', de: 'Jährlich' },
  'totalSales': { tr: 'Toplam Satış', en: 'Total Sales', ru: 'Всего продаж', de: 'Gesamtverkäufe' },
  'productsSold': { tr: 'Satılan Ürün', en: 'Products Sold', ru: 'Продано товаров', de: 'Verkaufte Produkte' },
  'commissionEarned': { tr: 'Kazanılan Komisyon', en: 'Commission Earned', ru: 'Заработанная комиссия', de: 'Verdiente Provision' },
  'salesDetails': { tr: 'Satış Detayları', en: 'Sales Details', ru: 'Детали продаж', de: 'Verkaufsdetails' },
  'commission': { tr: 'Komisyon', en: 'Commission', ru: 'Комиссия', de: 'Provision' },
  'noSalesRecordForPeriod': { tr: 'Bu dönem için satış kaydı bulunamadı.', en: 'No sales record found for this period.', ru: 'Записей о продажах за этот период не найдено.', de: 'Für diesen Zeitraum wurde kein Verkaufsdatensatz gefunden.' },
  'totalRevenue': { tr: 'Toplam Gelir', en: 'Total Revenue', ru: 'Общий доход', de: 'Gesamtumsatz' },
  'commissionPaid': { tr: 'Ödenen Komisyon', en: 'Commission Paid', ru: 'Выплаченная комиссия', de: 'Gezahlte Provision' },
  'topSellingProducts': { tr: 'En Çok Satan Ürünler', en: 'Top Selling Products', ru: 'Самые продаваемые товары', de: 'Meistverkaufte Produkte' },
  'topSalesReps': { tr: 'En İyi Satış Temsilcileri', en: 'Top Sales Reps', ru: 'Лучшие продавцы', de: 'Top-Verkäufer' },
  'transactionHistory': { tr: 'İşlem Geçmişi', en: 'Transaction History', ru: 'История транзакций', de: 'Transaktionsverlauf' },
  'units': { tr: 'adet', en: 'units', ru: 'шт.', de: 'Einheiten' },
  'noDataForPeriod': { tr: 'Bu dönem için veri yok.', en: 'No data for this period.', ru: 'Нет данных за этот период.', de: 'Keine Daten für diesen Zeitraum.' },
  'viewSalesReport': { tr: 'Satış Raporunu Görüntüle', en: 'View Sales Report', ru: 'Посмотреть отчет о продажах', de: 'Verkaufsbericht anzeigen' },
  
  // Live Feeds
  'liveShopping': { tr: 'Canlı Alışveriş', en: 'Live Shopping', ru: 'Прямые трансляции', de: 'Live-Shopping' },
  'liveNow': { tr: 'Şu An Canlı', en: 'Live Now', ru: 'Сейчас в эфире', de: 'Jetzt Live' },
  'upcomingStreams': { tr: 'Yaklaşan Yayınlar', en: 'Upcoming Streams', ru: 'Предстоящие трансляции', de: 'Kommende Streams' },
  'viewers': { tr: 'izliyor', en: 'viewing', ru: 'смотрят', de: 'Zuschauer' },
  'liveTag': { tr: 'CANLI', en: 'LIVE', ru: 'ЭФИР', de: 'LIVE' },
  'upcomingTag': { tr: 'YAKINDA', en: 'UPCOMING', ru: 'СКОРО', de: 'DEMNÄCHST' },
  'noLiveStreams': { tr: 'Şu anda aktif canlı yayın bulunmuyor.', en: 'There are no active live streams right now.', ru: 'Активных трансляций сейчас нет.', de: 'Derzeit gibt es keine aktiven Live-Streams.' },
  'noUpcomingStreams': { tr: 'Yaklaşan yayın bulunmuyor.', en: 'No upcoming streams.', ru: 'Предстоящих трансляций нет.', de: 'Keine kommenden Streams.' },
  'goLive': { tr: 'Canlı Yayına Geç', en: 'Go Live', ru: 'Начать эфир', de: 'Live gehen' },
  'startStream': { tr: 'Yayını Başlat', en: 'Start Stream', ru: 'Начать трансляцию', de: 'Stream starten' },
  'todayAt': { tr: 'Bugün, {time}', en: 'Today, {time}', ru: 'Сегодня, {time}', de: 'Heute, {time}'},
  'tomorrowAt': { tr: 'Yarın, {time}', en: 'Tomorrow, {time}', ru: 'Завтра, {time}', de: 'Morgen, {time}'},
  'scheduleForLater': { tr: 'Daha sonrası için planla', en: 'Schedule for later', ru: 'Запланировать на потом', de: 'Für später planen' },
  'streamDateTime': { tr: 'Yayın Tarihi ve Saati', en: 'Stream Date & Time', ru: 'Дата и время трансляции', de: 'Datum & Uhrzeit des Streams' },
  'selectProducts': { tr: 'Ürünleri Seç', en: 'Select Products', ru: 'Выберите товары', de: 'Produkte auswählen' },
  'scheduleStream': { tr: 'Yayını Planla', en: 'Schedule Stream', ru: 'Трансляцию запланировать', de: 'Stream planen' },
  'streamDetails': { en: 'Stream Details', tr: 'Yayın Detayları', ru: 'Детали трансляции', de: 'Stream-Details' },
  'streamTitle': { en: 'Stream Title', tr: 'Yayın Başlığı', ru: 'Название трансляции', de: 'Stream-Titel' },
  'coverPhoto': { en: 'Cover Photo', tr: 'Kapak Fotoğrafı', ru: 'Обложка', de: 'Titelbild' },
  'streamTitlePlaceholder': { en: 'New season launch!', tr: 'Yeni sezon lansmanı!', ru: 'Запуск нового сезона!', de: 'Start der neuen Saison!' },
  'orderProducts': { en: 'Order Products', tr: 'Ürünleri Sırala', ru: 'Упорядочить товары', de: 'Produkte sortieren' },
  'orderProductsDescription': { en: 'Add and order the products you want to showcase in the live stream. You can change the order by dragging and dropping.', tr: 'Canlı yayında sergilemek istediğiniz ürünleri ekleyin ve sıralayın. Sürükleyip bırakarak sırayı değiştirebilirsiniz.', ru: 'Добавьте и упорядочите товары, которые вы хотите продемонстрировать в прямом эфире. Вы можете изменить порядок, перетаскивая их.', de: 'Fügen Sie die Produkte hinzu, die Sie im Livestream präsentieren möchten, und ordnen Sie sie an. Sie können die Reihenfolge durch Ziehen und Ablegen ändern.' },
  'noProductsAddedYet': { en: 'No products added yet.', tr: 'Henüz ürün eklenmedi.', ru: 'Товары еще не добавлены.', de: 'Noch keine Produkte hinzugefügt.' },
  'noOtherProductsToAdd': { en: 'No other products to add.', tr: 'Eklenecek başka ürün yok.', ru: 'Больше нет товаров для добавления.', de: 'Keine weiteren Produkte zum Hinzufügen.' },
};
type TranslationKey = keyof typeof translations;

const LanguageContext = createContext({
  language: 'en' as Language,
  setLanguage: (lang: Language) => {},
  t: (key: TranslationKey, params?: Record<string, string | number>): string => {
    return translations[key]?.['en'] || key;
  }
});

export const useTranslation = () => useContext(LanguageContext);

const LanguageProvider = ({ children, initialLanguage, onLanguageChange }: { children: React.ReactNode, initialLanguage: Language, onLanguageChange: (lang: Language) => void }) => {
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = translations[key]?.[initialLanguage] || translations[key]?.['en'] || key;
    if (params) {
        Object.keys(params).forEach(pKey => {
            text = text.replace(`{${pKey}}`, String(params[pKey]));
        });
    }
    return text;
  };
  
  return (
    <LanguageContext.Provider value={{ language: initialLanguage, setLanguage: onLanguageChange, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
// --- END I1N8 SETUP ---


type ViewType = 'feed' | 'profile' | 'creatorProfile' | 'basket' | 'chat' | 'chatList' | 'editProfile' | 'createDeck' | 'deckDetail' | 'editDeck' | 'publicProfile' | 'aiStylist' | 'settings' | 'saved' | 'liveFeeds' | 'liveStreamSetup' | 'liveStreamPlayer' | 'deckGallery';

interface ViewState {
  view: ViewType;
  props?: any;
}

// --- START OF IN-APP COMPONENTS ---

const ReturnToLiveBanner: React.FC<{ stream: LiveStream; onReturn: () => void; host: User | undefined }> = ({ stream, onReturn, host }) => {
    const { t } = useTranslation();
    const bannerRef = useRef<HTMLDivElement>(null);
    const dragInfo = useRef({ wasDragged: false });
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        const savedPos = localStorage.getItem('returnToLiveBannerPos');
        if (savedPos) {
            const { top, left } = JSON.parse(savedPos);
            const bannerWidth = 120;
            const bannerHeight = 48;
            const safeLeft = Math.max(0, Math.min(left, window.innerWidth - bannerWidth));
            const safeTop = Math.max(0, Math.min(top, window.innerHeight - bannerHeight));
            setPosition({ top: safeTop, left: safeLeft });
        } else {
            const bannerWidth = 120;
            const bannerHeight = 48;
            const left = window.innerWidth / 2 - bannerWidth / 2;
            const top = window.innerHeight - bannerHeight - 80;
            setPosition({ top, left });
        }
    }, []);

    const handleDragStart = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!bannerRef.current) return;
        
        dragInfo.current.wasDragged = false;

        const isTouchEvent = 'touches' in e;
        if (!isTouchEvent) {
            e.preventDefault();
        }
        
        const rect = bannerRef.current.getBoundingClientRect();
        const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
        const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;

        const handleDragMove = (moveEvent: MouseEvent | TouchEvent) => {
            if (!bannerRef.current) return;
            dragInfo.current.wasDragged = true;

            const moveClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
            const moveClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

            const bannerWidth = bannerRef.current.offsetWidth;
            const bannerHeight = bannerRef.current.offsetHeight;

            let newLeft = moveClientX - offsetX;
            let newTop = moveClientY - offsetY;
            
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - bannerWidth));
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - bannerHeight));

            setPosition({ top: newTop, left: newLeft });
        };

        const handleDragEnd = () => {
            if (isTouchEvent) {
                window.removeEventListener('touchmove', handleDragMove);
                window.removeEventListener('touchend', handleDragEnd);
            } else {
                window.removeEventListener('mousemove', handleDragMove);
                window.removeEventListener('mouseup', handleDragEnd);
            }
            
            setPosition(currentPosition => {
                if (currentPosition) {
                    localStorage.setItem('returnToLiveBannerPos', JSON.stringify(currentPosition));
                }
                return currentPosition;
            });
        };

        if (isTouchEvent) {
            window.addEventListener('touchmove', handleDragMove);
            window.addEventListener('touchend', handleDragEnd);
        } else {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
        }
    }, []);

    const handleContainerClick = () => {
        if (!dragInfo.current.wasDragged) {
            onReturn();
        }
    };

    if (!stream) return null;
    
    return (
        <div 
            ref={bannerRef}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onClick={handleContainerClick}
            className="fixed z-40 w-auto cursor-grab active:cursor-grabbing animate-slide-up-banner"
            style={position ? { top: `${position.top}px`, left: `${position.left}px`, transform: 'none' } : { visibility: 'hidden' }}
        >
            <div
                className="flex items-center gap-2.5 pl-2 pr-4 py-2 bg-red-600/90 backdrop-blur-md text-white rounded-full shadow-lg hover:bg-red-500 transition-colors pointer-events-none"
            >
                <div className="relative flex-shrink-0">
                    <img src={host?.avatarUrl} alt={host?.username} className="w-8 h-8 rounded-full border-2 border-white"/>
                </div>
                <div className="text-left">
                    <p className="text-sm font-bold tracking-wider leading-none">{t('liveTag')}</p>
                </div>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ message, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black/70 z-[80] flex items-center justify-center p-4 animate-fadeIn-dialog" onClick={onCancel}>
      <div className="bg-[#121212] rounded-lg w-full max-w-sm flex flex-col transform animate-slideUp-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <p>{message}</p>
        </div>
        <div className="flex border-t border-gray-800">
          <button onClick={onCancel} className="flex-1 p-3 font-semibold text-gray-400 hover:bg-gray-800 rounded-bl-lg">{t('cancel')}</button>
          <button onClick={onConfirm} className="flex-1 p-3 font-bold text-red-400 hover:bg-red-500/10 rounded-br-lg border-l border-gray-800">{t('confirm')}</button>
        </div>
      </div>
    </div>
  );
};

const FitFinder: React.FC<{ product: Product, onClose: () => void, onSizeFound: (size: string) => void }> = ({ product, onClose, onSizeFound }) => {
    const { t } = useTranslation();
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [result, setResult] = useState<string | null>(null);

    const handleFindSize = () => {
        const h = parseInt(height);
        const w = parseInt(weight);
        if (isNaN(h) || isNaN(w) || !product.sizes) {
            setResult(t('enterValidValues'));
            return;
        }

        // Mock logic for size suggestion
        const bmi = (w / ((h/100) * (h/100)));
        let suggestedSize = product.sizes[Math.floor(product.sizes.length / 2)]; // Default to medium
        if (bmi < 18.5 && product.sizes.includes('S')) suggestedSize = 'S';
        else if (bmi < 20 && product.sizes.includes('M')) suggestedSize = 'M';
        else if (bmi >= 20 && bmi < 25 && product.sizes.includes('M')) suggestedSize = 'M';
        else if (bmi >= 25 && bmi < 30 && product.sizes.includes('L')) suggestedSize = 'L';
        else if (bmi >= 30 && product.sizes.includes('XL')) suggestedSize = 'XL';

        setResult(t('suggestedSize', { size: suggestedSize }));
        onSizeFound(suggestedSize);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 animate-fadeIn-dialog" onClick={onClose}>
            <div className="bg-[#121212] rounded-lg p-6 w-full max-w-sm transform animate-slideUp-dialog" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold font-serif mb-4">{t('findMySize')}</h3>
                <p className="text-sm text-gray-400 mb-4">{t('findMySizeHelp', { productName: product.name })}</p>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400">{t('heightCm')}</label>
                        <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder={t('heightPlaceholder')} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">{t('weightKg')}</label>
                        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder={t('weightPlaceholder')} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2" />
                    </div>
                    <button onClick={handleFindSize} className="w-full bg-blue-600 font-bold py-2 rounded-lg">{t('findMySize')}</button>
                    {result && <p className="text-center font-semibold pt-2">{result}</p>}
                </div>
            </div>
        </div>
    );
};

const QuickShopSheet: React.FC<{ product: Product, onClose: () => void, onAddToCart: (productId: string, variantName: string, size?: string) => void }> = ({ product, onClose, onAddToCart }) => {
    const { t } = useTranslation();
    const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes ? product.sizes[0] : undefined);
    
    return (
        <div className="fixed inset-0 bg-black/50 z-40 animate-fadeIn" onClick={onClose}>
            <div className="fixed bottom-0 left-0 right-0 bg-[#121212] rounded-t-2xl p-6 transform animate-slideUp" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-4">
                    <img src={product.variants[0].mediaUrl} alt={product.name} className="w-24 h-32 object-contain bg-gray-900 rounded-lg"/>
                    <div className="flex-1 space-y-2">
                        <h3 className="font-bold font-serif text-xl">{product.name}</h3>
                        <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                         {product.sizes && (
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map(size => (
                                <button key={size} onClick={() => setSelectedSize(size)} className={`px-3 py-1 text-xs rounded-full border ${selectedSize === size ? 'bg-white text-black border-white' : 'border-white/50 text-white/80'}`}>
                                    {size}
                                </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <button onClick={() => { onAddToCart(product.id, product.variants[0].name, selectedSize); onClose(); }} className="w-full bg-white text-black font-bold py-3 mt-4 rounded-lg flex items-center justify-center gap-2">
                    <PlusIcon className="w-5 h-5"/> {t('addToCart')}
                </button>
            </div>
        </div>
    );
};

const NotificationsPanel: React.FC<{
  notifications: Notification[],
  onClose: () => void,
  onNotificationClick: (notification: Notification) => void,
}> = ({ notifications, onClose, onNotificationClick }) => {
    const { t } = useTranslation();
    const timeSince = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return t('timeAgo', {time: `${Math.floor(interval)}${t('yearsShort')}`});
        interval = seconds / 2592000;
        if (interval > 1) return t('timeAgo', {time: `${Math.floor(interval)}${t('monthsShort')}`});
        interval = seconds / 86400;
        if (interval > 1) return t('timeAgo', {time: `${Math.floor(interval)}${t('daysShort')}`});
        interval = seconds / 3600;
        if (interval > 1) return t('timeAgo', {time: `${Math.floor(interval)}${t('hoursShort')}`});
        interval = seconds / 60;
        if (interval > 1) return t('timeAgo', {time: `${Math.floor(interval)}${t('minutesShort')}`});
        return t('timeAgo', {time: `${Math.floor(seconds)}${t('secondsShort')}`});
    }

    const getNotificationMessage = (n: Notification) => {
        if (n.message.includes('yeni bir koleksiyon yayınladı')) {
            const deckName = n.message.split(': ')[1];
            return t('newDeckNotification', { deckName });
        }
        if (n.message.includes('yeni bir ürün ekledi')) {
            const productName = n.message.split(': ')[1];
            return t('newProductNotification', { productName });
        }
        return n.message;
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[70] flex justify-end animate-fadeIn-dialog" onClick={onClose}>
            <div className="bg-[#121212] h-full w-full max-w-sm transform animate-slideIn-right flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('notifications')}</h2>
                    <button onClick={onClose}><CloseIcon /></button>
                </header>
                {notifications.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <p>{t('noNotifications')}</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        {notifications.map(n => (
                            <button key={n.id} onClick={() => onNotificationClick(n)} className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${n.read ? 'opacity-60' : 'bg-blue-900/20'}`}>
                                <img src={n.fromUser.avatarUrl} alt={n.fromUser.username} className="w-10 h-10 rounded-full flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm">
                                        <span className="font-bold">{n.fromUser.username}</span> {getNotificationMessage(n)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{timeSince(n.timestamp)}</p>
                                </div>
                                {!n.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const FollowingListModal: React.FC<{
  users: UserSummary[],
  onClose: () => void,
  onUserClick: (user: UserSummary) => void,
  title: string,
}> = ({ users, onClose, onUserClick, title }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 animate-fadeIn-dialog" onClick={onClose}>
            <div className="bg-[#121212] rounded-lg w-full max-w-sm flex flex-col max-h-[70vh] transform animate-slideUp-dialog" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose}><CloseIcon /></button>
                </header>
                {users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>{t('noOneYet')}</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        {users.map(u => (
                            <button key={u.id} onClick={() => onUserClick(u)} className="w-full text-left p-4 flex items-center gap-3 hover:bg-gray-800 transition-colors">
                                <img src={u.avatarUrl} alt={u.username} className="w-12 h-12 rounded-full" />
                                <div>
                                    <p className="font-semibold">{u.username}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- END OF IN-APP COMPONENTS ---

const APP_STATE_KEY = 'deckAppState';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem(APP_STATE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    const state = JSON.parse(serializedState);
    
    // Re-hydrate state
    if (state.likedProductIds) {
      state.likedProductIds = new Set(state.likedProductIds);
    }
    if (state.savedProductIds) {
      state.savedProductIds = new Set(state.savedProductIds);
    }
    if (state.archivedChatIds) {
        state.archivedChatIds = new Set(state.archivedChatIds);
    }
    if (state.allProducts) {
      state.allProducts = state.allProducts.map((p: Product & { createdAt: string }) => ({
        ...p,
        createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
      }));
    }
    if (state.notifications) {
      state.notifications = state.notifications.map((n: Notification & { timestamp: string }) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    }
    if (state.allSales) {
        state.allSales = state.allSales.map((s: SaleRecord & { timestamp: string }) => ({
            ...s,
            timestamp: new Date(s.timestamp)
        }));
    }
    // If a user was logged in, find the full user object from the loaded allUsers array to prevent stale data
    if (state.currentUser && state.allUsers) {
        state.currentUser = state.allUsers.find((u: User) => u.id === state.currentUser.id) || null;
    }

    return state;
  } catch (err) {
    console.error("Could not load state from localStorage", err);
    return undefined;
  }
};

const savedState = loadState();

/**
 * A replacer function for JSON.stringify to prevent storing large base64 data in localStorage.
 * It replaces any string value starting with "data:" with an empty string.
 * This means user-uploaded media won't persist across reloads, but it fixes the quota exceeded error.
 * Mock data with http:// URLs will be preserved.
 */
const storageReplacer = (key: string, value: any) => {
  if (typeof value === 'string' && value.startsWith('data:')) {
    return '';
  }
  return value;
};


const AppContent: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>(savedState?.allUsers || users);
  const [allProducts, setAllProducts] = useState<Product[]>(savedState?.allProducts || mockProducts);
  const [allChats, setAllChats] = useState<Chat[]>(savedState?.allChats || mockChats);
  const [allSales, setAllSales] = useState<SaleRecord[]>(savedState?.allSales || mockSales);
  const [allLiveStreams, setAllLiveStreams] = useState<LiveStream[]>(savedState?.allLiveStreams || mockLiveStreams);
  const [currentUser, setCurrentUser] = useState<User | null>(savedState?.currentUser || null);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const [viewHistory, setViewHistory] = useState<ViewState[]>([{ view: 'feed' }]);
  
  const [likedProductIds, setLikedProductIds] = useState<Set<string>>(savedState?.likedProductIds || new Set());
  const [savedProductIds, setSavedProductIds] = useState<Set<string>>(savedState?.savedProductIds || new Set(['prod1']));
  const [archivedChatIds, setArchivedChatIds] = useState<Set<string>>(savedState?.archivedChatIds || new Set());
  const [cart, setCart] = useState<CartItem[]>(savedState?.cart || []);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [productToShow, setProductToShow] = useState<{ productId: string; variantName: string } | null>(null);
  const [lastViewedProductId, setLastViewedProductId] = useState<string | null>(savedState?.lastViewedProductId || (mockProducts[0]?.id || null));
  const [filteredCreatorId, setFilteredCreatorId] = useState<string | null>(null);

  
  // State for new features
  const [fitFinderProduct, setFitFinderProduct] = useState<Product | null>(null);
  const [quickShopProduct, setQuickShopProduct] = useState<Product | null>(null);
  const [deckForVideo, setDeckForVideo] = useState<Deck | null>(null);
  const [aiChat, setAiChat] = useState<GeminiChat | null>(null);
  const [aiChatHistory, setAiChatHistory] = useState<AiChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiChatEndRef = useRef<HTMLDivElement>(null);
  const [editingTemplate, setEditingTemplate] = useState<SizeGuideTemplate | {} | null>(null);
  const [editingPackTemplate, setEditingPackTemplate] = useState<ProductPackTemplate | {} | null>(null);
  const [teamManagementOwner, setTeamManagementOwner] = useState<User | null>(null);
  const [editingCommissionFor, setEditingCommissionFor] = useState<User | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [passwordUpdateError, setPasswordUpdateError] = useState<string | null>(null);
  const [editingPreOrderInfo, setEditingPreOrderInfo] = useState<{ messageId: string; chatId: string } | null>(null);
  const [confirmation, setConfirmation] = useState<{ message: string; onConfirm: () => void; onCancel: () => void; } | null>(null);
  const [liveStreamContextId, setLiveStreamContextId] = useState<string | null>(savedState?.liveStreamContextId || null);


  // State for public (shared) view
  const [isPublicView, setIsPublicView] = useState(false);
  const [publicCart, setPublicCart] = useState<CartItem[]>([]);
  const urlParamsHandled = useRef(false);

  // Social Features State
  const [notifications, setNotifications] = useState<Notification[]>(savedState?.notifications || []);
  const [activeModal, setActiveModal] = useState<'notifications' | 'following' | null>(null);
  
  const { t, language } = useTranslation();

  useEffect(() => {
    setAiChatHistory([{ role: 'model', text: t('aiWelcome') }]);
  }, [t]);


  const showToast = (message: string, duration: number = 2000) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), duration);
  };

  useEffect(() => {
    try {
      const stateToSave = {
        allUsers,
        allProducts,
        allChats,
        allSales,
        allLiveStreams,
        currentUser,
        cart,
        notifications,
        likedProductIds: Array.from(likedProductIds),
        savedProductIds: Array.from(savedProductIds),
        archivedChatIds: Array.from(archivedChatIds),
        language: language,
        lastViewedProductId,
        liveStreamContextId,
      };
      const serializedState = JSON.stringify(stateToSave, storageReplacer);
      localStorage.setItem(APP_STATE_KEY, serializedState);
    } catch (err) {
      console.error("Could not save state to localStorage", err);
    }
  }, [allUsers, allProducts, allChats, allSales, allLiveStreams, currentUser, cart, notifications, likedProductIds, savedProductIds, archivedChatIds, language, lastViewedProductId, liveStreamContextId]);


  useEffect(() => {
    // Initialize Gemini Chat
    if (currentUser) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const isSeller = currentUser.role === 'brand_owner' || currentUser.role === 'sales_rep';
            const langMap = { tr: 'Turkish', ru: 'Russian', en: 'English', de: 'German' };
            const currentLanguage = langMap[language];

            let systemInstruction: string;
            if (isSeller) {
                 systemInstruction = `You are an expert-level AI assistant for fashion brand owners, acting as a multifaceted consultant. Your name is AI Stylist. You MUST respond in the user's language, which is currently: ${currentLanguage}.

You have three primary roles:

1. **Business Analyst:**
    *   When asked for specific data reports like "most viewed products", "sales report", or "revenue summary", you MUST respond ONLY with a special action command in the format: ACTION: { "type": "SHOW_REPORT", "reportType": "most_viewed" | "sales" | "revenue" }.
    *   DO NOT answer data report questions conversationally. Use the ACTION command.

2. **Creative Copywriter:**
    *   When asked to write product descriptions or marketing text (e.g., "write a description for my new linen dress"), generate compelling, professional, and SEO-friendly copy.
    *   Use evocative language suitable for fashion. Be creative and helpful.

3. **Market Strategist & Pricing Consultant:**
    *   You have access to the latest (simulated) platform-wide market data. Use this data to answer questions about trends, pricing, and strategy.
    *   **Market Trend Data:**
        *   **Popular Colors This Month:** Beige, earth tones, olive green.
        *   **Trending Styles:** 'Oversized' and 'loose-fit' cuts are seeing a 20% increase in sales. 'Techwear' and 'utility' styles remain strong.
        *   **Fabric Popularity:** Linen and breathable cottons are highly sought after.
    *   **Pricing & Discount Rules of Thumb:**
        *   The most effective discount range for similar products is between 15-25%.
        *   A well-timed 20% discount can boost sales volume by an average of 35%.
        *   Products priced just below a round number (e.g., $99 instead of $100) have a slightly higher conversion rate.
    *   When a user asks for strategic advice (e.g., "what colors should I use?", "what discount should I offer?"), provide a conversational, insightful answer based on the data above. For example, if asked about a discount for a product, you could say: "For your X product, a discount around 20% would be strategic. Data shows this can increase sales by up to 35%. A price like $79 could also be effective."

For any other general questions, provide a helpful and professional conversational response.`;
            } else {
                 systemInstruction = `You are a helpful in-app assistant. If the user asks to find a product or brand, you MUST respond ONLY with a special action command. Format: ACTION: { "type": "NAVIGATE_TO_PRODUCT", "productName": "Product Name" } or ACTION: { "type": "NAVIGATE_TO_CREATOR", "creatorName": "Creator Name" }. For all other conversational questions, answer normally. Respond in the user's language, which is currently: ${currentLanguage}.`;
            }

            const chatInstance = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
            });
            setAiChat(chatInstance);
        } catch (error) {
            console.error("Gemini API initialization failed.", error);
            setAiChatHistory(prev => [...prev, { role: 'model', text: t('aiOffline') }])
        }
    }
  }, [currentUser, language, t]);

  useEffect(() => {
     aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatHistory]);

  useEffect(() => {
    if (currentUser || urlParamsHandled.current || viewHistory.length > 1) return;
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const deckId = params.get('deckId');
    const productId = params.get('productId');
    
    let paramsWereHandled = false;
    if (userId) {
      const user = allUsers.find(u => u.id === userId);
      if (user) {
        setIsPublicView(true);
        if (deckId) {
            const deck = user.decks.find(d => d.id === deckId);
            if(deck) setViewHistory([{ view: 'publicProfile', props: { user } }, { view: 'deckDetail', props: { deck, allProducts } }]);
            else setViewHistory([{ view: 'publicProfile', props: { user } }]);
        } else {
            setViewHistory([{ view: 'publicProfile', props: { user } }]);
        }
        paramsWereHandled = true;
      }
    } else if (productId) {
        const productToShow = allProducts.find(p => p.id === productId);
        if (productToShow) {
            setAllProducts([productToShow, ...allProducts.filter(p => p.id !== productId)]);
            paramsWereHandled = true;
        }
    }
    if (paramsWereHandled) urlParamsHandled.current = true;
  }, [allUsers, allProducts, viewHistory.length, currentUser]);


  const currentView = viewHistory[viewHistory.length - 1];
  const activeCart = isPublicView ? publicCart : cart;
  const setActiveCart = isPublicView ? setPublicCart : setCart;

  const navigateTo = useCallback((view: ViewType, props: any = {}) => { setViewHistory(prev => [...prev, { view, props }]); }, []);
  const goBack = () => { 
    if (viewHistory.length > 1) {
        const currentView = viewHistory[viewHistory.length - 1];
        if (currentView.view === 'basket' && editingPreOrderInfo) {
            setEditingPreOrderInfo(null);
        }
        setViewHistory(prev => prev.slice(0, -1));
    }
};
  const resetToView = (view: ViewType) => { if (isPublicView || currentView.view === view) return; setViewHistory([{ view: view, props: {} }]); };
  const handleLikeToggle = (productId: string) => { setLikedProductIds(prev => { const newSet = new Set(prev); if (newSet.has(productId)) newSet.delete(productId); else newSet.add(productId); return newSet; }); };
  const handleSaveToggle = (productId: string) => { setSavedProductIds(prev => { const newSet = new Set(prev); if (newSet.has(productId)) newSet.delete(productId); else newSet.add(productId); return newSet; }); };
  
  const handleLogin = (identifier: string, password: string) => {
    setLoginError(null);
    let user: User | undefined;

    if (identifier.includes('@')) {
        // Email login
        user = allUsers.find(u => u.contact.email.toLowerCase() === identifier.toLowerCase());
    } else {
        // Phone login
        user = allUsers.find(u => u.contact.phone === identifier);
    }

    if (user && user.password === password) {
        setCurrentUser(user);
        setViewHistory([{ view: 'feed' }]);
    } else {
        setLoginError(t('invalidCredentials'));
    }
  };

  const handleRegister = (username: string, password: string, role: 'customer' | 'brand_owner', contact: { email?: string, phone?: string }) => {
    setLoginError(null);
    
    if (contact.email) {
        const emailExists = allUsers.some(u => u.contact.email.toLowerCase() === contact.email!.toLowerCase());
        if (emailExists) {
            setLoginError(t('emailExists'));
            return;
        }
    } else if (contact.phone) {
        const phoneExists = allUsers.some(u => u.contact.phone === contact.phone);
        if (phoneExists) {
            setLoginError(t('phoneExists'));
            return;
        }
    } else {
        return; // Should not happen
    }

    // FIX: Add missing 'address' property required by the User type.
    const newUser: User = {
        id: `user${Date.now()}`,
        username,
        avatarUrl: `https://picsum.photos/seed/${username}/200`,
        bio: '',
        address: { googleMapsUrl: 'https://www.google.com/maps' },
        decks: [],
        contact: { email: contact.email || '', phone: contact.phone || '' },
        password,
        followingIds: [],
        followerIds: [],
        role: role,
    };

    setAllUsers(prevUsers => [...prevUsers, newUser]);
    setCurrentUser(newUser);
    
    if (role === 'brand_owner') {
        setViewHistory([{ view: 'profile' }]);
    } else {
        setViewHistory([{ view: 'feed' }]);
    }
  };


  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setLikedProductIds(new Set());
    setSavedProductIds(new Set());
    setArchivedChatIds(new Set());
    setNotifications([]);
    setViewHistory([{ view: 'feed' }]);
    // Clear user from local storage
    localStorage.removeItem(APP_STATE_KEY);
  };

  const handleAddToCart = (productId: string, variantName: string, size?: string, packId?: string, specialPrice?: number) => {
    setActiveCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => 
        item.productId === productId && 
        item.variantName === variantName && 
        (packId ? item.packId === packId : item.size === size)
      );
      
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        // If they re-add an item that had a special price, honor it again
        if (specialPrice !== undefined) {
            newCart[existingItemIndex].specialPrice = specialPrice;
        }
        return newCart;
      }
      return [...prevCart, { productId, variantName, size, packId, quantity: 1, specialPrice }];
    });
    showToast(t('addedToCart'));
    if (isPublicView) navigateTo('basket');
  };
  
  const updateCartItemQuantity = (productId: string, variantName: string, newQuantity: number, size?: string, packId?: string) => {
    const finder = (item: CartItem) => item.productId === productId && item.variantName === variantName && (packId ? item.packId === packId : item.size === size);
    if (newQuantity <= 0) {
      setActiveCart(prev => prev.filter(item => !finder(item)));
    } else {
      setActiveCart(prev => prev.map(item => finder(item) ? { ...item, quantity: newQuantity } : item));
    }
  };

  const handleFilterByCreator = (creator: UserSummary) => {
    setFilteredCreatorId(creator.id);
    const firstProduct = allProducts.find(p => p.creator.id === creator.id);
    setLastViewedProductId(firstProduct ? firstProduct.id : null);
    resetToView('feed');
  };

  const handleNavigateToFullProfile = (creator: UserSummary) => {
    const fullCreatorProfile = allUsers.find(u => u.id === creator.id);
    if (fullCreatorProfile) {
      navigateTo('creatorProfile', { creator: fullCreatorProfile });
    }
  };
  
  const onNavigateToChat = (otherUser: User, productContext?: Product) => { 
    if (!currentUser) return;
    const productId = productContext?.id;
    
    let chat = allChats.find(c => 
        c.participantIds.includes(currentUser.id) && 
        c.participantIds.includes(otherUser.id) &&
        c.productId === productId
    );

    if (!chat) {
        // Create new chat
        chat = {
            id: `chat${Date.now()}`,
            participantIds: [currentUser.id, otherUser.id],
            messages: [],
            productId: productId,
        };
        setAllChats(prev => [...prev, chat!]);
    }
    navigateTo('chat', { otherUser, productContext, chat }); 
  };
  
  const handleSendMessage = (chatId: string, messageContent: { type: 'text', text: string } | { type: 'audio', audioUrl: string, duration: number }) => {
    if (!currentUser) return;

    let message: ChatMessage;

    if (messageContent.type === 'text') {
      message = {
        id: `msg${Date.now()}`,
        text: messageContent.text,
        senderId: currentUser.id,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
    } else {
      message = {
        id: `msg${Date.now()}`,
        text: `Sesli Mesaj (${messageContent.duration.toFixed(1)}s)`,
        senderId: currentUser.id,
        timestamp: new Date().toISOString(),
        type: 'audio',
        payload: { audioUrl: messageContent.audioUrl, duration: messageContent.duration }
      };
    }

    setAllChats(prevChats => {
        const newChats = prevChats.map(c => {
            if (c.id === chatId) {
                return { ...c, messages: [...c.messages, message] };
            }
            return c;
        });
        // move updated chat to the top (for ChatListView)
        const chatIndex = newChats.findIndex(c => c.id === chatId);
        if (chatIndex > -1) {
            const [updatedChat] = newChats.splice(chatIndex, 1);
            newChats.unshift(updatedChat);
        }
        return newChats;
    });
  };

    const handleSendPreOrder = (creator: User, payload: PreOrderPayload) => {
        if (!currentUser) return;

        let chat = allChats.find(c => 
            c.participantIds.includes(currentUser.id) && 
            c.participantIds.includes(creator.id) &&
            !c.productId 
        );

        if (!chat) {
            chat = {
                id: `chat${Date.now()}`,
                participantIds: [currentUser.id, creator.id],
                messages: [],
            };
            setAllChats(prev => [chat!, ...prev]);
        }

        if (editingPreOrderInfo) {
            setAllChats(prevChats => prevChats.map(c => {
                if (c.id === editingPreOrderInfo.chatId) {
                    const messageIndex = c.messages.findIndex(m => m.id === editingPreOrderInfo.messageId);
                    if (messageIndex > -1) {
                        const updatedMessages = [...c.messages];
                        updatedMessages[messageIndex] = {
                            ...updatedMessages[messageIndex],
                            payload: payload,
                            timestamp: new Date().toISOString(),
                            text: `UPDATED Pre-Order Form - ${payload.items.length} items`,
                            senderId: currentUser.id,
                        };
                        return { ...c, messages: updatedMessages };
                    }
                }
                return c;
            }));
        } else {
            const message: ChatMessage = {
                id: `msg${Date.now()}`,
                text: `Pre-Order Form - ${payload.items.length} items`,
                senderId: currentUser.id,
                timestamp: new Date().toISOString(),
                type: 'pre-order',
                payload: payload
            };
            setAllChats(prevChats => {
                const newChats = prevChats.map(c => c.id === chat!.id ? { ...c, messages: [...c.messages, message] } : c);
                const chatIndex = newChats.findIndex(c => c.id === chat!.id);
                if (chatIndex > -1) {
                    const [updatedChat] = newChats.splice(chatIndex, 1);
                    newChats.unshift(updatedChat);
                }
                return newChats;
            });
        }
        
        setEditingPreOrderInfo(null);
        
        const salesperson = allUsers.find(u => u.id === payload.salespersonId);
        if (salesperson && salesperson.role === 'sales_rep') {
            const commissionRate = salesperson.commissionRate || 0;
            const commissionAmount = payload.subtotal * (commissionRate / 100);

            const saleItems: SaleRecordItem[] = payload.items.map(item => ({
                productId: item.productId,
                productName: item.name,
                variantName: item.variantName,
                size: item.size,
                packName: item.packName,
                quantity: item.quantity,
                pricePerUnit: item.price
            }));

            const newSale: SaleRecord = {
                id: `sale-${Date.now()}`,
                salespersonId: salesperson.id,
                brandOwnerId: creator.id,
                items: saleItems,
                totalAmount: payload.subtotal,
                commissionAmount: commissionAmount,
                timestamp: new Date()
            };
            setAllSales(prev => [newSale, ...prev]);
        }

        const itemsToClear = payload.items.map(item => ({
            productId: item.productId,
            variantName: item.variantName,
            size: item.size,
            packId: item.packId,
        }));

        itemsToClear.forEach(item => {
            updateCartItemQuantity(item.productId, item.variantName, 0, item.size, item.packId);
        });
        
        navigateTo('chat', { otherUser: creator, chat });
    };

    const handleCheckout = (creator: User, items: CartItem[]) => {
        if (!currentUser) return;
    
        // 1. Create Sale Record
        const subtotal = items.reduce((total, item) => {
            if (item.specialPrice !== undefined) {
                return total + item.specialPrice * item.quantity;
            }
            const product = allProducts.find(p => p.id === item.productId);
            if (!product) return total;
            if (item.packId && product.packs) {
                const pack = product.packs.find(p => p.id === item.packId);
                return total + (pack ? pack.price * item.quantity : 0);
            }
            return total + product.price * item.quantity;
        }, 0);
        
        const saleItems: SaleRecordItem[] = items.map(cartItem => {
            const product = allProducts.find(p => p.id === cartItem.productId)!;
            let pricePerUnit = cartItem.specialPrice ?? product.price;
            let packName: string | undefined = undefined;
            if (cartItem.packId && product.packs) {
                const pack = product.packs.find(p => p.id === cartItem.packId);
                if (pack) {
                    pricePerUnit = pack.price;
                    packName = pack.name;
                }
            }
            return {
                productId: cartItem.productId,
                productName: product.name,
                variantName: cartItem.variantName,
                size: cartItem.size,
                packName: packName,
                quantity: cartItem.quantity,
                pricePerUnit: pricePerUnit
            };
        });
        
        const commissionRate = (currentUser.role === 'sales_rep' && currentUser.companyId === creator.id) ? (currentUser.commissionRate || 0) : 0;
        const commissionAmount = subtotal * (commissionRate / 100);

        const newSale: SaleRecord = {
            id: `sale-${Date.now()}`,
            salespersonId: currentUser.id,
            brandOwnerId: creator.id,
            items: saleItems,
            totalAmount: subtotal,
            commissionAmount: commissionAmount,
            timestamp: new Date()
        };
        setAllSales(prev => [newSale, ...prev]);
    
        // 2. Clear items from cart
        setCart(prevCart => prevCart.filter(cartItem => {
            const product = allProducts.find(p => p.id === cartItem.productId);
            return product?.creator.id !== creator.id;
        }));
        
        // 3. Show toast
        showToast(`${t('paymentSuccessful')} ${t('orderPlaced')}`, 3000);
    };
    
  const handleEditPreOrder = (preOrderMessage: ChatMessage, chatId: string, creatorId: string) => {
    // FIX: Add a type guard to ensure the payload is a PreOrderPayload before accessing its 'items' property.
    if (!preOrderMessage.payload || !('items' in preOrderMessage.payload)) return;

    const preOrderItems = preOrderMessage.payload.items;

    const otherCartItems = cart.filter(item => {
        const product = allProducts.find(p => p.id === item.productId);
        return product?.creator.id !== creatorId;
    });

    const itemsToAddToCart: CartItem[] = preOrderItems.map(item => ({
        productId: item.productId,
        variantName: item.variantName,
        size: item.size,
        packId: item.packId,
        quantity: item.quantity,
    }));
    
    setCart([...otherCartItems, ...itemsToAddToCart]);
    setEditingPreOrderInfo({ messageId: preOrderMessage.id, chatId });
    navigateTo('basket');
  };


  const onNavigateToDeck = (deck: Deck) => {
    if (currentUser?.role === 'customer') {
      navigateTo('deckGallery', { deck });
    } else {
      navigateTo('deckDetail', { deck, allProducts: allProducts });
    }
  };

  const generateShareUrl = (params: Record<string, string>) => {
    const url = new URL(window.location.href);
    url.search = '';
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    return url.toString();
  };

  const handleGenericShare = async (title: string, text: string, url: string) => {
    if (navigator.share) {
        try { await navigator.share({ title, text, url }); return; } catch (err) { if (err instanceof Error && err.name === 'AbortError') return; console.error('Share API failed, falling back...', err); }
    }
    if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(url); showToast(t('linkCopied'), 3000); return; } catch (err) { console.error('Clipboard copy failed, falling back to dialog...', err); }
    }
    setShareUrl(url);
  };
  
  const handleShareProfile = (userId: string) => { const user = allUsers.find(u => u.id === userId); if (!user) return; handleGenericShare(`${user.username}'s Profile`, `Check out ${user.username}'s collections on Deck!`, generateShareUrl({ userId })); };
  const handleShareDeck = (deckId: string) => { if(!currentUser) return; const deck = currentUser.decks.find(d => d.id === deckId); if (!deck) return; handleGenericShare(`${deck.name} by ${currentUser.username}`, `Check out the "${deck.name}" collection on Deck!`, generateShareUrl({ userId: currentUser.id, deckId })); };
  const handleShareProduct = (product: Product) => { handleGenericShare(product.name, `Check out this product on Deck: ${product.name} by ${product.creator.username}`, generateShareUrl({ productId: product.id })); };
  
  const handleUpdateProfile = (updatedUser: User) => { setCurrentUser(updatedUser); setAllUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)); goBack(); };
  const handleUpdateUserSettings = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setAllUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    showToast(t('settingsUpdated'));
  };
  
    const createNotificationForFollowers = (creator: User, message: string, link: { type: 'product' | 'deck', id: string, variantName?: string }) => {
        const creatorSummary = { id: creator.id, username: creator.username, avatarUrl: creator.avatarUrl };
        const newNotifications: Notification[] = creator.followerIds.map(followerId => ({
            id: `notif-${Date.now()}-${followerId}`,
            fromUser: creatorSummary,
            message,
            link,
            timestamp: new Date(),
            read: false,
        }));
        setNotifications(prev => [...newNotifications, ...prev]);
    };

  const handleCreateDeck = (deckData: { name: string; mediaUrls: string[]; products: Omit<Product, 'id' | 'creator'>[] }) => {
    if(!currentUser) return;
    const creatorSummary: UserSummary = { id: currentUser.id, username: currentUser.username, avatarUrl: currentUser.avatarUrl };
    const newFullProducts: Product[] = deckData.products.map((p, i) => ({ ...p, id: `prod-new-${Date.now()}-${i}`, createdAt: new Date(), creator: creatorSummary }));
    const newDeck: Deck = { id: `deck${Date.now()}`, name: deckData.name, mediaUrls: deckData.mediaUrls, productCount: newFullProducts.length, productIds: newFullProducts.map(p => p.id) };
    const updatedUser = { ...currentUser, decks: [...currentUser.decks, newDeck] };
    setAllProducts(prev => [...newFullProducts, ...prev]);
    setCurrentUser(updatedUser);
    setAllUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    const creatorForNotification = allUsers.find(u => u.id === currentUser.id);
    if (creatorForNotification) {
        createNotificationForFollowers(creatorForNotification, `yeni bir koleksiyon yayınladı: ${newDeck.name}`, { type: 'deck', id: newDeck.id });
    }
    goBack();
  };

  const handleCreateProduct = (productData: Omit<Product, 'id' | 'creator'>): Product => {
    if(!currentUser) throw new Error("No current user");
    const creatorSummary: UserSummary = { id: currentUser.id, username: currentUser.username, avatarUrl: currentUser.avatarUrl, };
    const newProduct: Product = { ...productData, id: `prod-new-${Date.now()}`, createdAt: new Date(), creator: creatorSummary };
    setAllProducts(prev => [newProduct, ...prev]);
    const creatorForNotification = allUsers.find(u => u.id === currentUser.id);
    if(creatorForNotification) {
        createNotificationForFollowers(creatorForNotification, `yeni bir ürün ekledi: ${newProduct.name}`, { type: 'product', id: newProduct.id, variantName: newProduct.variants[0].name });
    }
    return newProduct;
  };
  
  const handleUpdateProduct = (updatedProduct: Product) => {
    setAllProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };
  
  const handleEditDeck = (deck: Deck) => { navigateTo('editDeck', { deck, currentUser }); };
  const handleUpdateDeck = (updatedDeck: Deck) => { if(!currentUser) return; const updatedUser = { ...currentUser, decks: currentUser.decks.map(d => d.id === updatedDeck.id ? updatedDeck : d) }; setCurrentUser(updatedUser); setAllUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)); goBack(); };
  const handleDeleteDeck = (deckId: string) => { if(!currentUser) return; if (window.confirm('Bu decki silmek istediğinizden emin misiniz?')) { const updatedUser = { ...currentUser, decks: currentUser.decks.filter(d => d.id !== deckId) }; setCurrentUser(updatedUser); setAllUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)); } };
  const handleOpenVideoStudio = (deck: Deck) => setDeckForVideo(deck);

  const handleNavigateToProduct = (productId: string, variantName: string) => {
    const product = allProducts.find(p => p.id === productId); if (!product) return;
    setLastViewedProductId(productId);
    setProductToShow({ productId, variantName });
    resetToView('feed');
  };
  
    const handleFollowToggle = (targetUserId: string) => {
        if (!currentUser) return;
        const currentUserId = currentUser.id;

        setAllUsers(prevUsers => {
            const newUsers = [...prevUsers];
            const currentUserIndex = newUsers.findIndex(u => u.id === currentUserId);
            const targetUserIndex = newUsers.findIndex(u => u.id === targetUserId);

            if (currentUserIndex === -1 || targetUserIndex === -1) return prevUsers;

            const currentUserData = { ...newUsers[currentUserIndex] };
            const targetUserData = { ...newUsers[targetUserIndex] };

            const isFollowing = currentUserData.followingIds.includes(targetUserId);

            if (isFollowing) {
                currentUserData.followingIds = currentUserData.followingIds.filter(id => id !== targetUserId);
                targetUserData.followerIds = targetUserData.followerIds.filter(id => id !== currentUserId);
            } else {
                currentUserData.followingIds = [...currentUserData.followingIds, targetUserId];
                targetUserData.followerIds = [...targetUserData.followerIds, currentUserId];
            }

            newUsers[currentUserIndex] = currentUserData;
            newUsers[targetUserIndex] = targetUserData;

            setCurrentUser(currentUserData);
            return newUsers;
        });
    };
    
    const handleToggleFeatured = (productId: string) => {
        setAllProducts(prevProducts =>
            prevProducts.map(p =>
                p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p
            )
        );
    };

    const handleNotificationClick = (notification: Notification) => {
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
        setActiveModal(null);
        if (notification.link.type === 'product') {
            handleNavigateToProduct(notification.link.id, notification.link.variantName!);
        } else if (notification.link.type === 'deck') {
            const creator = allUsers.find(u => u.id === notification.fromUser.id);
            const deck = creator?.decks.find(d => d.id === notification.link.id);
            if (deck) onNavigateToDeck(deck);
        }
    };

    const handleArchiveToggle = (chatId: string) => {
        setArchivedChatIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(chatId)) {
                newSet.delete(chatId);
            } else {
                newSet.add(chatId);
            }
            return newSet;
        });
    };

    const handleDeleteChat = (chatId: string) => {
        if (window.confirm("Bu sohbeti kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            setAllChats(prev => prev.filter(c => c.id !== chatId));
        }
    };

  const handleSendAiMessage = async (message: string) => {
    if (!aiChat || isAiLoading) return;
    setIsAiLoading(true);
    setAiChatHistory(prev => [...prev, { role: 'user', text: message }]);
    
    try {
        const result = await aiChat.sendMessageStream({ message });
        let text = '';
        setAiChatHistory(prev => [...prev, {role: 'model', text: '', isLoading: true}]);
        for await (const chunk of result) {
            text += chunk.text;
            setAiChatHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { role: 'model', text, isLoading: true };
                return newHistory;
            });
        }
        
        // After stream is complete, process the final text
        if (text.startsWith('ACTION:')) {
            const actionJsonString = text.substring('ACTION:'.length).trim();
            try {
                const action = JSON.parse(actionJsonString);
                let confirmationText = '';
                
                if (action.type === 'NAVIGATE_TO_PRODUCT') {
                    const product = allProducts.find(p => p.name.toLowerCase().includes(action.productName.toLowerCase()));
                    if (product) {
                        confirmationText = `OK, here is "${product.name}".`;
                        handleNavigateToProduct(product.id, product.variants[0].name);
                    } else {
                        confirmationText = `Sorry, I couldn't find a product named "${action.productName}".`;
                    }
                } else if (action.type === 'NAVIGATE_TO_CREATOR') {
                    const creator = allUsers.find(u => u.username.toLowerCase().includes(action.creatorName.toLowerCase()));
                    if (creator) {
                        confirmationText = `Sure, here is the profile for "${creator.username}".`;
                        handleFilterByCreator(creator);
                    } else {
                        confirmationText = `Sorry, I couldn't find a brand named "${action.creatorName}".`;
                    }
                } else if (action.type === 'SHOW_REPORT') {
                    const sellerProducts = allProducts.filter(p => p.creator.id === currentUser?.id);
                    let reportText = '';
                    if (action.reportType === 'most_viewed') {
                        const sorted = [...sellerProducts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);
                        reportText = 'Here are your top 5 most viewed products:\n\n';
                        sorted.forEach((p, i) => { reportText += `${i + 1}. ${p.name} - ${p.viewCount || 0} views\n`; });
                    } else if (action.reportType === 'sales') {
                        const sorted = [...sellerProducts].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 5);
                        reportText = 'Here are your top 5 best-selling products:\n\n';
                        sorted.forEach((p, i) => { reportText += `${i + 1}. ${p.name} - ${p.salesCount || 0} units sold\n`; });
                    } else if (action.reportType === 'revenue') {
                        let totalRevenue = 0;
                        sellerProducts.forEach(p => { totalRevenue += (p.salesCount || 0) * p.price; });
                        reportText = `Your total revenue summary:\n\nTotal Products: ${sellerProducts.length}\nTotal Units Sold: ${sellerProducts.reduce((acc, p) => acc + (p.salesCount || 0), 0)}\nTotal Revenue: $${totalRevenue.toFixed(2)}`;
                    }
                    confirmationText = reportText || "Could not generate the report.";
                }
                
                setAiChatHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'model', text: confirmationText };
                    return newHistory;
                });

            } catch (e) {
                console.error("Failed to parse AI action:", e);
                setAiChatHistory(prev => { const newHistory = [...prev]; newHistory[newHistory.length - 1] = { role: 'model', text }; return newHistory; });
            }
        } else {
             setAiChatHistory(prev => { const newHistory = [...prev]; newHistory[newHistory.length - 1] = { role: 'model', text }; return newHistory; });
        }

    } catch (error) {
        console.error("AI chat error:", error);
        setAiChatHistory(prev => [...prev, { role: 'model', text: t('aiError') }]);
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleSaveSizeGuideTemplate = (templateData: Omit<SizeGuideTemplate, 'id'>, templateId?: string) => {
    if (!currentUser) return;
    let updatedTemplates: SizeGuideTemplate[];
    if (templateId) { // Editing
      updatedTemplates = (currentUser.sizeGuideTemplates || []).map(t =>
        t.id === templateId ? { ...t, name: templateData.name, sizeGuide: templateData.sizeGuide } : t
      );
    } else { // Creating
      const newTemplate: SizeGuideTemplate = { id: `sgt-${Date.now()}`, ...templateData };
      updatedTemplates = [...(currentUser.sizeGuideTemplates || []), newTemplate];
    }
    const updatedUser = { ...currentUser, sizeGuideTemplates: updatedTemplates };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setEditingTemplate(null);
  };
  
  const handleDeleteSizeGuideTemplate = (templateId: string) => {
    if (!currentUser) return;
    if (window.confirm('Bu şablonu silmek istediğinizden emin misiniz?')) {
      const updatedTemplates = (currentUser.sizeGuideTemplates || []).filter(t => t.id !== templateId);
      const updatedUser = { ...currentUser, sizeGuideTemplates: updatedTemplates };
      setCurrentUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
  };

  const handleSavePackTemplate = (templateData: Omit<ProductPackTemplate, 'id'>, templateId?: string) => {
    if (!currentUser) return;
    let updatedTemplates: ProductPackTemplate[];
    if (templateId) { // Editing
      updatedTemplates = (currentUser.packTemplates || []).map(t =>
        t.id === templateId ? { ...t, name: templateData.name, contents: templateData.contents } : t
      );
    } else { // Creating
      const newTemplate: ProductPackTemplate = { id: `ppt-${Date.now()}`, ...templateData };
      updatedTemplates = [...(currentUser.packTemplates || []), newTemplate];
    }
    const updatedUser = { ...currentUser, packTemplates: updatedTemplates };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setEditingPackTemplate(null);
  };
  
  const handleDeletePackTemplate = (templateId: string) => {
    if (!currentUser) return;
    if (window.confirm('Bu şablonu silmek istediğinizden emin misiniz?')) {
      const updatedTemplates = (currentUser.packTemplates || []).filter(t => t.id !== templateId);
      const updatedUser = { ...currentUser, packTemplates: updatedTemplates };
      setCurrentUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
  };
  
  const handleAddTeamMember = (ownerId: string, memberId: string) => {
    setAllUsers(prev => {
        const newUsers = prev.map(u => {
            if (u.id === ownerId) {
                const updatedOwner: User = {...u, teamMemberIds: [...(u.teamMemberIds || []), memberId]};
                if (currentUser?.id === ownerId) setCurrentUser(updatedOwner);
                return updatedOwner;
            }
            if (u.id === memberId) {
                const updatedMember: User = {...u, role: 'sales_rep', companyId: ownerId};
                return updatedMember;
            }
            return u;
        });
        return newUsers;
    });
    setTeamManagementOwner(null); // Close modal on success
  };
  
  const handleRemoveTeamMember = (ownerId: string, memberId: string) => {
      const member = allUsers.find(u => u.id === memberId);
      if (!member) return;
  
      setConfirmation({
        message: t('removeMemberConfirmation', { username: member.username }),
        onConfirm: () => {
          setAllUsers(prev => {
            const newUsers = prev.map(u => {
              if (u.id === ownerId) {
                const updatedOwner: User = { ...u, teamMemberIds: (u.teamMemberIds || []).filter(id => id !== memberId) };
                if (currentUser?.id === ownerId) setCurrentUser(updatedOwner);
                return updatedOwner;
              }
              if (u.id === memberId) {
                const { companyId, commissionRate, ...rest } = u;
                const updatedMember: User = { ...rest, role: 'customer' };
                return updatedMember;
              }
              return u;
            });
            return newUsers;
          });
          setConfirmation(null);
        },
        onCancel: () => setConfirmation(null),
      });
  };

  const handleUpdatePassword = ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
    if (!currentUser) return;
    setPasswordUpdateError(null);

    if (currentUser.password !== currentPassword) {
      setPasswordUpdateError(t('incorrectCurrentPassword'));
      return;
    }

    const updatedUser = { ...currentUser, password: newPassword };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    
    setIsChangePasswordModalOpen(false);
    showToast(t('passwordUpdatedSuccessfully'));
  };

  const handlePasswordReset = (identifier: string, newPassword: string) => {
    setAllUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.contact.email.toLowerCase() === identifier.toLowerCase() || u.contact.phone === identifier) {
          return { ...u, password: newPassword };
        }
        return u;
      })
    );
    setIsForgotPasswordModalOpen(false);
    showToast(t('passwordUpdatedSuccessfully'));
  };


  const handleUpdateCommissionRate = (memberId: string, newRate: number) => {
    setAllUsers(prevUsers => {
      const newUsers = prevUsers.map(u => {
        if (u.id === memberId) {
          return { ...u, commissionRate: newRate };
        }
        return u;
      });

      if (currentUser) {
        const updatedCurrentUser = newUsers.find(u => u.id === currentUser.id);
        if (updatedCurrentUser) setCurrentUser(updatedCurrentUser);
      }
      return newUsers;
    });
    setEditingCommissionFor(null);
  };
  
  const handleFinalizeLiveStream = (setup: { title: string, thumbnail: string, productIds: string[], scheduledAt?: string }) => {
    if (!currentUser) return;

    if (setup.scheduledAt) {
        const newStream: LiveStream = {
            id: `live-${Date.now()}`,
            hostId: currentUser.id,
            title: setup.title,
            thumbnailUrl: setup.thumbnail,
            productShowcaseIds: setup.productIds,
            status: 'upcoming',
            scheduledAt: setup.scheduledAt,
            viewerCount: 0,
            likesCount: 0,
            comments: [],
        };
        setAllLiveStreams(prev => [newStream, ...prev].sort((a,b) => (a.scheduledAt && b.scheduledAt) ? new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime() : 0));
        showToast(t('streamScheduled'));
        resetToView('liveFeeds');
    } else {
        const newStream: LiveStream = {
            id: `live-${Date.now()}`,
            hostId: currentUser.id,
            title: setup.title,
            thumbnailUrl: setup.thumbnail,
            productShowcaseIds: setup.productIds,
            status: 'live',
            startedAt: new Date().toISOString(),
            viewerCount: 1,
            likesCount: 0,
            comments: [],
            playbackUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' // Mock playback
        };
        setAllLiveStreams(prev => [newStream, ...prev]);
        navigateTo('liveStreamPlayer', { stream: newStream });
    }
  };

  const handleStartScheduledStream = (streamToStart: LiveStream) => {
    if (!currentUser || currentUser.id !== streamToStart.hostId) return;

    const updatedStream: LiveStream = {
      ...streamToStart,
      status: 'live',
      startedAt: new Date().toISOString(),
    };
    delete updatedStream.scheduledAt;

    setAllLiveStreams(prev => prev.map(s => s.id === streamToStart.id ? updatedStream : s));
    
    navigateTo('liveStreamPlayer', { stream: updatedStream });
  };
  
  const handleAddLiveComment = (streamId: string, text: string) => {
    if(!currentUser) return;
     const newComment: LiveComment = {
        id: `c-${Date.now()}`,
        userId: currentUser.id,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        text: text,
        timestamp: new Date().toISOString(),
        type: 'comment'
    };
    setAllLiveStreams(prev => prev.map(s => s.id === streamId ? {...s, comments: [...s.comments, newComment]} : s));
  };

  const handleNavigateToBasketFromLive = (streamId: string) => {
    setLiveStreamContextId(streamId);
    navigateTo('basket');
  };

  const handleReturnToLive = () => {
    if (liveStreamContextId) {
        const stream = allLiveStreams.find(s => s.id === liveStreamContextId);
        if (stream) {
            navigateTo('liveStreamPlayer', { stream });
        } else {
            setLiveStreamContextId(null);
        }
    }
  };

  const handleLeaveLiveStream = () => {
    setLiveStreamContextId(null);
    goBack();
  };

  const handleNavBasketClick = (view: ViewType) => {
    if (currentView.view === 'liveStreamPlayer' && currentView.props.stream) {
        setLiveStreamContextId(currentView.props.stream.id);
    }
    resetToView(view);
  };
  
  const handleToggleHostControl = (streamId: string) => {
    setAllLiveStreams(prev => prev.map(s => {
        if (s.id === streamId) {
            const isNowControlled = !s.isHostControlled;
            return {
                ...s, 
                isHostControlled: isNowControlled,
                // When host takes control, set the pinned product to the first one by default if not set
                hostPinnedProductIndex: isNowControlled && (s.hostPinnedProductIndex === null || s.hostPinnedProductIndex === undefined) ? 0 : s.hostPinnedProductIndex,
            };
        }
        return s;
    }));
  };
  
  const handleHostPinProduct = (streamId: string, index: number | null) => {
      setAllLiveStreams(prev => prev.map(s => s.id === streamId ? {...s, hostPinnedProductIndex: index} : s));
  };
  
  const discountTimers = useRef<Map<string, number>>(new Map());
  const handleSetLiveDiscount = (streamId: string, productId: string, discountPercentage: number, durationMinutes: number) => {
      const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
      
      setAllLiveStreams(prev => prev.map(s => s.id === streamId ? {
          ...s,
          activeDiscount: { productId, discountPercentage, expiresAt }
      } : s));

      // Clear any existing timer for this stream to prevent conflicts
      if (discountTimers.current.has(streamId)) {
          clearTimeout(discountTimers.current.get(streamId));
      }

      // Set a timer to clear the discount when it expires
      const timerId = window.setTimeout(() => {
          setAllLiveStreams(prev => prev.map(s => {
              if (s.id === streamId && s.activeDiscount?.productId === productId) {
                  const { activeDiscount, ...rest } = s;
                  return rest; // Return stream object without activeDiscount
              }
              return s;
          }));
          discountTimers.current.delete(streamId);
      }, durationMinutes * 60 * 1000);

      discountTimers.current.set(streamId, timerId);
  };

  const savedProductsList = useMemo(() => allProducts.filter(p => savedProductIds.has(p.id)), [savedProductIds, allProducts]);
  const likedProductsList = useMemo(() => allProducts.filter(p => likedProductIds.has(p.id)), [likedProductIds, allProducts]);
  const currentUserProducts = useMemo(() => currentUser ? allProducts.filter(p => p.creator.id === currentUser.id) : [], [currentUser, allProducts]);
  const cartItemCount = useMemo(() => activeCart.reduce((sum, item) => sum + item.quantity, 0), [activeCart]);
  const unreadNotificationsCount = useMemo(() => notifications.filter(n => !n.read && n.fromUser.id !== currentUser?.id).length, [notifications, currentUser]);
  const followingUsers = useMemo(() => {
    if (!currentUser) return [];
    return allUsers.filter(u => currentUser.followingIds.includes(u.id));
  }, [currentUser, allUsers]);
  const liveStreamForBanner = useMemo(() => {
    if (!liveStreamContextId) return null;
    return allLiveStreams.find(s => s.id === liveStreamContextId);
  }, [liveStreamContextId, allLiveStreams]);
  const productsForFeed = useMemo(() => {
    if (filteredCreatorId) {
      return allProducts.filter(p => p.creator.id === filteredCreatorId);
    }
    return allProducts;
  }, [allProducts, filteredCreatorId]);
  const filteredCreator = useMemo(() => {
    if (!filteredCreatorId) return null;
    return allUsers.find(u => u.id === filteredCreatorId) || null;
  }, [allUsers, filteredCreatorId]);


  if (!currentUser && !isPublicView) {
    return (
      <>
        <LoginView onLogin={handleLogin} onRegister={handleRegister} error={loginError} onForgotPassword={() => setIsForgotPasswordModalOpen(true)} />
        {isForgotPasswordModalOpen && (
          <ForgotPasswordModal
              allUsers={allUsers}
              onClose={() => setIsForgotPasswordModalOpen(false)}
              onPasswordReset={handlePasswordReset}
          />
        )}
      </>
    );
  }

  const renderView = () => {
    if(!currentUser && !isPublicView) return null; // Should be handled by the login view redirect
    
    switch (currentView.view) {
      case 'feed': return (
        <Feed products={productsForFeed} allProducts={allProducts} likedProductIds={likedProductIds} savedProductIds={savedProductIds} onLikeToggle={handleLikeToggle} onSaveToggle={handleSaveToggle} onAddToCart={handleAddToCart} onFilterByCreator={handleFilterByCreator} onNavigateToFullProfile={handleNavigateToFullProfile} onNavigateToChat={onNavigateToChat} onShare={handleShareProduct} productToShow={productToShow} onProductShown={() => setProductToShow(null)} onOpenFitFinder={(p) => setFitFinderProduct(p)} onShopTheLookItemClick={(p) => setQuickShopProduct(p)} currentUser={currentUser} onFollowToggle={handleFollowToggle} onActiveProductChange={setLastViewedProductId} initialProductId={lastViewedProductId} />
      );
      case 'profile': 
        if (currentUser?.role === 'customer') {
            return <CustomerProfile user={currentUser} savedProducts={savedProductsList} likedProducts={likedProductsList} onEditProfile={() => navigateTo('editProfile')} onLogout={handleLogout} onShowFollowingList={() => setActiveModal('following')} followingUsers={followingUsers} onShowSettings={() => navigateTo('settings')} onNavigateToCreator={handleNavigateToFullProfile} onNavigateToAIStylist={() => navigateTo('aiStylist')} />;
        }
        return <Profile user={currentUser!} allUsers={allUsers} myProducts={currentUserProducts} savedProducts={savedProductsList} likedProducts={likedProductsList} salesRecords={allSales} onEditProfile={() => navigateTo('editProfile')} onCreateDeck={() => navigateTo('createDeck', { currentUser })} onNavigateToDeck={onNavigateToDeck} onEditDeck={handleEditDeck} onDeleteDeck={handleDeleteDeck} onShareProfile={handleShareProfile} onShareDeck={handleShareDeck} onGenerateVideoForDeck={handleOpenVideoStudio} onLogout={handleLogout} onShowFollowingList={() => setActiveModal('following')} onShowSettings={() => navigateTo('settings')} onShowNotifications={() => setActiveModal('notifications')} unreadNotificationsCount={unreadNotificationsCount} onShowTeamManagement={(owner) => setTeamManagementOwner(owner)} onRemoveTeamMember={handleRemoveTeamMember} onToggleFeatured={handleToggleFeatured} onEditCommission={setEditingCommissionFor} onNavigateToAIStylist={() => navigateTo('aiStylist')} />;
      case 'creatorProfile': return <CreatorProfile creator={currentView.props.creator} allUsers={allUsers} allProducts={allProducts} onNavigateToChat={onNavigateToChat} onNavigateToDeck={onNavigateToDeck} currentUser={currentUser} onFollowToggle={handleFollowToggle} />;
      case 'basket': return <BasketView cart={activeCart} products={allProducts} updateCartItemQuantity={updateCartItemQuantity} onSendPreOrder={isPublicView ? undefined : handleSendPreOrder} onCheckout={isPublicView ? undefined : handleCheckout} onNavigateToProduct={isPublicView ? undefined : handleNavigateToProduct} currentUser={currentUser} allUsers={allUsers} allChats={allChats} />;
      case 'saved': return <SavedView savedProducts={savedProductsList} likedProducts={likedProductsList} />;
      case 'chat': {
        const chatProps = currentView.props;
        const freshChat = allChats.find(c => c.id === chatProps.chat.id);
        const productForChat = chatProps.chat.productId ? allProducts.find(p => p.id === chatProps.chat.productId) : chatProps.productContext;
        return <ChatView
            currentUser={currentUser!}
            allUsers={allUsers}
            {...currentView.props}
            productContext={productForChat}
            chat={freshChat || chatProps.chat}
            onSendMessage={handleSendMessage}
            onNavigateToCreator={handleNavigateToFullProfile}
            onNavigateToProduct={handleNavigateToProduct}
            onEditPreOrder={(message) => handleEditPreOrder(message, chatProps.chat.id, chatProps.otherUser.id)}
        />;
      }
      case 'chatList': return <ChatListView currentUser={currentUser!} allUsers={allUsers} allProducts={allProducts} chats={allChats} onNavigateToChat={(otherUser, product) => onNavigateToChat(otherUser, product)} archivedChatIds={archivedChatIds} onArchiveToggle={handleArchiveToggle} onDeleteChat={handleDeleteChat} />;
      case 'editProfile': return <EditProfile user={currentUser!} onSave={handleUpdateProfile} />;
      case 'createDeck': return <CreateDeck onCreate={handleCreateDeck} currentUser={currentUser} />;
      case 'editDeck': return <EditDeck {...currentView.props} allProducts={allProducts} onSave={handleUpdateDeck} onCreateProduct={handleCreateProduct} onToggleFeatured={handleToggleFeatured} onUpdateProduct={handleUpdateProduct} />;
      case 'deckDetail': return <DeckDetailView {...currentView.props} />;
      case 'deckGallery': return <DeckGalleryView {...currentView.props} allProducts={allProducts} onClose={goBack} onAddToCart={handleAddToCart} onOpenFitFinder={(p) => setFitFinderProduct(p)} />;
      case 'publicProfile': return <PublicProfileView user={currentView.props.user} onNavigateToDeck={onNavigateToDeck} onShareProfile={handleShareProfile} />;
      case 'settings': return <SettingsView user={currentUser!} onUpdateUser={handleUpdateUserSettings} onCreateSizeGuideTemplate={() => setEditingTemplate({})} onEditSizeGuideTemplate={(template) => setEditingTemplate(template)} onDeleteSizeGuideTemplate={handleDeleteSizeGuideTemplate} onCreatePackTemplate={() => setEditingPackTemplate({})} onEditPackTemplate={(template) => setEditingPackTemplate(template)} onDeletePackTemplate={handleDeletePackTemplate} onShowChangePasswordModal={() => setIsChangePasswordModalOpen(true)} allSales={allSales} allUsers={allUsers} myProducts={currentUserProducts} />;
      case 'liveFeeds': return <LiveFeedsView liveStreams={allLiveStreams} allUsers={allUsers} currentUser={currentUser} onJoinStream={(stream) => navigateTo('liveStreamPlayer', { stream })} onGoLive={() => navigateTo('liveStreamSetup')} onStartScheduledStream={handleStartScheduledStream} />;
      case 'liveStreamSetup': return <LiveStreamSetupView currentUser={currentUser!} myProducts={currentUserProducts} onFinalizeStream={handleFinalizeLiveStream} />;
      case 'liveStreamPlayer': {
        const freshStream = allLiveStreams.find(s => s.id === currentView.props.stream.id) || currentView.props.stream;
        return <LiveStreamPlayerView stream={freshStream} currentUser={currentUser!} allUsers={allUsers} allProducts={allProducts} onLeave={handleLeaveLiveStream} onAddToCart={handleAddToCart} onOpenFitFinder={(p) => setFitFinderProduct(p)} onSendMessage={handleAddLiveComment} onNavigateToBasket={handleNavigateToBasketFromLive} cartItemCount={cartItemCount} onToggleHostControl={handleToggleHostControl} onHostPinProduct={handleHostPinProduct} onSetLiveDiscount={handleSetLiveDiscount} />;
      }
      case 'aiStylist':
        const AiStylistView = () => {
            const [input, setInput] = useState('');
            return (
              <div className="bg-black text-white h-screen flex flex-col pt-12 pb-16">
                <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-center gap-3 bg-[#121212] border-b border-gray-800">
                  <SparklesIcon className="w-6 h-6 text-purple-400" />
                  <h1 className="font-bold text-lg font-serif">{t('aiStylist')}</h1>
                </header>
                <main className="flex-1 overflow-y-auto p-4 space-y-6">
                  {aiChatHistory.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5"/></div>}
                      <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-[#262626] rounded-bl-none'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}{msg.isLoading && <span className="inline-block w-2 h-2 ml-2 bg-white rounded-full animate-ping"></span>}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={aiChatEndRef} />
                </main>
                <footer className="absolute bottom-16 left-0 right-0 p-2 border-t border-gray-800 bg-black">
                  <form onSubmit={(e) => { e.preventDefault(); if(input.trim()) { handleSendAiMessage(input); setInput(''); } }} className="flex items-center gap-2">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('askStyleQuestion')} className="flex-1 bg-[#262626] border border-gray-700 rounded-full py-2 px-4 text-sm focus:outline-none" />
                    <button type="submit" disabled={isAiLoading || !input.trim()} className="bg-blue-600 rounded-full p-2 disabled:bg-gray-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
                  </form>
                </footer>
              </div>
            );
        };
        return <AiStylistView />;
      default: return isPublicView && currentView.props.user ? <PublicProfileView user={currentView.props.user} onNavigateToDeck={onNavigateToDeck} onShareProfile={handleShareProfile} /> : <Feed products={allProducts} allProducts={allProducts} likedProductIds={likedProductIds} savedProductIds={savedProductIds} onLikeToggle={handleLikeToggle} onSaveToggle={handleSaveToggle} onAddToCart={handleAddToCart} onFilterByCreator={handleFilterByCreator} onNavigateToFullProfile={handleNavigateToFullProfile} onNavigateToChat={onNavigateToChat} onShare={handleShareProduct} productToShow={productToShow} onProductShown={() => setProductToShow(null)} onOpenFitFinder={(p) => setFitFinderProduct(p)} onShopTheLookItemClick={(p) => setQuickShopProduct(p)} currentUser={currentUser} onFollowToggle={handleFollowToggle} onActiveProductChange={setLastViewedProductId} initialProductId={lastViewedProductId} />;
    }
  };
  
  const showBottomNav = !isPublicView && ['feed', 'chatList', 'basket', 'profile', 'liveFeeds'].includes(currentView.view);
  const showBackButton = (viewHistory.length > 1 && !showBottomNav) || (isPublicView && viewHistory.length > 1);
  const showPublicCartButton = isPublicView && cartItemCount > 0 && currentView.view !== 'basket';

  const navItems = (
    <>
        <BottomNavItem icon={ChatBubbleIcon} view="chatList" currentView={currentView.view} onClick={resetToView} />
        <BottomNavItem icon={CameraIcon} view="liveFeeds" currentView={currentView.view} onClick={resetToView} isLive />
        <BottomNavItem icon={HomeIcon} view="feed" currentView={currentView.view} onClick={resetToView} />
        <BottomNavItem icon={ShoppingBagIcon} view="basket" currentView={currentView.view} onClick={() => handleNavBasketClick('basket')} badgeCount={cartItemCount}/>
        <BottomNavItem icon={UserIcon} view="profile" currentView={currentView.view} onClick={resetToView} />
    </>
  );

  return (
    <div className="h-screen w-screen max-w-md mx-auto bg-black text-white overflow-hidden relative font-sans">
      {showBackButton && <button onClick={goBack} className="absolute top-4 left-4 z-30 p-2 bg-black/50 rounded-full"><ArrowLeftIcon className="w-6 h-6" /></button>}
      {showPublicCartButton && <button onClick={() => navigateTo('basket')} className="absolute top-4 right-4 z-30 p-2 bg-white/90 text-black rounded-full shadow-lg flex items-center justify-center"><ShoppingBagIcon className="w-6 h-6"/><span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartItemCount}</span></button>}
      
      {filteredCreatorId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-auto max-w-[80%] bg-black/60 backdrop-blur-md px-3 py-2 rounded-full flex items-center gap-2 animate-fadeIn-dialog">
          <p className="text-xs text-gray-300 truncate">
            {t('showingProductsFrom', { creatorName: filteredCreator?.username || '...' })}
          </p>
          <button onClick={() => setFilteredCreatorId(null)} className="p-1 -mr-1 text-gray-400 hover:text-white">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="h-full w-full">{renderView()}</div>
      
      {liveStreamForBanner && currentView.view !== 'liveStreamPlayer' && (
        <ReturnToLiveBanner 
            stream={liveStreamForBanner} 
            onReturn={handleReturnToLive} 
            host={allUsers.find(u => u.id === liveStreamForBanner.hostId)}
        />
      )}
      
      {toastMessage && <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-sm py-2 px-4 rounded-full z-[60]">{toastMessage}</div>}
      {fitFinderProduct && <FitFinder product={fitFinderProduct} onClose={() => setFitFinderProduct(null)} onSizeFound={(size) => { console.log(size); }}/>}
      {quickShopProduct && <QuickShopSheet product={quickShopProduct} onClose={() => setQuickShopProduct(null)} onAddToCart={handleAddToCart}/>}
      {deckForVideo && <AIVideoStudio deck={deckForVideo} allProducts={allProducts} onClose={() => setDeckForVideo(null)} />}
      {editingTemplate && <SizeGuideTemplateEditor onSave={handleSaveSizeGuideTemplate} onClose={() => setEditingTemplate(null)} templateToEdit={'id' in editingTemplate ? editingTemplate : undefined}/>}
      {editingPackTemplate && <PackTemplateEditor onSave={handleSavePackTemplate} onClose={() => setEditingPackTemplate(null)} templateToEdit={'id' in editingPackTemplate ? editingPackTemplate : undefined}/>}
      {teamManagementOwner && <TeamManagementModal owner={teamManagementOwner} allUsers={allUsers} onClose={() => setTeamManagementOwner(null)} onAddMember={handleAddTeamMember} />}
      {editingCommissionFor && <CommissionEditorModal member={editingCommissionFor} onClose={() => setEditingCommissionFor(null)} onSave={handleUpdateCommissionRate} />}
      {confirmation && <ConfirmationModal {...confirmation} />}

      {activeModal === 'notifications' && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setActiveModal(null)}
          onNotificationClick={handleNotificationClick}
        />
      )}
      {activeModal === 'following' && (
        <FollowingListModal
          users={followingUsers}
          title={t('following')}
          onClose={() => setActiveModal(null)}
          onUserClick={(user) => {
            setActiveModal(null);
            handleNavigateToFullProfile(user);
          }}
        />
      )}
      {isChangePasswordModalOpen && (
        <ChangePasswordModal
            onClose={() => { setIsChangePasswordModalOpen(false); setPasswordUpdateError(null); }}
            onSave={handleUpdatePassword}
            error={passwordUpdateError}
        />
      )}
      {isForgotPasswordModalOpen && !currentUser && (
        <ForgotPasswordModal
            allUsers={allUsers}
            onClose={() => setIsForgotPasswordModalOpen(false)}
            onPasswordReset={handlePasswordReset}
        />
      )}


      {shareUrl && (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 animate-fadeIn-dialog" onClick={() => setShareUrl(null)}>
          <div className="bg-[#121212] rounded-lg p-6 w-full max-w-sm text-center transform animate-slideUp-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">{t('shareLink')}</h3>
            <p className="text-sm text-gray-300 mb-4">{t('shareUnsupported')}</p>
            <div className="relative">
                <input type="text" value={shareUrl} readOnly className="w-full bg-gray-800 border border-gray-700 rounded-lg pr-20 pl-3 py-2 text-left text-sm" onFocus={(e) => e.target.select()} aria-label="Shareable link" />
                <button onClick={() => { navigator.clipboard.writeText(shareUrl).then(() => showToast(t('linkCopied'))).catch(() => showToast(t('copyFailed'))) }} className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white font-semibold text-xs px-3 py-1.5 rounded-md">{t('copy')}</button>
            </div>
            <button onClick={() => setShareUrl(null)} className="mt-4 w-full bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">{t('close')}</button>
          </div>
        </div>
      )}

      {showBottomNav && (
        <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-sm border-t border-white/10 pointer-events-auto">
              <div className="flex justify-around items-center h-16 px-2">
                {navItems}
              </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn-dialog { from { opacity: 0; } to { opacity: 1; } } .animate-fadeIn-dialog { animation: fadeIn-dialog 0.2s ease-out forwards; }
        @keyframes slideUp-dialog { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-slideUp-dialog { animation: slideUp-dialog 0.2s ease-out forwards; }
        @keyframes slideIn-right { from { transform: translateX(100%); } to { transform: translateX(0); } } .animate-slideIn-right { animation: slideIn-right 0.3s ease-out forwards; }
        @keyframes slide-up-banner { from { transform: translate(-50%, 50px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        .animate-slide-up-banner { animation: slide-up-banner 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
      `}</style>
    </div>
  );
};

interface BottomNavItemProps {
  icon: React.ElementType;
  view: ViewType;
  currentView: ViewType;
  onClick: (view: ViewType) => void;
  badgeCount?: number;
  isLive?: boolean;
}
const BottomNavItem: React.FC<BottomNavItemProps> = ({ icon: Icon, view, currentView, onClick, badgeCount, isLive }) => {
    const isActive = view ? view === currentView : false;
    return (
        <button onClick={() => onClick(view)} className="relative flex-1 flex justify-center items-center h-16 group">
            <div className={`
                absolute w-14 h-14 rounded-full
                transform transition-all duration-300 ease-in-out
                ${isActive 
                    ? 'bg-white/10 backdrop-blur-md -translate-y-4 scale-100' 
                    : 'bg-transparent scale-0'
                }
            `}></div>
            
            <div className={`
                relative transform transition-transform duration-300 ease-in-out
                ${isActive ? '-translate-y-4' : 'translate-y-0'}
            `}>
                <Icon className={`
                    w-7 h-7 transition-colors
                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                `} />
                {isLive && (
                    <span className="absolute -bottom-1 -right-2 bg-red-600 text-white text-[9px] font-bold px-1 rounded-sm leading-tight tracking-wider">LIVE</span>
                )}
                {typeof badgeCount === 'number' && badgeCount > 0 &&
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{badgeCount}</span>}
            </div>
        </button>
    );
};


const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(savedState?.language || 'en');
  return (
    <LanguageProvider initialLanguage={language} onLanguageChange={setLanguage}>
      <AppContent />
    </LanguageProvider>
  )
}


export default App;
