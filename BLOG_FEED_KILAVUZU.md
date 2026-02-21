# SİTEY-VM Demo - Blog Bildirim Sistemi Kılavuzu

## Nasıl Çalışır?

1. Demo uygulaması her **24 saatte bir** `https://siteyvm.com/blog-feed.json` adresini kontrol eder
2. Yeni blog yazıları varsa, kullanıcı sayfayı açtığında topbar'daki **🔔 zil ikonu** ile bildirim gösterir
3. Kullanıcı bildirimi okuduktan sonra **bir daha gösterilmez** (localStorage'da saklanır)
4. Feed erişilemezse varsayılan haberler gösterilir

## siteyvm.com'a Eklenmesi Gereken Dosya

`https://siteyvm.com/blog-feed.json` adresine aşağıdaki formatta bir JSON dosyası koyun:

```json
{
  "version": "1.0",
  "updated": "2026-02-14T12:00:00Z",
  "posts": [
    {
      "id": "benzersiz-slug-id",
      "title": "Blog Yazısı Başlığı",
      "summary": "Yazının kısa özeti (1-2 cümle). Bu metin bildirim panelinde görünecek.",
      "url": "https://siteyvm.com/blog/yazi-slug",
      "date": "2026-02-14T12:00:00Z",
      "category": "Duyuru",
      "image": "https://siteyvm.com/images/blog/kapak.jpg"
    },
    {
      "id": "ikinci-yazi",
      "title": "İkinci Blog Yazısı",
      "summary": "Bu da ikinci yazının özeti.",
      "url": "https://siteyvm.com/blog/ikinci-yazi",
      "date": "2026-02-10T09:00:00Z",
      "category": "Ürün",
      "image": null
    }
  ]
}
```

## JSON Alanları

| Alan | Zorunlu | Açıklama |
|------|---------|----------|
| `id` | ✅ | Benzersiz ID (slug formatında). Tekrar göstermeme kontrolü için kullanılır |
| `title` | ✅ | Blog yazısının başlığı |
| `summary` | ✅ | Kısa özet (max 150 karakter önerilir) |
| `url` | ✅ | Yazının tam URL'si (tıklandığında açılacak) |
| `date` | ✅ | ISO 8601 formatında tarih |
| `category` | ❌ | Kategori etiketi: "Duyuru", "Ürün", "Hizmetler", "Güncelleme", "Blog" |
| `image` | ❌ | Kapak resmi URL'si (şimdilik kullanılmıyor, gelecekte eklenebilir) |

## Kategori İkonları

| Kategori | İkon |
|----------|------|
| Duyuru | 📢 |
| Ürün | 🚀 |
| Hizmetler | 🛡️ |
| Güncelleme | ✨ |
| Diğer | 📰 |

## Önemli Notlar

- Her yeni yazı eklendiğinde `id` alanı benzersiz olmalıdır
- Eski yazıları feed'den kaldırabilirsiniz, silmek bildirimi etkilemez
- Feed dosyasına **ETag** header'ı eklerseniz, demo gereksiz indirme yapmaz
- Demo backend feed'i **24 saatte 1 kez** çeker (BLOG_CHECK_INTERVAL ile ayarlanabilir)
- Feed erişilemezse demo **varsayılan haberleri** gösterir (hiçbir zaman boş kalmaz)

## Backend Ayarları (demo/backend/app.py)

```python
BLOG_FEED_URL = "https://siteyvm.com/blog-feed.json"  # Feed URL'si
BLOG_CHECK_INTERVAL = 86400  # Kontrol sıklığı (saniye) - 86400 = 24 saat
```

## Test Etme

Feed henüz yokken varsayılan 3 haber otomatik olarak gösterilir:
1. SİTEY-VM Zafiyet Yönetim Platformu
2. Kurumsal Sürüm Yeni Özellikleri
3. Sızma Testi ve Güvenlik Hizmetlerimiz
