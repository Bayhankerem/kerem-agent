# Kerem Agent 1.0 — başlangıç paketi

Bu paket, Kerem Agent'ın çoklu cihaz uyumlu ilk arayüzüdür (PWA).

## Şu anda çalışanlar
- Mobil, tablet ve masaüstüne uyumlu sohbet arayüzü
- Yeni sohbet düğmesi
- Tarayıcı destekliyorsa Türkçe konuşmayı yazıya çevirme
- Saat ve tarih gibi birkaç yerel deneme yanıtı
- PWA manifesti ve çevrimdışı önbellek altyapısı

## Önemli
Bu ilk sürüm henüz gerçek bir yapay zekâ modeline bağlı değildir. Deneme yanıtları verir. Gerçek AI için sonraki aşamada güvenli bir sunucu ve ücretsiz/açık kaynak model sağlayıcısı bağlanmalıdır. API anahtarını `app.js` içine yazmayın.

## Telefonda/tablette düzenleme
1. ZIP dosyasını çıkarın.
2. Dosyaları GitHub'da yeni bir depoya yükleyin.
3. Tarayıcıda `github.dev` ile dosyaları düzenleyebilirsiniz.
4. GitHub Pages üzerinden yayınlayabilir veya statik site barındırma hizmeti kullanabilirsiniz.
5. HTTPS adresini Android Chrome'da açın. Tarayıcı menüsünden **Ana ekrana ekle** seçeneğini kullanın.

## Yerel deneme
Bir statik web sunucusu ile `index.html` dosyasını açın. PWA yükleme ve çevrimdışı özellikleri için HTTPS veya localhost gerekir.

## Sonraki geliştirme
- Güvenli backend (ör. FastAPI)
- Açık kaynak/ücretsiz kullanım kotası olan AI modeli
- Sunucu tarafında anahtar saklama
- Kalıcı sohbet hafızası
- Sesli yanıt (TTS)
