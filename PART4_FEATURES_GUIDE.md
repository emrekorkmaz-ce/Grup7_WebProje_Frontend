# Part 4 Özellikleri - Kullanım Kılavuzu

## Yeni Eklenen Sayfalar ve Özellikler

### Admin Kullanıcıları İçin

1. **Admin Dashboard** (`/admin/dashboard`)
   - Sidebar'dan "Admin Dashboard" linkine tıklayarak erişebilirsiniz
   - Ana dashboard sayfasında admin paneli kartından da erişilebilir
   - Sistem istatistiklerini gösterir

2. **Analytics Sayfaları** (Sadece Admin)
   - `/admin/analytics/academic` - Akademik Performans Analitiği
   - `/admin/analytics/attendance` - Yoklama Analitiği
   - `/admin/analytics/meal` - Yemek Kullanım Raporları
   - `/admin/analytics/events` - Etkinlik Raporları
   - Sidebar'dan "YÖNETİM" bölümünden erişilebilir

3. **IoT Dashboard** (`/admin/iot`) - Bonus
   - Sidebar'dan "IoT Dashboard" linkine tıklayarak erişebilirsiniz

### Tüm Kullanıcılar İçin

4. **Bildirimler** (`/notifications`)
   - Navbar'daki bildirim ziline tıklayarak erişebilirsiniz
   - Sidebar'dan "Bildirimler" linkine tıklayarak da erişilebilir
   - Tüm bildirimlerinizi görüntüleyebilirsiniz

5. **Bildirim Ayarları** (`/settings/notifications`)
   - Sidebar'dan "Bildirim Ayarları" linkine tıklayarak erişebilirsiniz
   - Hangi bildirimleri hangi kanallardan almak istediğinizi seçebilirsiniz

## Sorun Giderme

### Sayfalar Görünmüyor

1. **Sidebar'da linkler görünmüyor:**
   - Tarayıcıyı yenileyin (Ctrl+F5 veya Cmd+Shift+R)
   - Admin kullanıcısıyla giriş yaptığınızdan emin olun

2. **Bildirim zili görünmüyor:**
   - Navbar'ı kontrol edin
   - Giriş yaptığınızdan emin olun

3. **Sayfalar boş görünüyor:**
   - Backend'in çalıştığından emin olun (http://localhost:5000)
   - Browser console'da hata olup olmadığını kontrol edin (F12)

### API Hataları

- Backend'in çalıştığından emin olun
- `.env` dosyasında `REACT_APP_API_URL=http://localhost:5000` olduğundan emin olun
- CORS hatası alıyorsanız backend'in çalıştığını kontrol edin

### Veritabanı Hataları

- PostgreSQL container'ının çalıştığından emin olun: `docker ps`
- Migration'ların uygulandığından emin olun

## Test Etme

1. Admin kullanıcısıyla giriş yapın
2. Sidebar'da "YÖNETİM" bölümünü kontrol edin
3. Admin Dashboard'a gidin ve metrikleri kontrol edin
4. Analytics sayfalarından birine gidin
5. Bildirim ziline tıklayın
6. Bildirim ayarlarına gidin

