// server.js - Supabase Entegrasyonu (ESM olarak güncellendi)

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env dosyasındaki değişkenleri yükle. Vercel'de bu değişkenler proje ayarlarından gelir.
dotenv.config(); 

const app = express();

// Supabase istemcisini başlat
// Bu değişkenler Vercel'in ortam değişkenleri (Environment Variables) bölümünden alınacak.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Hata: Supabase URL ve Anon Key ortam değişkenlerinde bulunamadı.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use(cors());
app.use(express.json()); // JSON body'lerini parse etmek için

// API endpoint'i: Ürünleri Supabase'den çek
app.get('/api/products', async (req, res) => {
  console.log("Ürünler için istek alındı...");

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Supabase yapılandırması eksik.' });
  }
  
  // Supabase'deki 'products' tablosundan tüm satırları ve sadece 'data' sütununu seç
  const { data, error } = await supabase
    .from('products')
    .select('data');

  if (error) {
    console.error('Supabase\'den veri çekerken hata:', error);
    return res.status(500).json({ error: 'Veritabanından ürünler alınamadı.' });
  }

  // Gelen veri formatı: [{ data: { product_info } }, { data: { product_info } }]
  // Bunu frontend'in beklediği formata dönüştür: [{ product_info }, { product_info }]
  const formattedData = data.map(item => item.data);
  
  console.log(`${formattedData.length} ürün başarıyla gönderildi.`);
  res.json(formattedData);
});

// Vercel gibi serverless ortamları için `app.listen` kullanmıyoruz.
// Vercel, bu dosyayı bir serverless fonksiyon olarak ele alacak ve `export default app`'i kullanacaktır.
export default app;
