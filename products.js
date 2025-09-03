// api/products.js - Supabase Entegrasyonu (ESM olarak güncellendi)

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

// Vercel'de environment variables otomatik olarak process.env'ye yüklenir.
// Bu yüzden dotenv.config() çağrısına gerek yoktur.

const app = express();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Hata: Supabase URL ve Anon Key ortam değişkenlerinde bulunamadı.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use(cors());
app.use(express.json());

// Bu dosya `api/products.js` olduğu için Vercel bunu otomatik olarak `/api/products` yoluna yönlendirir.
// Express uygulamasının içindeki rota bu nedenle kök ('/') olmalıdır.
app.get('/', async (req, res) => {
  console.log("Ürünler için istek alındı...");

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Supabase yapılandırması eksik.' });
  }
  
  const { data, error } = await supabase
    .from('products')
    .select('data');

  if (error) {
    console.error('Supabase\'den veri çekerken hata:', error);
    return res.status(500).json({ error: 'Veritabanından ürünler alınamadı.' });
  }

  const formattedData = data.map(item => item.data);
  
  console.log(`${formattedData.length} ürün başarıyla gönderildi.`);
  res.json(formattedData);
});

// Vercel, bu dosyayı bir serverless fonksiyona dönüştüreceği için `export default` kullanılır.
export default app;
