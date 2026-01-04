# Processing Worker Dockerfile
FROM node:20-bullseye

WORKDIR /app

# Install FFmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create temp directory for video processing
RUN mkdir -p temp

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
