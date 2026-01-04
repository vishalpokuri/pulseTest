# Docker Setup Guide

## Prerequisites

- Docker installed
- Docker Compose installed
- AWS credentials configured

## Environment Setup

1. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

2. Fill in your actual values in `.env`:

- `JWT_SECRET`: A secure random string
- `AWS_REGION`: Your AWS region (e.g., us-east-1)
- `AWS_ACCESS_KEY`: Your AWS access key
- `AWS_SECRET_KEY`: Your AWS secret key
- `AWS_S3_BUCKET`: Your S3 bucket name

## Running the Application

### Start all services

```bash
docker-compose up -d
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f processing-worker
docker-compose logs -f mongodb
```

### Stop all services

```bash
docker-compose down
```

### Rebuild and restart

```bash
docker-compose up -d --build
```

## Services

- **Backend API**: http://localhost:4000
- **Processing Worker**: http://localhost:5000
- **MongoDB**: localhost:27017

## Development Workflow

### Making changes

1. Make code changes in `backend/` or `processing-worker/`
2. Rebuild the specific service:

```bash
docker-compose up -d --build backend
# or
docker-compose up -d --build processing-worker
```

### Access container shell

```bash
docker exec -it pulse-backend sh
docker exec -it pulse-processing-worker sh
docker exec -it pulse-mongodb mongosh
```

### Clean up volumes (WARNING: Deletes all data)

```bash
docker-compose down -v
```

## Production Deployment

For production, update docker-compose.yml:

1. Use environment variables properly
2. Set up proper MongoDB authentication
3. Configure health checks
4. Use reverse proxy (nginx) for SSL
5. Set resource limits

## Troubleshooting

### MongoDB connection issues

```bash
docker-compose logs mongodb
```

### Backend not starting

```bash
docker-compose logs backend
```

### Processing worker not starting

```bash
docker-compose logs processing-worker
```

### Reset everything

```bash
docker-compose down -v
docker-compose up -d --build
```
