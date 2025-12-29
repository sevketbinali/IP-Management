# Docker Setup Guide for IP Management System

Bu rehber Docker kullanarak npm install ve frontend geliştirme işlemlerini nasıl yapacağınızı gösterir.

## Hızlı Başlangıç

### Windows PowerShell
```powershell
# Otomatik kurulum scripti çalıştır
.\scripts\docker-dev-setup.ps1

# Veya direkt komutlar:
.\scripts\docker-dev-setup.ps1 -Action install    # npm install
.\scripts\docker-dev-setup.ps1 -Action start      # dev environment başlat
.\scripts\docker-dev-setup.ps1 -Action stop       # durdur
```

### Linux/Mac Bash
```bash
# Script'i çalıştırılabilir yap
chmod +x scripts/docker-dev-setup.sh

# Otomatik kurulum scripti çalıştır
./scripts/docker-dev-setup.sh

# Veya direkt komutlar için menüyü kullan
```

## Manuel Docker Komutları

### 1. Frontend Dependencies Kurulumu (npm install)
```bash
# Geçici container ile npm install
docker run --rm \
  -v "$(pwd)/frontend:/app" \
  -v "frontend_node_modules:/app/node_modules" \
  -w /app \
  node:18-alpine \
  npm install
```

**Windows PowerShell:**
```powershell
docker run --rm `
  -v "${PWD}/frontend:/app" `
  -v "frontend_node_modules:/app/node_modules" `
  -w /app `
  node:18-alpine `
  npm install
```

### 2. Development Server Başlatma
```bash
# Development environment başlat
docker-compose -f docker-compose.dev.yml up -d

# Logları takip et
docker-compose -f docker-compose.dev.yml logs -f frontend-dev
```

### 3. Diğer NPM Komutları
```bash
# npm run build
docker run --rm \
  -v "$(pwd)/frontend:/app" \
  -v "frontend_node_modules:/app/node_modules" \
  -w /app \
  node:18-alpine \
  npm run build

# npm run lint
docker run --rm \
  -v "$(pwd)/frontend:/app" \
  -v "frontend_node_modules:/app/node_modules" \
  -w /app \
  node:18-alpine \
  npm run lint
```

### 4. Container Shell'e Girme
```bash
# Frontend container'ına shell ile bağlan
docker run --rm -it \
  -v "$(pwd)/frontend:/app" \
  -v "frontend_node_modules:/app/node_modules" \
  -w /app \
  node:18-alpine \
  sh
```

## Mevcut Container'a Bağlanma

Eğer zaten çalışan bir container varsa:

```bash
# Çalışan container'ları listele
docker ps

# Container'a bağlan (container_name yerine gerçek ismi yazın)
docker exec -it ip_management_frontend_dev sh

# Container içinde npm komutları çalıştır
npm install
npm run dev
npm run build
```

## Sorun Giderme

### Port Çakışması
Eğer port 3000 kullanılıyorsa:
```bash
# Farklı port kullan
docker run --rm \
  -v "$(pwd)/frontend:/app" \
  -v "frontend_node_modules:/app/node_modules" \
  -w /app \
  -p 3001:3000 \
  node:18-alpine \
  npm run dev -- --port 3000 --host 0.0.0.0
```

### Volume Sorunları
```bash
# Node modules volume'unu temizle
docker volume rm frontend_node_modules

# Yeniden npm install
docker run --rm \
  -v "$(pwd)/frontend:/app" \
  -v "frontend_node_modules:/app/node_modules" \
  -w /app \
  node:18-alpine \
  npm install
```

### Container Temizleme
```bash
# Tüm container'ları durdur
docker-compose -f docker-compose.dev.yml down

# Volume'ları da sil
docker-compose -f docker-compose.dev.yml down -v

# Kullanılmayan volume'ları temizle
docker volume prune -f
```

## Önerilen Workflow

1. **İlk Kurulum:**
   ```bash
   # Script ile otomatik kurulum
   .\scripts\docker-dev-setup.ps1
   # Menüden "1" seçin (npm install)
   ```

2. **Development Başlatma:**
   ```bash
   # Menüden "2" seçin (start dev environment)
   # Veya direkt:
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Geliştirme:**
   - Frontend: http://localhost:3000
   - Hot reload otomatik çalışır
   - Kod değişiklikleri anında yansır

4. **Durdurma:**
   ```bash
   # Menüden "6" seçin (stop all containers)
   # Veya direkt:
   docker-compose -f docker-compose.dev.yml down
   ```

## Avantajlar

✅ **Node.js kurulumu gerektirmez** - Sadece Docker yeterli  
✅ **Temiz environment** - Her seferinde temiz Node.js ortamı  
✅ **Version consistency** - Herkes aynı Node.js versiyonunu kullanır  
✅ **Easy cleanup** - Container'ı silmek yeterli  
✅ **Hot reload** - Kod değişiklikleri anında yansır  

## Dosya Yapısı

```
IP-Management/
├── docker-compose.dev.yml          # Development environment
├── scripts/
│   ├── docker-dev-setup.ps1        # Windows PowerShell script
│   └── docker-dev-setup.sh         # Linux/Mac bash script
└── frontend/
    ├── package.json
    ├── src/
    └── ...
```