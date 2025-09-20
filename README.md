## ✂️ Kutt-it

Kutt-it is a fun and lightweight URL shortening service that converts long, messy URLs into short, clean, and shareable links. Built with Spring Boot, it provides a simple and efficient way to shorten URLs with unique codes, supporting high scalability and performance.

### 🚀 Features

- **URL Shortening**: Convert long URLs into short, manageable links.
- **Unique Short Codes**: Generate unique base62-encoded short codes using Redis counters.
- **Fast Redirects**: Efficient redirection with Redis caching for optimal performance.
- **RESTful API**: Simple API endpoints for shortening and redirecting URLs.
- **Docker Support**: Containerized setup with Docker Compose for local development and cloud deployment.
- **Scalable Design**: Designed to handle millions of URLs and high traffic.

### 🛠️ Tech Stack

- **Backend**: Java 17, Spring Boot 3.3.5
- **Database**: MongoDB (for URL storage)
- **Cache**: Redis (for counters and caching)
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

2. **Option A: Using Docker (Recommended)**
   ```bash
   docker-compose up --build
   ```
   This will automatically start:
   - Spring Boot application on `http://localhost:8080`
   - MongoDB container
   - Redis container

3. **Option B: Manual Setup**
   - Install dependencies: `mvn clean install`
   - Ensure MongoDB is running on `localhost:27017` with database `kuttit`
   - Ensure Redis is running on `localhost:6379`

### 🚀 Running the Application

**Option A: Using Docker Compose (Recommended)**
```bash
docker-compose up
```
- Application URL: http://localhost:8080
- API Base URL: http://localhost:8080/api

**Option B: Manual Setup**
```bash
mvn spring-boot:run
```
- Application URL: http://localhost:8080
- API Base URL: http://localhost:8080/api

### 📖 API Documentation

#### Shorten a URL
- **Endpoint**: `POST /api/shorten`
- **Request Body**:
  ```json
  {
    "url": "https://example.com/very/long/url"
  }
  ```
- **Response**:
  ```json
  {
    "shortCode": "abc123",
    "shortUrl": "http://localhost:8080/api/r/abc123"
  }
  ```

#### Redirect to Original URL
- **Endpoint**: `GET /api/r/{shortCode}`
- **Example**: `GET /api/r/abc123` → Redirects to the original URL

### 🐳 Docker Configuration

The project includes Docker support for easy local development and cloud deployment:

#### Files
- `Dockerfile` - Optimized Spring Boot container image
- `docker-compose.yml` - Orchestrates Spring Boot, MongoDB, and Redis services
- `.dockerignore` - Excludes unnecessary files from Docker build context

#### Environment Variables
The application supports environment variable configuration for Docker:

```bash
# MongoDB
SPRING_DATA_MONGODB_URI=mongodb://mongodb:27017/kuttit

# Redis
SPRING_DATA_REDIS_HOST=redis
SPRING_DATA_REDIS_PORT=6379
```

#### Building and Running Docker Image Manually
```bash
# Build Docker image
docker build -t kuttit:latest .

# Run single container (requires external MongoDB and Redis)
docker run -p 8080:8080 \
  -e SPRING_DATA_MONGODB_URI=mongodb://your-mongodb:27017/kuttit \
  -e SPRING_DATA_REDIS_HOST=your-redis-host \
  kuttit:latest
```

#### Docker Compose Commands
```bash
# Start services in the background
docker-compose up -d

# View logs
docker-compose logs -f kuttit-app

# Stop services
docker-compose down

# Remove volumes (cleans up database data)
docker-compose down -v
```

### 🏛️ Architecture

For a detailed overview of the system design, including high-level architecture, scaling strategies, and deep dives into URL generation and caching, see [ARCHITECTURE.md](https://github.com/dev-ayush101/kutt-it/blob/main/ARCHITECTURE.md).

### 🚀 Advanced Features Roadmap

For planned enhancements to make Kutt-it more like Bitly (e.g., user auth, analytics, custom aliases), see [ADVANCED_FEATURES.md](https://github.com/dev-ayush101/kutt-it/blob/main/ADVANCED_FEATURES.md).

### 🧪 Testing

Run the tests with:
```bash
mvn test
```

Or using Docker:
```bash
docker-compose run --rm kuttit-app mvn test
```

### 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.