# IP Management Frontend

Industrial-grade React/TypeScript frontend for IP Management & VLAN Segmentation System at Bosch Rexroth facilities.

## Features

- **Domain Management**: Manage business domains (MFG, LOG, FCM, ENG)
- **VLAN Configuration**: Create and manage network VLANs with automatic IP allocation
- **IP Address Management**: Assign and track device IP addresses with reserved IP protection
- **Security Zone Management**: Configure security levels and zone assignments
- **Real-time Validation**: Client-side validation with server-side consistency
- **Industrial UI/UX**: Optimized for operator workflows in production environments
- **Docker Ready**: Fully containerized for consistent deployment

## Technology Stack

- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for industrial-grade styling
- **Zustand** for state management
- **React Hook Form + Zod** for form validation
- **Axios** for API communication with retry logic
- **React Router** for navigation
- **Headless UI** for accessible components
- **Jest + React Testing Library** for unit testing
- **fast-check** for property-based testing
- **Playwright** for end-to-end testing

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for containerized deployment)

### Development Setup

1. **Clone and navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:5173
   ```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
# API Configuration
VITE_API_URL=http://localhost:8000/api/v1
VITE_PLANT_CODE=BURSA
VITE_ORGANIZATION="Bosch Rexroth"

# Performance Settings
VITE_API_TIMEOUT=30000
VITE_CACHE_DURATION=300000
VITE_PAGINATION_SIZE=50

# Feature Flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

## Docker Deployment

### Build and Run with Docker

1. **Build the Docker image**
   ```bash
   docker build -f Dockerfile.frontend -t ip-management-frontend .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:80 \
     -e VITE_API_URL=http://your-api-server:8000/api/v1 \
     -e VITE_PLANT_CODE=BURSA \
     -e VITE_ORGANIZATION="Bosch Rexroth" \
     ip-management-frontend
   ```

3. **Access the application**
   ```
   http://localhost:3000
   ```

### Docker Compose Deployment

Use the provided `docker-compose.yml` in the root directory:

```bash
# From project root
docker-compose up frontend
```

### Environment Variables for Docker

Set these environment variables for Docker deployment:

```bash
# Frontend Configuration
FRONTEND_API_URL=http://localhost:8000/api/v1
PLANT_CODE=BURSA
ORGANIZATION="Bosch Rexroth"
FRONTEND_PORT=3000

# Performance Tuning
FRONTEND_API_TIMEOUT=30000
FRONTEND_CACHE_DURATION=300000
FRONTEND_PAGINATION_SIZE=50

# Feature Flags
FRONTEND_ENABLE_DEBUG=false
FRONTEND_ENABLE_ANALYTICS=true
```

## Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:property    # Run property-based tests
npm run test:e2e         # Run end-to-end tests
```

## Docker Management Commands

### Build Commands

```bash
# Build development image
docker build -f Dockerfile.frontend -t ip-management-frontend:dev .

# Build production image with build args
docker build -f Dockerfile.frontend \
  --build-arg VITE_API_URL=https://api.production.com/api/v1 \
  --build-arg VITE_PLANT_CODE=BURSA \
  --build-arg VITE_ORGANIZATION="Bosch Rexroth" \
  -t ip-management-frontend:prod .
```

### Run Commands

```bash
# Run with environment variables
docker run -d \
  --name ip-management-frontend \
  -p 3000:80 \
  -e VITE_API_URL=http://localhost:8000/api/v1 \
  -e VITE_PLANT_CODE=BURSA \
  ip-management-frontend:latest

# Run with custom configuration
docker run -d \
  --name ip-management-frontend \
  -p 3000:80 \
  --env-file .env.production \
  ip-management-frontend:latest
```

### Management Commands

```bash
# Stop container
docker stop ip-management-frontend

# Start container
docker start ip-management-frontend

# Restart container
docker restart ip-management-frontend

# View logs
docker logs ip-management-frontend

# Remove container
docker rm ip-management-frontend

# Remove image
docker rmi ip-management-frontend
```

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── Layout.tsx     # Main layout component
│   │   ├── Dashboard.tsx  # Dashboard page
│   │   └── ...            # Feature components
│   ├── services/          # API services
│   ├── stores/            # Zustand state stores
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── test/              # Test utilities
│   └── main.tsx           # Application entry point
├── Dockerfile.frontend    # Production Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
└── README.md              # This file
```

## Key Features

### Industrial UI/UX Design

- **Operator-Focused**: Designed for industrial operators and network administrators
- **Accessibility**: WCAG AAA compliant with keyboard navigation and screen reader support
- **Responsive**: Optimized for desktop and tablet usage in production environments
- **Performance**: Optimized for large datasets with pagination and virtual scrolling

### Network Management

- **Reserved IP Protection**: Visual indication and enforcement of reserved IP ranges (first 6 + last)
- **VLAN Validation**: Real-time validation of VLAN configurations and subnet overlaps
- **Firewall Integration**: Track firewall assignments and rule review dates
- **Security Zones**: Support for all Bosch Rexroth security levels (SL3, MFZ_SL4, etc.)

### Data Management

- **Real-time Validation**: Client-side validation that mirrors server business rules
- **Optimistic Updates**: Immediate UI updates with rollback on errors
- **Caching**: Intelligent caching with automatic invalidation
- **Error Recovery**: Comprehensive error handling with user-friendly messages

## Testing

The frontend includes comprehensive testing:

- **Unit Tests**: Component and utility function testing
- **Property Tests**: Property-based testing for validation logic
- **Integration Tests**: API integration and state management testing
- **E2E Tests**: End-to-end user workflow testing

Run tests:

```bash
# All tests
npm test

# Unit tests only
npm run test -- --testPathPattern="test\\.tsx?$"

# Property tests only
npm run test:property

# Coverage report
npm run test:coverage
```

## Performance Optimization

- **Code Splitting**: Automatic code splitting by route and feature
- **Bundle Analysis**: Optimized bundle size with tree shaking
- **Caching**: Response caching with configurable TTL
- **Lazy Loading**: Lazy loading of components and routes
- **Virtual Scrolling**: For large data tables and lists

## Security

- **Input Validation**: Comprehensive client-side validation
- **XSS Protection**: Sanitized user inputs and outputs
- **CSRF Protection**: CSRF token handling for API requests
- **Content Security Policy**: Strict CSP headers in production
- **Secure Headers**: Security headers configured in Nginx

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Check `VITE_API_URL` environment variable
   - Verify backend API is running and accessible
   - Check network connectivity and firewall rules

2. **Build Issues**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear build cache: `rm -rf dist && npm run build`
   - Check Node.js version compatibility

3. **Docker Issues**
   - Check Docker daemon is running
   - Verify port availability: `netstat -an | grep 3000`
   - Check container logs: `docker logs ip-management-frontend`

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Development
VITE_ENABLE_DEBUG=true npm run dev

# Docker
docker run -e VITE_ENABLE_DEBUG=true ip-management-frontend
```

## Contributing

1. Follow the established code style and conventions
2. Write tests for new features and bug fixes
3. Update documentation for API changes
4. Use conventional commit messages
5. Ensure all tests pass before submitting

## License

MIT License - See LICENSE file for details.

## Support

For technical support and questions:
- Check the troubleshooting section above
- Review the API documentation at `/api/docs`
- Contact the development team for Bosch Rexroth specific configurations