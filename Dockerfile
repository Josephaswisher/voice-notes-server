# Voice Notes Server - One-Click Docker Deploy
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install pipx and Whisper
RUN pip3 install --break-system-packages pipx && \
    pipx install openai-whisper && \
    pipx ensurepath

# Add pipx to PATH
ENV PATH="/root/.local/bin:${PATH}"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create data directories
RUN mkdir -p data/voice-notes data/transcripts

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000/ || exit 1

# Start server
CMD ["node", "server.js"]
