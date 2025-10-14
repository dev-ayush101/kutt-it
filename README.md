# ✂️ Kutt-it

Kutt-it is a feature-rich URL shortening service that converts long, messy URLs into short, clean, and shareable links. Built with Spring Boot, it provides a production-ready backend with user authentication,
analytics, link management, QR code generation, and more.

### 🚀 Features

- **URL Shortening** — Convert long URLs into short base62-encoded links
- **Custom Aliases** — Choose your own memorable short codes
- **URL Expiration** — Set TTL on links; expired aliases are automatically reused
- **User Authentication** — JWT-based register/login with BCrypt password hashing
- **Link Management** — Edit or soft-delete your links (PUT/DELETE)
- **Click Analytics** — Async click tracking with per-link stats (total clicks, clicks by date)
- **Bulk Shortening** — Shorten up to 100 URLs in a single request
- **QR Code Generation** — Generate and persist QR codes as static PNG files
- **Link Tags** — Organize links with tags and filter by tag
- **Rate Limiting** — Bucket4j-based rate limiting (100 req/hr authenticated, 10 req/hr anonymous)
- **Redis Caching** — Fast redirects with 12hr TTL; analytics cached with 5min TTL
- **MongoDB Indexes** — Indexed on shortCode, userId, expirationDate for fast queries
- **Prometheus Monitoring** — Metrics exposed at `/actuator/prometheus`
- **Structured Logging** — SLF4J with MDC request tracing (requestId on every log line)

### 🛠️ Tech Stack

- **Backend**: Java 17, Spring Boot 3.3.5
- **Database**: MongoDB
- **Cache**: Redis
- **Security**: Spring Security, JWT (jjwt)
- **Rate Limiting**: Bucket4j
- **QR Generation**: ZXing
- **Monitoring**: Spring Actuator, Micrometer + Prometheus
- **Containerization**: Docker, Docker Compose
- **Build Tool**: Maven
- **Other**: Lombok, Spring Validation

### 📋 Prerequisites

**Option 1: Using Docker (Recommended)**
- Docker (version 20.10+)
- Docker Compose (version 1.29+)

**Option 2: Manual Setup**
- Java 17 or higher
- Maven 3.6+
- MongoDB (running on localhost:27017)
- Redis (running on localhost:6379)

### 🏗️ Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dev-ayush101/kutt-it.git
   cd kutt-it
   ```

2. Option A: Using Docker (Recommended)
   ```bash
   docker-compose up --build 
   ```

3. Option B: Manual Setup
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   
### 📖 API Documentation

#### Authentication
| Method | Endpoint | Auth Required | Description |
  |--------|----------|:-------------:|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive JWT token |

#### URL Shortening
| Method | Endpoint | Auth Required | Description                           |
  |--------|----------|:-------------:|---------------------------------------|
| POST | `/api/shorten` | Optional | Shorten a single URL                  |
| POST | `/api/shorten/bulk` | Yes | Shorten up to 120 URLs in one request |
| GET | `/api/r/{shortCode}` | No | Redirect to original URL              |

#### Link Management
| Method | Endpoint | Auth Required | Description |
  |--------|----------|:-------------:|-------------|
| GET | `/api/user/links` | Yes | Get all links owned by the user |
| PUT | `/api/links/{shortCode}` | Yes | Update originalUrl, alias, or expiration |
| DELETE | `/api/links/{shortCode}` | Yes | Soft delete a link |
| GET | `/api/links/tags/{tag}` | Yes | Filter owned links by tag |

#### Analytics
| Method | Endpoint | Auth Required | Description |
  |--------|----------|:-------------:|-------------|
| GET | `/api/analytics/{shortCode}` | Yes (owner only) | Get total clicks and clicks by date |

#### QR Codes
| Method | Endpoint | Auth Required | Description |
  |--------|----------|:-------------:|-------------|
| GET | `/api/qr/{shortCode}` | Yes | Generate QR code and return its static URL |
| GET | `/qr/{shortCode}.png` | No | Access the QR code PNG directly |

#### Monitoring
| Method | Endpoint | Auth Required | Description |
  |--------|----------|:-------------:|-------------|
| GET | `/actuator/health` | No | Health check |
| GET | `/actuator/prometheus` | No | Prometheus metrics scrape endpoint |

#### Example: Shorten a URL

```bash
curl -X POST http://localhost:8080/api/shorten \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <TOKEN>" \
-d '{"url": "https://example.com", "customAlias": "my-link", "tags": ["work"]}'
```
```json
{
  "shortCode": "my-link",
  "shortUrl": "http://localhost:8080/api/r/my-link"
}
```

### 🐳 Docker Configuration

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f kuttit-app

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v
```

Environment Variables

```yaml
SPRING_DATA_MONGODB_URI=mongodb://mongodb:27017/kuttit
SPRING_DATA_REDIS_HOST=redis
SPRING_DATA_REDIS_PORT=6379
```

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch: git checkout -b feature/your-feature
3. Commit your changes: git commit -m 'Add some feature'
4. Push to the branch: git push origin feature/your-feature
5. Open a pull request