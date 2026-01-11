# 🏭 IP Management & VLAN Segmentation System

**Enterprise-grade IP address management for IT/OT industrial environments**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

---

## 📋 İçindekiler

- [🎯 Genel Bakış](#-genel-bakış)
- [🏗️ Sistem Mimarisi](#️-sistem-mimarisi)
- [🔧 Teknoloji Stack](#-teknoloji-stack)
- [🚀 Hızlı Başlangıç](#-hızlı-başlangıç)
- [🐳 Docker ile Kurulum](#-docker-ile-kurulum)
- [📊 Network Yapısı](#-network-yapısı)
- [🖥️ Kullanıcı Arayüzü](#️-kullanıcı-arayüzü)
- [🔧 Geliştirme](#-geliştirme)
- [📡 API Dokümantasyonu](#-api-dokümantasyonu)
- [🔒 Güvenlik Özellikleri](#-güvenlik-özellikleri)
- [🚀 Production Deployment](#-production-deployment)
- [🛠️ Sorun Giderme](#️-sorun-giderme)
- [📚 Dokümantasyon](#-dokümantasyon)

---

## 🎯 Genel Bakış

**Bosch Rexroth Bursa Fabrikası** için özel olarak tasarlanmış kapsamlı IP yönetim sistemi. IT/OT ağ altyapısında merkezi IP adresi tahsisi, VLAN segmentasyonu ve güvenlik bölgesi yönetimi sağlar.

### ✨ Temel Özellikler

- **🏢 Hiyerarşik Ağ Yönetimi**: Domain → Value Stream → Zone → VLAN → IP yapısı
- **🤖 Otomatik IP Tahsisi**: Rezerve yönetim IP koruması ile akıllı IP üretimi (ilk 6 + son IP)
- **🛡️ Güvenlik Bölgesi Uyumluluğu**: Bosch Rexroth güvenlik standartları (SL3, MFZ_SL4, LOG_SL4, vb.)
- **🎨 Endüstriyel UI**: IT/OT ağ operasyonları için optimize edilmiş React/TypeScript arayüzü
- **⚡ Gerçek Zamanlı Doğrulama**: Sunucu tarafı tutarlılığı ile istemci tarafı doğrulaması
- **📋 Denetim & Uyumluluk**: Tam denetim izi ve güvenlik uyumluluk raporlaması
- **🏭 Çoklu Tesis Ölçeklenebilirliği**: Ek Bosch tesisleri için genişleme tasarımı

### 🏭 Hedef Ortam

- **Manufacturing (MFG)**: A2, A4, A6, A10, MCO üretim hatları
- **Logistics (LOG)**: LOG21 depo sistemleri
- **Facility (FCM)**: Analizörler, kameralar, bina sistemleri
- **Engineering (ENG)**: Mühendislik test tezgahları

---

## 🏗️ Sistem Mimarisi

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   React + TS    │◄──►│   FastAPI       │◄──►│   PostgreSQL    │
│   Tailwind CSS  │    │   SQLAlchemy    │    │   + Redis       │
│   Zustand       │    │   Pydantic      │    │   + Nginx       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🐳 Docker Servisleri

| Servis | Port | Açıklama | Health Check |
|--------|------|----------|--------------|
| **PostgreSQL** | 5432 | Ana veritabanı | `pg_isready` |
| **Redis** | 6379 | Önbellek ve oturum | `redis-cli ping` |
| **FastAPI** | 8000 | Backend API | `curl /health` |
| **React Frontend** | 3000 | Web arayüzü | `curl /` |
| **Nginx** | 80/443 | Reverse proxy | `curl /health` |

---

## 🔧 Teknoloji Stack

### 🎨 Frontend
- **React 18** - Modern UI framework with hooks
- **TypeScript 5.0+** - Type-safe development
- **Tailwind CSS** - Endüstriyel utility-first styling
- **Zustand** - Hafif state management
- **React Hook Form + Zod** - Form işleme ve doğrulama
- **Axios** - Retry logic ve caching ile HTTP client
- **Vite** - Hızlı geliştirme ve optimize build

### ⚙️ Backend
- **Python 3.11+** - Ana geliştirme dili
- **FastAPI** - Yüksek performanslı async API framework
- **SQLAlchemy 2.0** - Async desteği ile modern ORM
- **PostgreSQL 15** - Network data types ile enterprise veritabanı
- **Alembic** - Veritabanı migration yönetimi
- **Pydantic** - Data validation ve serialization

### 🏗️ Infrastructure
- **Docker & Docker Compose** - Containerized deployment
- **Nginx** - Reverse proxy ve load balancing
- **Redis** - Caching ve session management
- **UV** - Hızlı Python package management

---

## 🚀 Hızlı Başlangıç

### 📋 Gereksinimler

- **Docker & Docker Compose** (Önerilen - yerel kurulum gerektirmez)
- VEYA: Python 3.11+, Node.js 18+, PostgreSQL 15+

### 🐳 Docker ile Kurulum (Önerilen)

```bash
# Repository'yi klonlayın
git clone https://github.com/your-org/ip-management.git
cd ip-management

# Environment konfigürasyonunu kopyalayın
cp .env.example .env
# .env dosyasını konfigürasyonunuzla düzenleyin

# Tüm servisleri başlatın
docker-compose up -d

# Örnek veri başlatın (opsiyonel)
docker-compose exec api python scripts/init-sample-data.py

# Uygulamaya erişin
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/api/docs
```

### 💻 Yerel Geliştirme

```bash
# Backend kurulumu
pip install uv
uv sync
cp .env.example .env
# .env dosyasını veritabanı bilgilerinizle düzenleyin
python scripts/run_dev.py

# Frontend kurulumu (yeni terminal)
cd frontend
npm install
cp .env.example .env
# .env dosyasını API URL'inizle düzenleyin
npm run dev

# Uygulamaya erişin
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
```

---

## 🐳 Docker ile Kurulum

### 🚀 Tek Komutla Başlatma

```bash
# Tüm servisleri arka planda başlat
docker-compose up -d

# Servislerin durumunu kontrol et
docker-compose ps
```

### 📊 Servis Durumu Kontrolü

```bash
# Tüm servislerin sağlık durumunu kontrol et
docker-compose ps

# Belirli bir servisin loglarını görüntüle
docker-compose logs -f api          # Backend logs
docker-compose logs -f frontend     # Frontend logs
docker-compose logs -f postgres     # Database logs
docker-compose logs -f redis        # Cache logs

# Gerçek zamanlı tüm logları takip et
docker-compose logs -f
```

### 🔧 Servis Yönetimi

```bash
# Belirli servisleri yeniden başlat
docker-compose restart api frontend

# Servisleri durdur
docker-compose stop

# Servisleri tamamen kaldır (veriler korunur)
docker-compose down

# Servisleri ve volumeleri tamamen kaldır (VERİ SİLİNİR!)
docker-compose down -v
```

### 🛠️ Sorun Giderme Komutları

#### Database Bağlantı Sorunları
```bash
# PostgreSQL servisinin durumunu kontrol et
docker-compose exec postgres pg_isready -U postgres

# Database'e manuel bağlan
docker-compose exec postgres psql -U postgres -d ip_management

# Database loglarını kontrol et
docker-compose logs postgres
```

#### API Servisi Sorunları
```bash
# API health check
curl http://localhost:8000/health

# API container'ına bağlan
docker-compose exec api bash

# Migration durumunu kontrol et
docker-compose exec api alembic current

# Migration çalıştır
docker-compose exec api alembic upgrade head
```

#### Frontend Sorunları
```bash
# Frontend build durumunu kontrol et
docker-compose logs frontend

# Frontend container'ına bağlan
docker-compose exec frontend sh

# Nginx konfigürasyonunu test et
docker-compose exec frontend nginx -t
```

#### Redis Cache Sorunları
```bash
# Redis bağlantısını test et
docker-compose exec redis redis-cli ping

# Cache içeriğini görüntüle
docker-compose exec redis redis-cli keys "*"

# Cache'i temizle
docker-compose exec redis redis-cli flushall
```

### 🔄 Servis Yeniden Başlatma Sırası

Eğer servislerde sorun yaşıyorsanız, aşağıdaki sırayla yeniden başlatın:

```bash
# 1. Önce database ve cache servislerini başlat
docker-compose up -d postgres redis

# 2. Database'in hazır olmasını bekle
docker-compose exec postgres pg_isready -U postgres

# 3. Backend API'yi başlat
docker-compose up -d api

# 4. API'nin hazır olmasını bekle
curl -f http://localhost:8000/health

# 5. Frontend'i başlat
docker-compose up -d frontend

# 6. Nginx'i başlat (production için)
docker-compose --profile production up -d nginx
```

---

## 📊 Network Yapısı

Sistem, hiyerarşik yaklaşım kullanarak ağ altyapısını yönetir:

```
🏢 Domains (İş Alanları)
├── 🏭 MFG (Manufacturing)
│   ├── 🔧 A2, A4, A6, A10, MCO (Üretim Hatları)
│   └── 🛡️ Güvenlik Bölgeleri (MFZ_SL4, SL3)
├── 📦 LOG (Logistics)
│   ├── 🚛 LOG21 (Depo Sistemleri)
│   └── 🛡️ Güvenlik Bölgeleri (LOG_SL4)
├── 🏢 FCM (Facility Management)
│   ├── 🔬 Analizörler, 📹 Kameralar, 🏠 Bina Sistemleri
│   └── 🛡️ Güvenlik Bölgeleri (FMZ_SL4)
└── 🔬 ENG (Engineering)
    ├── 🧪 Test Tezgahları
    └── 🛡️ Güvenlik Bölgeleri (ENG_SL4, LRSZ_SL4, RSZ_SL4)
```

### 🛡️ Güvenlik Sınıflandırmaları

| Kod | Açıklama | Kullanım Alanı |
|-----|----------|----------------|
| **SL3** | Secure BCN | Ofis Ağı, Sunucu Ağı |
| **MFZ_SL4** | Manufacturing Zone | Üretim Bölgesi |
| **LOG_SL4** | Logistics Zone | Lojistik Bölgesi |
| **FMZ_SL4** | Facility Zone | Tesis Bölgesi |
| **ENG_SL4** | Engineering Zone | Mühendislik Bölgesi |
| **LRSZ_SL4** | Local Restricted Zone | Nexeed MES, SQL, Docker |
| **RSZ_SL4** | Restricted Zone | Kısıtlı Bölge |

### 🔒 Rezerve IP Koruması

Sistem otomatik olarak ağ yönetimi IP'lerini rezerve eder:
- **İlk 6 IP**: Ağ altyapısı için rezerve (router, switch, vb.)
- **Son IP**: Broadcast/yönetim amaçları için rezerve
- **Görsel Göstergeler**: Frontend rezerve IP'leri açıkça tahsis edilemez olarak işaretler
- **Doğrulama**: Hem istemci hem sunucu rezerve IP tahsisini engeller

---

## 🖥️ Kullanıcı Arayüzü

### 🎨 Endüstriyel Frontend Özellikleri

- **👨‍💼 Operatör Odaklı Tasarım**: Ağ yöneticileri ve teknisyenler için optimize
- **📱 Responsive Layout**: Üretim ortamlarında masaüstü ve tablet cihazlarda çalışır
- **⚡ Gerçek Zamanlı Doğrulama**: Ağ konfigürasyon hatalarında anında geri bildirim
- **♿ Erişilebilirlik**: Klavye navigasyonu ve ekran okuyucu desteği ile WCAG AAA uyumlu
- **🚀 Performans**: Pagination ve virtual scrolling ile büyük veri setleri için optimize

### 🧭 Ana Arayüz Bölümleri

1. **📊 Dashboard**: Sistem genel bakış, sağlık izleme ve hızlı eylemler
2. **🏢 Domain Yönetimi**: İş domainlerini oluştur ve yönet (MFG, LOG, FCM, ENG)
3. **🔧 VLAN Yönetimi**: Otomatik IP aralığı hesaplaması ile VLAN konfigürasyonu
4. **📋 IP Yönetimi**: MAC adresi takibi ile cihazlara IP adresi tahsisi
5. **📈 Raporlar**: Ağ hiyerarşisi görselleştirme ve uyumluluk raporlaması

### 🎯 Kullanıcı Arayüzü Özellikleri

- **🔧 Domain İkonları**: MFG(🔧), LOG(🚛), FCM(🏢), ENG(🧪)
- **📊 OT-Spesifik KPI'lar**: 
  - Aktif OT Cihazları: 1,247
  - Kayıtlı OT Cihazları: 1,389
  - Aktif IP'ler: 892
  - Bilinmeyen Cihazlar: 142
- **🇹🇷 Türkçe Arayüz**: Bosch Rexroth fabrikası için tam Türkçe destek
- **🎨 Endüstriyel Tasarım**: Renk kodlu elementler ve tooltips

---

## 🔧 Geliştirme

### 🧪 Testleri Çalıştırma

```bash
# Backend testleri
uv run pytest tests/ -v --cov=src

# Frontend testleri
cd frontend
npm test                    # Unit testler
npm run test:coverage      # Coverage raporu
npm run test:property      # Property-based testler
npm run test:e2e          # End-to-end testler

# Canlı test dashboard'u
python scripts/live_test_runner.py
# http://localhost:8080 adresinde test sonuçlarını görüntüle
```

### 📏 Kod Kalitesi

```bash
# Python linting ve formatting
uv run ruff check src/
uv run ruff format src/
uv run mypy src/

# TypeScript kontrolü
cd frontend
npm run type-check
npm run lint
npm run lint:fix
```

### 🗃️ Veritabanı Migration'ları

```bash
# Yeni migration oluştur
alembic revision --autogenerate -m "Açıklama"

# Migration'ları uygula
alembic upgrade head

# Migration geri al
alembic downgrade -1

# Migration geçmişini görüntüle
alembic history

# Mevcut migration durumunu kontrol et
alembic current
```

### 🔄 Geliştirme Workflow'u

```bash
# 1. Yeni özellik branch'i oluştur
git checkout -b feature/yeni-ozellik

# 2. Değişiklikleri yap ve test et
npm test                    # Frontend testleri
uv run pytest             # Backend testleri

# 3. Kod kalitesini kontrol et
npm run lint               # Frontend linting
uv run ruff check src/     # Backend linting

# 4. Commit ve push
git add .
git commit -m "feat: yeni özellik eklendi"
git push origin feature/yeni-ozellik

# 5. Pull request oluştur
```

---

## 📡 API Dokümantasyonu

Çalıştıktan sonra, interaktif API dokümantasyonuna erişin:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

### 🔑 Ana Endpoint'ler

```bash
# Domain Yönetimi
POST   /api/v1/domains              # Domain oluştur
GET    /api/v1/domains              # Domain listesi
PUT    /api/v1/domains/{id}         # Domain güncelle
DELETE /api/v1/domains/{id}         # Domain sil

# VLAN Yönetimi
POST   /api/v1/vlans                # Otomatik IP hesaplaması ile VLAN oluştur
GET    /api/v1/vlans                # VLAN listesi
POST   /api/v1/vlans/validate       # VLAN konfigürasyonu doğrula
POST   /api/v1/vlans/calculate      # VLAN parametrelerini önizle

# IP Yönetimi
POST   /api/v1/ip-assignments       # Cihaza IP tahsis et
GET    /api/v1/ip-assignments       # IP tahsis listesi
GET    /api/v1/vlans/{id}/available-ips  # Kullanılabilir IP'leri getir
GET    /api/v1/vlans/{id}/reserved-ips   # Rezerve IP'leri getir

# Hiyerarşi & Raporlar
GET    /api/v1/reports/hierarchy    # Ağ hiyerarşisi raporu
GET    /api/v1/reports/security     # Güvenlik uyumluluk raporu
GET    /api/v1/health               # Sistem sağlık kontrolü
```

### 📝 API Kullanım Örnekleri

```bash
# Yeni domain oluştur
curl -X POST "http://localhost:8000/api/v1/domains" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MFG",
    "description": "Manufacturing Domain"
  }'

# VLAN oluştur
curl -X POST "http://localhost:8000/api/v1/vlans" \
  -H "Content-Type: application/json" \
  -d '{
    "vlan_id": 100,
    "subnet": "192.168.1.0/24",
    "zone_id": "uuid-here",
    "default_gateway": "192.168.1.1"
  }'

# IP tahsis et
curl -X POST "http://localhost:8000/api/v1/ip-assignments" \
  -H "Content-Type: application/json" \
  -d '{
    "vlan_id": "uuid-here",
    "ci_name": "PLC-001",
    "mac_address": "00:1B:44:11:3A:B7",
    "description": "Production Line PLC"
  }'
```

---

## 🔒 Güvenlik Özellikleri

- **🔍 Input Validation**: IP adresleri, VLAN ID'leri, MAC adreslerinin kapsamlı doğrulaması
- **🛡️ Rezerve IP Koruması**: Yönetim IP tahsisinin otomatik engellenmesi
- **📋 Audit Logging**: Tüm ağ değişiklikleri için tam denetim izi
- **🔐 Güvenlik Bölgesi Zorlaması**: Sıkı güvenlik tipi doğrulaması
- **🚧 Ağ Sınırı Saygısı**: IT/OT ağ segmentasyonu uyumluluğu
- **🔒 CSRF Koruması**: Cross-site request forgery koruması
- **📜 Content Security Policy**: Production'da sıkı CSP başlıkları

### 🔐 Güvenlik Konfigürasyonu

```bash
# .env dosyasında güvenlik ayarları
SECRET_KEY=your-secret-key-change-in-production-32-chars
ALLOWED_HOSTS=localhost,*.bosch.com,*.rexroth.com
CORS_ORIGINS=https://your-frontend-domain.com

# SSL sertifikaları (production için)
# nginx/ssl/ dizinine sertifikalarınızı yerleştirin
```

---

## 📈 Performans

- **⚡ Sub-saniye IP Üretimi**: Otomatik IP tahsisi <1 saniyede tamamlanır
- **🗃️ Veritabanı Optimizasyonu**: Büyük cihaz envanteri için indeksli sorgular
- **🔗 Connection Pooling**: Optimize edilmiş veritabanı bağlantı yönetimi
- **💾 Caching Stratejisi**: Sık erişilen veriler için Redis caching
- **🎨 Frontend Optimizasyonu**: Code splitting, lazy loading ve virtual scrolling

### 📊 Performans Metrikleri

| Metrik | Hedef | Mevcut |
|--------|-------|--------|
| IP Tahsis Süresi | <1s | ~0.3s |
| API Response Time | <200ms | ~150ms |
| Frontend Load Time | <3s | ~2.1s |
| Database Query Time | <100ms | ~75ms |

---

## 🚀 Production Deployment

### 🌍 Production Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/ip_management
REDIS_URL=redis://localhost:6379/0

# Security Configuration
SECRET_KEY=your-secret-key-change-in-production-32-chars
ALLOWED_HOSTS=localhost,*.bosch.com,*.rexroth.com
CORS_ORIGINS=https://your-frontend-domain.com

# Application Configuration
PLANT_CODE=BURSA
ORGANIZATION="Bosch Rexroth"
LOG_LEVEL=INFO

# Frontend Configuration
VITE_API_URL=https://your-api-domain.com/api/v1
VITE_PLANT_CODE=BURSA
VITE_ORGANIZATION="Bosch Rexroth"
```

### 🐳 Docker Production Deployment

```bash
# Production profili ile deploy et
docker-compose --profile production up -d

# Veya individual servisleri build et
docker build -f Dockerfile.backend -t ip-management-api .
docker build -f frontend/Dockerfile.frontend -t ip-management-frontend ./frontend

# Servisleri ihtiyaca göre scale et
docker-compose up -d --scale api=3 --scale frontend=2

# SSL sertifikalarını konfigüre et
# nginx/ssl/ dizinine sertifikalarınızı yerleştirin
```

### 🔧 Production Checklist

- [ ] Environment variables konfigüre edildi
- [ ] SSL sertifikaları yüklendi
- [ ] Database backup stratejisi kuruldu
- [ ] Monitoring ve logging konfigüre edildi
- [ ] Firewall kuralları ayarlandı
- [ ] Health check endpoint'leri test edildi
- [ ] Load balancing konfigüre edildi
- [ ] Security headers ayarlandı

---

## 🛠️ Sorun Giderme

### 🚨 Yaygın Sorunlar ve Çözümleri

#### 1. Docker Servisleri Başlamıyor

```bash
# Servislerin durumunu kontrol et
docker-compose ps

# Logları kontrol et
docker-compose logs

# Port çakışması kontrolü
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000
netstat -tulpn | grep :5432

# Docker'ı yeniden başlat
docker-compose down
docker-compose up -d
```

#### 2. Database Bağlantı Hatası

```bash
# PostgreSQL servisinin çalıştığını kontrol et
docker-compose exec postgres pg_isready

# Database'e manuel bağlan
docker-compose exec postgres psql -U postgres -d ip_management

# Migration durumunu kontrol et
docker-compose exec api alembic current

# Migration'ları çalıştır
docker-compose exec api alembic upgrade head
```

#### 3. Frontend Build Hatası

```bash
# Node modules'ları temizle ve yeniden yükle
cd frontend
rm -rf node_modules package-lock.json
npm install

# TypeScript hatalarını kontrol et
npm run type-check

# Build'i test et
npm run build
```

#### 4. API Health Check Başarısız

```bash
# API servisinin çalıştığını kontrol et
curl http://localhost:8000/health

# API loglarını kontrol et
docker-compose logs api

# Database bağlantısını test et
docker-compose exec api python -c "
from src.ip_management.database import engine
print('Database connection:', engine.url)
"
```

#### 5. Redis Cache Sorunları

```bash
# Redis bağlantısını test et
docker-compose exec redis redis-cli ping

# Cache'i temizle
docker-compose exec redis redis-cli flushall

# Redis memory kullanımını kontrol et
docker-compose exec redis redis-cli info memory
```

### 📋 Debug Komutları

```bash
# Tüm container'ların resource kullanımını görüntüle
docker stats

# Belirli bir container'ın detaylarını görüntüle
docker inspect ip_management_api

# Container'a shell ile bağlan
docker-compose exec api bash
docker-compose exec frontend sh

# Network bağlantılarını kontrol et
docker network ls
docker network inspect ip-management_ip_management_network
```

### 🔍 Log Analizi

```bash
# Tüm servislerin loglarını gerçek zamanlı takip et
docker-compose logs -f

# Belirli bir zaman aralığındaki logları görüntüle
docker-compose logs --since="2024-01-01T00:00:00" --until="2024-01-01T23:59:59"

# Hata loglarını filtrele
docker-compose logs | grep -i error

# API request loglarını takip et
docker-compose logs -f api | grep -E "(GET|POST|PUT|DELETE)"
```

---

## 📚 Dokümantasyon

### 📖 Detaylı Dokümantasyon

- [Frontend Dokümantasyonu](frontend/README.md) - Detaylı frontend kurulum ve geliştirme rehberi
- [API Dokümantasyonu](http://localhost:8000/api/docs) - Tam API referansı
- [Docker Kurulum Rehberi](DOCKER_SETUP.md) - Docker deployment talimatları
- [Docker Rebuild Rehberi](DOCKER_REBUILD_GUIDE.md) - Container yeniden build rehberi
- [Frontend Kurulum Rehberi](frontend/SETUP_GUIDE.md) - Frontend geliştirme ortamı kurulumu

### 🎯 Kullanım Senaryoları

#### Yeni Domain Oluşturma
1. Dashboard'a gidin
2. "Domain Management" sekmesine tıklayın
3. "Add Domain" butonuna tıklayın
4. Domain bilgilerini girin (MFG, LOG, FCM, ENG)
5. "Save" butonuna tıklayın

#### VLAN Konfigürasyonu
1. "Network Configuration" → "VLAN Management"
2. "Add VLAN" butonuna tıklayın
3. VLAN ID, subnet, gateway bilgilerini girin
4. Sistem otomatik olarak IP aralığını hesaplar
5. Konfigürasyonu kaydedin

#### IP Tahsisi
1. "IP Management" → "Device Assignment"
2. Cihaz bilgilerini girin (CI Name, MAC Address)
3. VLAN seçin
4. Otomatik IP tahsisi için "Auto Assign" veya manuel IP girin
5. "Assign IP" butonuna tıklayın

### 🔧 API Entegrasyonu

```python
# Python ile API kullanımı
import requests

# Domain oluştur
response = requests.post(
    "http://localhost:8000/api/v1/domains",
    json={
        "name": "MFG",
        "description": "Manufacturing Domain"
    }
)

# VLAN oluştur
response = requests.post(
    "http://localhost:8000/api/v1/vlans",
    json={
        "vlan_id": 100,
        "subnet": "192.168.1.0/24",
        "zone_id": "uuid-here",
        "default_gateway": "192.168.1.1"
    }
)

# IP tahsis et
response = requests.post(
    "http://localhost:8000/api/v1/ip-assignments",
    json={
        "vlan_id": "uuid-here",
        "ci_name": "PLC-001",
        "mac_address": "00:1B:44:11:3A:B7",
        "description": "Production Line PLC"
    }
)
```

---

## 🤝 Katkıda Bulunma

1. Repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### 📋 Geliştirme Kuralları

- Python kodu için PEP 8'i takip edin
- Tüm frontend kodu için TypeScript kullanın
- Yeni özellikler için test yazın (unit, property-based, ve E2E)
- API değişiklikleri için dokümantasyonu güncelleyin
- PR göndermeden önce tüm testlerin geçtiğinden emin olun
- Conventional commit mesajlarını takip edin

### 🧪 Test Gereksinimleri

```bash
# Tüm testlerin geçmesi gerekli
npm test                    # Frontend testleri
uv run pytest             # Backend testleri
npm run test:e2e           # E2E testleri

# Code coverage minimum %80 olmalı
npm run test:coverage      # Frontend coverage
uv run pytest --cov=src   # Backend coverage
```

---

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👥 Yazarlar

- **Şevket Binali** - *İlk geliştirme* - [GitHub Profile](https://github.com/sevketbinali)

---

## 🏢 Organizasyon

**Bosch Rexroth Bursa Fabrikası**  
IT/OT Ağ Altyapısı Yönetimi  
Endüstriyel Otomasyon & Kontrol Sistemleri

---

## 📞 Destek

Sorularınız veya sorunlarınız için:

- 📧 **Email**: [destek@bosch-rexroth.com](mailto:destek@bosch-rexroth.com)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-org/ip-management/issues)
- 📚 **Dokümantasyon**: [Wiki](https://github.com/your-org/ip-management/wiki)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-org/ip-management/discussions)

---

## 🎯 Roadmap

### 🚀 Yakın Dönem (Q1 2024)
- [ ] LDAP/Active Directory entegrasyonu
- [ ] Gelişmiş raporlama dashboard'u
- [ ] Mobile responsive iyileştirmeleri
- [ ] Bulk IP import/export özelliği

### 🔮 Orta Vadeli (Q2-Q3 2024)
- [ ] Multi-tenant desteği
- [ ] REST API v2 geliştirmeleri
- [ ] Grafana monitoring entegrasyonu
- [ ] Automated backup sistemi

### 🌟 Uzun Vadeli (Q4 2024+)
- [ ] AI-powered network optimization
- [ ] IoT device auto-discovery
- [ ] Multi-site federation
- [ ] Advanced security analytics

---

*Endüstriyel ağ yönetimi için ❤️ ile geliştirilmiştir*

**🏭 Bosch Rexroth Bursa Factory | IT/OT Network Infrastructure Management**