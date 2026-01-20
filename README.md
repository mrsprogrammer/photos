# Photo Album Application

Full-stack photo album application with authentication, image management, and labeling system.

## 📸 Features

- ✅ User registration and authentication (JWT)
- ✅ Image upload and management
- ✅ **Label/Tag system** - Organize images with custom labels
- ✅ Image thumbnail generation (Sharp)
- ✅ S3 or local storage support
- ✅ Responsive design
- ✅ PostgreSQL database with TypeORM
- ✅ RESTful API

## 🏗️ Architecture

**Monorepo** with two modules:

- **Frontend**: Next.js + TypeScript + React 19 + Tailwind CSS
- **Backend**: NestJS + TypeScript + PostgreSQL + TypeORM
- **Storage**: AWS S3 or local file system
- **Auth**: JWT-based authentication
- **Database**: PostgreSQL 15

## 🚀 Quick Start

### Local Development

```bash
# Clone repository
git clone <your-repo-url>
cd photos

# Start with Docker Compose
docker compose up -d

# Frontend: http://localhost:3000
# Backend: http://localhost:3002/api
```

### Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit with your values
nano .env
```

## 📦 Project Structure

```
photos/
├── backend/                # NestJS API
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── image/         # Image & Label management
│   │   │   ├── image.entity.ts
│   │   │   ├── label.entity.ts
│   │   │   ├── image.service.ts
│   │   │   ├── label.repository.ts
│   │   │   └── image.controller.ts
│   │   └── migrations/    # Database migrations
│   ├── LABELS_API.md      # Labels API documentation
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Next.js app
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   ├── Dockerfile
│   └── package.json
├── scripts/
│   ├── bootstrap-ec2.sh       # EC2 setup script
│   ├── bootstrap-ec2-qa.sh    # QA EC2 setup
│   └── qa-manage.sh           # QA management CLI
├── docker-compose.yml         # Local development
├── docker-compose.qa.yml      # QA environment
└── docker-compose.prod.yml    # Production environment
```

## 🏷️ Labels Feature

The application now supports organizing images with labels/tags.

### Key Capabilities

- Add multiple labels to each image
- Create reusable labels with custom colors
- Remove labels from images
- List all available labels
- Delete labels (removes from all images)

### API Endpoints

```bash
# Add label to image
POST /images/:id/labels
Body: { "name": "vacation", "color": "#FF5733" }

# Remove label from image
DELETE /images/:id/labels/:labelId

# Get all labels
GET /images/labels/all

# Create new label
POST /images/labels/new
Body: { "name": "important", "color": "#FF0000" }

# Delete label
DELETE /images/labels/:labelId
```

**Full API documentation**: [backend/LABELS_API.md](backend/LABELS_API.md)

### Database Schema

```sql
-- Labels table
labels (id, name, color, createdAt)

-- Many-to-many junction table
image_labels (imageId, labelId)
```

### Migration

```bash
# Apply labels migration
docker exec -i postgres psql -U postgres -d photos_prod < \
  backend/src/migrations/1737370000-CreateLabelsTable.sql
```

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm test

# Label tests specifically
npm test -- image.service.labels.spec

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend E2E Tests

```bash
cd frontend

# Run tests
npm run test:e2e

# Interactive mode
npm run test:ui
```

## 🚢 Deployment

### Deploy to QA

```bash
# Quick deploy
./scripts/qa-manage.sh deploy

# Or push to qa branch
git push origin qa
```

### Deploy to Production

```bash
# Push to main (requires PR approval)
git checkout main
git merge qa
git push origin main
```

**Deployment guides**:
- [DEPLOY_QA.md](DEPLOY_QA.md) - QA environment
- [DEPLOY_EC2.md](DEPLOY_EC2.md) - Production deployment

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Testing**: Playwright

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: TypeORM
- **Auth**: JWT + Passport
- **Storage**: AWS S3 / Local
- **Image Processing**: Sharp

### DevOps
- **Containerization**: Docker + Docker Compose
- **Hosting**: AWS EC2
- **Reverse Proxy**: Traefik
- **SSL**: Let's Encrypt

## 📚 API Documentation

### Authentication

```bash
# Register
POST /auth/signup
Body: { "username": "user", "password": "pass" }

# Login
POST /auth/signin
Body: { "username": "user", "password": "pass" }
Response: { "accessToken": "jwt-token" }
```

### Images

```bash
# Get user's images (with labels)
GET /images
Headers: Authorization: Bearer <token>

# Upload image metadata
POST /images
Body: { "s3Key": "...", "filename": "...", "fileSize": 1024 }

# Delete image
DELETE /images/:id
```

### Labels

See [backend/LABELS_API.md](backend/LABELS_API.md) for complete documentation.

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- User-specific image access control
- Label access control per user
- Environment-based configurations
- HTTPS with Let's Encrypt

## 🤝 Contributing

1. Create feature branch from `develop`
2. Make changes and test locally
3. Push and create PR
4. Wait for review and approval

## 📄 License

UNLICENSED - Private project

---

**Live**: https://my-photo-album.pl  
**QA**: https://qa.my-photo-album.pl

