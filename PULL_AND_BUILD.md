# Git Pull ve Docker Build Rehberi

## 1. Git Pull (Arkadaşının Değişikliklerini Çekme)

### Adım 1: Git Remote Kontrolü
```powershell
cd "C:\Users\yagiz\Desktop\git\Web Proje Odevi"
git remote -v
```

Eğer remote yoksa, remote ekleyin:
```powershell
git remote add origin <REPOSITORY_URL>
```

### Adım 2: Değişiklikleri Çekme
```powershell
# Önce mevcut değişiklikleri commit edin veya stash edin
git stash

# Sonra pull yapın
git pull origin master
# veya
git pull origin main
```

### Adım 3: Stash'i Geri Yükleme (Eğer stash yaptıysanız)
```powershell
git stash pop
```

## 2. Docker Build ve Çalıştırma

### Adım 1: .env Dosyası Kontrolü
Proje kök dizininde `.env` dosyası olmalı. Eğer yoksa oluşturun:
```env
DB_NAME=campus_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5432
BACKEND_PORT=5000
FRONTEND_PORT=3000
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

### Adım 2: Docker Compose ile Build ve Çalıştırma

**Tüm servisleri build edip çalıştırma:**
```powershell
cd "C:\Users\yagiz\Desktop\git\Web Proje Odevi"
docker-compose up --build
```

**Sadece build etme (çalıştırmadan):**
```powershell
docker-compose build
```

**Arka planda çalıştırma:**
```powershell
docker-compose up -d --build
```

**Sadece belirli bir servisi rebuild etme:**
```powershell
# Backend için
docker-compose build backend

# Frontend için
docker-compose build frontend
```

### Adım 3: Servisleri Durdurma
```powershell
docker-compose down
```

**Volumes ile birlikte durdurma (veritabanı verilerini siler):**
```powershell
docker-compose down -v
```

### Adım 4: Logları Görüntüleme
```powershell
# Tüm servislerin logları
docker-compose logs

# Belirli bir servisin logları
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Canlı log takibi
docker-compose logs -f
```

## 3. Hızlı Komutlar

### Tüm Değişiklikleri Çekip Rebuild Etme
```powershell
cd "C:\Users\yagiz\Desktop\git\Web Proje Odevi"
git pull origin master
docker-compose down
docker-compose up --build -d
```

### Sadece Frontend'i Rebuild Etme
```powershell
cd "C:\Users\yagiz\Desktop\git\Web Proje Odevi"
git pull origin master
docker-compose build frontend
docker-compose up -d frontend
```

### Sadece Backend'i Rebuild Etme
```powershell
cd "C:\Users\yagiz\Desktop\git\Web Proje Odevi"
git pull origin master
docker-compose build backend
docker-compose restart backend
```

## 4. Sorun Giderme

### Eğer port zaten kullanılıyorsa:
```powershell
# Kullanılan portu kontrol edin
netstat -ano | findstr :5000
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Docker container'ları durdurun
docker-compose down
```

### Eğer build cache sorunu varsa:
```powershell
# Cache olmadan build
docker-compose build --no-cache
```

### Eğer node_modules sorunu varsa:
```powershell
# Container'ı durdur, volume'ları temizle, tekrar başlat
docker-compose down -v
docker-compose up --build
```

