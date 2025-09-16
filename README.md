## ✂️ Kutt-it

Kutt-it is a fun and lightweight URL shortening service that converts long, messy URLs into short, clean, and shareable links. Built with Spring Boot, it provides a simple and efficient way to shorten URLs with unique codes, supporting high scalability and performance.

### 🚀 Features

- **URL Shortening**: Convert long URLs into short, manageable links.
- **Unique Short Codes**: Generate unique base62-encoded short codes using Redis counters.
- **Fast Redirects**: Efficient redirection with Redis caching for optimal performance.
- **RESTful API**: Simple API endpoints for shortening and redirecting URLs.
- **Scalable Design**: Designed to handle millions of URLs and high traffic.

### 🛠️ Tech Stack

- **Backend**: Java 17, Spring Boot 3.3.5
- **Database**: MongoDB (for URL storage)
- **Cache**: Redis (for counters and caching)
- **Build Tool**: Maven
- **Other**: Lombok, Spring Validation

### 📋 Prerequisites

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

2. **Install dependencies**:
   ```bash
   mvn clean install
   ```

3. **Set up databases**:
   - Ensure MongoDB is running on `localhost:27017` with database `kuttit`.
   - Ensure Redis is running on `localhost:6379`.

### 🚀 Running the Application

1. **Start the application**:
   ```bash
   mvn spring-boot:run
   ```

2. **Access the application**:
   - Web UI: http://localhost:8080
   - API endpoints: See below

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

### 🏛️ Architecture

For a detailed overview of the system design, including high-level architecture, scaling strategies, and deep dives into URL generation and caching, see [ARCHITECTURE.md](https://github.com/dev-ayush101/kutt-it/blob/main/ARCHITECTURE.md).

### 🚀 Advanced Features Roadmap

For planned enhancements to make Kutt-it more like Bitly (e.g., user auth, analytics, custom aliases), see [ADVANCED_FEATURES.md](https://github.com/dev-ayush101/kutt-it/blob/main/ADVANCED_FEATURES.md).

### 🧪 Testing

Run the tests with:
```bash
  mvn test
```

### 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.